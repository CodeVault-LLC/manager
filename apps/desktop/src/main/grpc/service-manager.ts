import crypto from 'node:crypto'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

import logger from '../logger'

type TypedServiceClient = Record<string, (...args: any[]) => Promise<any>>

type ServiceRecord<T = any> = {
  server?: grpc.Server
  address: string
  token: string
  client: T
}

class ServiceManager {
  private services = new Map<string, ServiceRecord>()

  async startService<TClient extends TypedServiceClient>({
    protoPath,
    packageName,
    serviceName,
    implementation, // Optional now
    customPort
  }: {
    protoPath: string
    packageName: string
    serviceName: string
    implementation?: grpc.UntypedServiceImplementation
    customPort?: number
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

    if (!serviceDef) {
      throw new Error(`Service not found: ${packageName}.${serviceName}`)
    }

    const port = customPort ?? (await getAvailablePort())
    const address = `127.0.0.1:${port}`

    let server: grpc.Server | undefined

    // If implementation provided, spin up a local server
    if (implementation) {
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
      logger.info(`✅ Started ${packageName}.${serviceName} on ${address}`)
    }

    const client = new serviceDef(
      address,
      grpc.credentials.createInsecure()
    ) as TClient

    this.services.set(key, { server, address, token, client })

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
    this.services.delete(key)
    logger.info(`🛑 Stopped ${key}`)
  }

  listServices() {
    return [...this.services.keys()]
  }
}

// Dynamic free port
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
