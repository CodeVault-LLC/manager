import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import crypto from 'node:crypto'
import { existsSync } from 'node:fs'
import { performance } from 'node:perf_hooks'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

import logger from '../logger'
import {
  EServiceStatus,
  EServiceType,
  IpcServiceLog,
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
  crashCount: number
  responseTimes: number[]
  lastCheck: number
  lastHeartbeat?: number
  status: keyof typeof EServiceStatus
}

class ServiceManager {
  private services = new Map<string, ServiceRecord>()
  private binaries = new Map<
    string,
    { child: ChildProcessWithoutNullStreams; port: number }
  >()
  private crashRetries = new Map<string, number>()
  private logs: IpcServiceLog[] = []

  constructor() {
    setInterval(() => this.monitorHealth(), 5000)
    setInterval(() => this.monitorCrashes(), 10000)
  }

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

    let port = customPort
    const startedAt = Date.now()
    let server: grpc.Server | undefined
    let child: ChildProcessWithoutNullStreams | undefined

    if (implementation && !bin) {
      port = port ?? (await getAvailablePort())
      const address = `127.0.0.1:${port}`

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

          const start = performance.now()
          logger.info(`[gRPC CALL] ${packageName}.${serviceName}.${method}`)

          const done = (err: any, res: any) => {
            const time = performance.now() - start
            const svc = this.services.get(key)
            if (svc) {
              svc.responseTimes.push(time)
              if (svc.responseTimes.length > 100) svc.responseTimes.shift()
            }
            callback(err, res)
          }

          implementation[method](call, done)
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

      const client = new (serviceDef as any)(
        address,
        grpc.credentials.createInsecure()
      ) as TClient

      this.services.set(key, {
        server,
        address,
        token,
        client,
        startedAt,
        crashCount: 0,
        responseTimes: [],
        lastCheck: Date.now(),
        status: 'OPERATIONAL'
      })

      return { address, token }
    }

    if (bin) {
      if (!existsSync(bin)) {
        logger.error(`❌ Binary not found: ${bin}`)
        this.services.set(key, {
          address: '',
          token,
          client: {} as TClient,
          startedAt,
          binaryPath: bin,
          crashed: true,
          crashCount: 0,
          responseTimes: [],
          lastCheck: Date.now(),
          status: 'OUTAGE'
        })

        return Promise.reject(new Error(`Binary not found: ${bin}`))
      }

      const binKey = bin
      if (this.binaries.has(binKey)) {
        const existing = this.binaries.get(binKey)!
        child = existing.child
        port = existing.port
        logger.info(`♻️ Reusing binary ${binKey} for service ${key}`)
      } else {
        port = port ?? (await getAvailablePort())
        logger.info(`🚀 Launching binary ${binKey} on port ${port}`)

        child = spawn(bin, ['--port', port.toString()], {
          stdio: 'pipe',
          env: {
            ...process.env,
            GRPC_PORT: port.toString(),
            GRPC_TOKEN: token
          }
        })

        child.stdout?.on('data', (data) => {
          const message = data.toString().trim()
          this.logs.push({
            timestamp: new Date().toISOString(),
            service: binKey,
            level: 'info',
            message
          })
          if (this.logs.length > 1000) this.logs.shift()
          logger.info(`[${binKey}] ${message}`)
        })

        child.stderr?.on('data', (data) => {
          const message = data.toString().trim()
          this.logs.push({
            timestamp: new Date().toISOString(),
            service: binKey,
            level: 'error',
            message
          })
          if (this.logs.length > 1000) this.logs.shift()
          logger.error(`[${binKey}] ${message}`)
        })

        child.on('error', (err) => {
          logger.error(`❌ Binary error in ${binKey}:`, err)
        })

        child.on('exit', (code) => {
          logger.warn(`🚪 Binary ${binKey} exited with code ${code}`)
        })

        this.binaries.set(binKey, { child, port })
        await waitForGrpcStartup(`127.0.0.1:${port}`, 4000)
      }

      const address = `127.0.0.1:${port}`
      const client = new (serviceDef as any)(
        address,
        grpc.credentials.createInsecure()
      ) as TClient

      this.services.set(key, {
        address,
        token,
        client,
        child,
        startedAt,
        binaryPath: bin,
        crashed: false,
        crashCount: 0,
        responseTimes: [],
        lastCheck: Date.now(),
        status: 'OPERATIONAL'
      })

      return { address, token }
    }

