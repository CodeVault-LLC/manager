import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

import logger from '../logger'
import {
  EServiceStatus,
  EServiceType,
  IServiceStatus
} from '@manager/common/src'

type TypedServiceClient = Record<string, (...args: any[]) => Promise<any>>

type ServiceRecord<T = any> = {
  server?: grpc.Server
  address: string
  token: string
  client: T
  child?: ChildProcessWithoutNullStreams
  startedAt: number
  binaryPath?: string
  crashed?: boolean
}

class ServiceManager {
  private services = new Map<string, ServiceRecord>()

  async startService<TClient extends TypedServiceClient>({
    protoPath,
    packageName,
    serviceName,
    implementation,
    customPort,
    bin
  }: {
    protoPath: string
    packageName: string
    serviceName: string
    implementation?: grpc.UntypedServiceImplementation
    customPort?: number
    bin?: string
  }): Promise<{ address: string; token: string }> {
    const key = `${packageName}.${serviceName}`
    if (this.services.has(key)) {
      logger.warn(`Service ${key} already started`)
      const svc = this.services.get(key)!
      return { address: svc.address, token: svc.token }
    }

    const token = crypto.randomBytes(16).toString('hex')
    const packageDef = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    })

    const loaded = grpc.loadPackageDefinition(packageDef)
    const serviceDef = loaded[packageName]?.[serviceName]

    if (!serviceDef)
      throw new Error(`Service not found: ${packageName}.${serviceName}`)

    const port = customPort ?? (await getAvailablePort())
    const address = `127.0.0.1:${port}`
    const startedAt = Date.now()

    let server: grpc.Server | undefined
    let child: ChildProcessWithoutNullStreams | undefined

    if (implementation && !bin) {
      server = new grpc.Server()

      const wrappedImpl: grpc.UntypedServiceImplementation = {}
      for (const method in implementation) {
        wrappedImpl[method] = (call: any, callback: any) => {
          const auth = call.metadata.get('authorization')[0]
          if (auth !== token) {
            logger.warn(`[AUTH FAIL] ${packageName}.${serviceName}.${method}`)
            return callback({
              code: grpc.status.UNAUTHENTICATED,
              message: 'Invalid token'
            })
          }

          logger.info(`[gRPC CALL] ${packageName}.${serviceName}.${method}`)
          return implementation[method](call, callback)
        }
      }

      server.addService(serviceDef.service, wrappedImpl)

      await new Promise<void>((resolve, reject) => {
        server!.bindAsync(
          address,
          grpc.ServerCredentials.createInsecure(),
          (err) => (err ? reject(err) : resolve())
        )
      })

      server.start()
      logger.info(`✅ Started ${key} (in-process) on ${address}`)
    }

    if (bin) {
      logger.info(`🔄 Starting ${key} from binary: ${bin}`)
      if (!existsSync(bin)) {
        logger.error(`❌ Binary not found: ${bin}`)
        return Promise.reject(new Error(`Binary not found: ${bin}`))
      }

      child = spawn(bin, ['--port', port.toString()], {
        stdio: 'pipe',
        env: {
          ...process.env,
          GRPC_PORT: port.toString(),
          GRPC_TOKEN: token
        }
      })

      child.on('error', (err) => {
        logger.error(`❌ Binary error in ${key}:`, err)
        const svc = this.services.get(key)
        if (svc) svc.crashed = true
      })

      child.on('exit', (code) => {
        const svc = this.services.get(key)
        if (svc) svc.crashed = code !== 0
        logger[code === 0 ? 'info' : 'error'](
          `🚪 Service ${key} exited ${code === 0 ? 'gracefully' : `with code ${code}`}`
        )
      })

      await waitForGrpcStartup(address, 4000)
    }

    const client = new (serviceDef as any)(
      address,
      grpc.credentials.createInsecure()
    ) as TClient

    this.services.set(key, {
      server,
      address,
      token,
      client,
      child,
      startedAt,
      binaryPath: bin
    })

    return { address, token }
  }

  getClient<TClient = any>(packageName: string, serviceName: string): TClient {
    const key = `${packageName}.${serviceName}`
    const service = this.services.get(key)
    if (!service) throw new Error(`Service not started: ${key}`)

    const metadata = new grpc.Metadata()
    metadata.set('authorization', service.token)

    const proxy = new Proxy(service.client, {
      get(target, prop) {
        const method = (target as any)[prop]
        if (typeof method !== 'function') return method
        return (req: any, cb: any) => method.call(target, req, metadata, cb)
      }
    })

    return proxy as TClient
  }

  stopService(packageName: string, serviceName: string) {
    const key = `${packageName}.${serviceName}`
    const svc = this.services.get(key)
    if (!svc) return

    svc.server?.forceShutdown()

    if (svc.child) {
      svc.child.kill('SIGTERM')
      logger.info(`🛑 Sent SIGTERM to binary for ${key}`)
    }

    this.services.delete(key)
    logger.info(`🛑 Stopped ${key}`)
  }

  async stopAllServices() {
    for (const key of this.services.keys()) {
      const [packageName, serviceName] = key.split('.')
      this.stopService(packageName, serviceName)
    }
  }

  listServices() {
    return [...this.services.keys()]
  }

  getServiceStatus() {
    return [...this.services.entries()].map(([key, svc]) => {
      const testFetch = async () => {
        try {
          const client = this.getClient(key.split('.')[0], key.split('.')[1])
          await client.test({}) // Assuming a 'test' method exists
          return true
        } catch (error) {
          logger.error(`Service ${key} is not operational:`, error)
          return false
        }
      }

      testFetch().catch((err) => {
        logger.error(`Error testing service ${key}:`, err)
      })

      const data: IServiceStatus = {
        lastUpdated: new Date(),
        name: key,
        description: `${svc.server ? 'In-process' : 'Binary'} service`,
        status: svc.server ? EServiceStatus.OPERATIONAL : EServiceStatus.OUTAGE,
        type: EServiceType.API,
        responseTime: 0 // Placeholder, should be calculated based on actual requests
      }

      return data
    })
  }
}

// Utility: Wait for a gRPC server to be ready
async function waitForGrpcStartup(
  address: string,
  timeoutMs = 4000
): Promise<void> {
  const { credentials, Client } = await import('@grpc/grpc-js')
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const client = new Client(address, credentials.createInsecure())
    client.waitForReady(deadline, (err) => {
      if (err) {
        reject(new Error(`gRPC server at ${address} not ready in time.`))
      } else {
        resolve()
      }
    })
  })
}

// Dynamic free port allocation
async function getAvailablePort(): Promise<number> {
  const net = await import('node:net')
  return await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, () => {
      const port = (server.address() as any).port
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}

export const manager = new ServiceManager()