    throw new Error('Invalid service configuration')
  }

  async getServiceLogs(): Promise<IpcServiceLog[]> {
    return this.logs.slice(-100)
  }

  getClient<TClient = any>(packageName: string, serviceName: string): TClient {
    const key = `${packageName}.${serviceName}`
    const service = this.services.get(key)
    if (!service) throw new Error(`Service not started: ${key}`)

    const metadata = new grpc.Metadata()
    metadata.set('authorization', service.token)

    const proxy = new Proxy(service.client, {
      get: (target, prop) => {
        const method = (target as any)[prop]
        if (typeof method !== 'function') return method

        return (req: any, cb: any) => {
          const start = performance.now()
          method.call(target, req, metadata, (err: any, res: any) => {
            const time = performance.now() - start
            service.responseTimes.push(time)
            if (service.responseTimes.length > 100)
              service.responseTimes.shift()
            cb(err, res)
          })
        }
      }
    })

    return proxy as TClient
  }

  stopService(packageName: string, serviceName: string) {
    const key = `${packageName}.${serviceName}`
    const svc = this.services.get(key)
    if (!svc) return

    svc.server?.forceShutdown()

    if (svc.binaryPath) {
      const remaining = [...this.services.entries()].filter(
        ([k, s]) => s.binaryPath === svc.binaryPath && k !== key
      )

      if (remaining.length === 0) {
        const binEntry = this.binaries.get(svc.binaryPath)
        if (binEntry?.child) {
          binEntry.child.kill('SIGTERM')
          logger.info(
            `🛑 Terminating binary ${svc.binaryPath} as no more services use it`
          )
          this.binaries.delete(svc.binaryPath)
        }
      } else {
        logger.info(
          `🧩 Service ${key} removed, but binary is still used by others`
        )
      }
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

  async getServiceStatus(): Promise<IServiceStatus[]> {
    const statuses: IServiceStatus[] = []

    for (const [key, svc] of this.services.entries()) {
      const [packageName, serviceName] = key.split('.')
      const now = Date.now()
      const uptime = now - svc.startedAt
      const port = parseInt(svc.address.split(':')[1], 10)
      const isBinary = !!svc.binaryPath
      const heartbeatAge = svc.lastHeartbeat ? now - svc.lastHeartbeat : null

      const responseTimes = svc.responseTimes
      const avg =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0
      const min = responseTimes.length ? Math.min(...responseTimes) : 0
      const max = responseTimes.length ? Math.max(...responseTimes) : 0

      statuses.push({
        name: key,
        type: this.detectServiceType(packageName, serviceName),
        status: svc.crashed ? 'OUTAGE' : svc.status,
        lastUpdated: new Date(svc.lastCheck || svc.startedAt).toISOString(),
        uptime,
        crashCount: svc.crashCount ?? 0,
        responseTime: { avg, min, max },
        heartbeatAge,
        isBinary,
        description: isBinary ? 'Binary service' : 'In-process service',
        port,
        pid: svc.child?.pid
      })
    }

    return statuses
  }

  getServiceDiagnostics() {
    return [...this.services.entries()].map(([key, svc]) => ({
      name: key,
      startedAt: svc.startedAt,
      lastCheck: svc.lastCheck,
      averageResponseTime:
        svc.responseTimes.reduce((a, b) => a + b, 0) /
          svc.responseTimes.length || 0,
      crashStatus: svc.crashed,
      currentStatus: svc.status
    }))
  }

  private async monitorHealth() {
    for (const [key, svc] of this.services.entries()) {
      try {
        const client = svc.client as any
        const start = performance.now()

        if (typeof client.healthCheck === 'function') {
          await new Promise<void>((res, rej) =>
            client.healthCheck({}, (err: any) => (err ? rej(err) : res()))
          )
        }

        if (typeof client.heartbeat === 'function') {
          await new Promise<void>((res, rej) =>
            client.heartbeat({}, (err: any) => (err ? rej(err) : res()))
          )
          svc.lastHeartbeat = Date.now()
        }

        const time = performance.now() - start
        svc.responseTimes.push(time)
        if (svc.responseTimes.length > 100) svc.responseTimes.shift()

        svc.status = 'OPERATIONAL'
        svc.lastCheck = Date.now()
      } catch (err) {
        svc.status = 'DEGRADED'
        logger.warn(`⚠️ Health check failed for ${key}:`, err)
      }
    }
  }

  private async monitorCrashes() {
    for (const [key, svc] of this.services.entries()) {
      if (svc.crashed) {
        const retryCount = this.crashRetries.get(key) ?? 0
        if (retryCount >= 5) continue

        logger.warn(
          `🌀 Attempting restart of ${key} (attempt ${retryCount + 1})`
        )
        const [pkg, name] = key.split('.')

        try {
          this.stopService(pkg, name)
          this.crashRetries.set(key, retryCount + 1)
        } catch {
          logger.error(`❌ Restart failed for ${key}`)
        }
      }
    }
  }

  private detectServiceType(
    packageName: string,
    serviceName: string
  ): keyof typeof EServiceType {
    const name = `${packageName}.${serviceName}`.toLowerCase()

    if (name.includes('db') || name.includes('store')) return 'DATABASE'
    if (name.includes('ext') || name.includes('plugin')) return 'EXTENSION'

    return 'API'
  }
}

async function waitForGrpcStartup(
  address: string,
  timeoutMs = 4000
): Promise<void> {
  const { credentials, Client } = await import('@grpc/grpc-js')
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const client = new Client(address, credentials.createInsecure())
    client.waitForReady(deadline, (err) => {
      if (err) reject(new Error(`gRPC server at ${address} not ready in time.`))
      else resolve()
    })
  })
}

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
