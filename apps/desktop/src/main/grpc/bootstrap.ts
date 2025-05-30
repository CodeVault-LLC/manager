import path from 'node:path'

import logger from '../logger'

import { manager } from './service-manager'

export const startGrpc = async () => {
  const protoPath = path.resolve('resources/proto/system.proto')
  const packageName = 'system'
  const serviceName = 'ImageConverter'

  const { address, token } = await manager.startService({
    protoPath,
    packageName,
    serviceName,
    customPort: 50051, // Use a fixed port for simplicity
    bin: path.resolve('resources/builds/system')
  })

  logger.info(
    `Starting gRPC Service ${serviceName} at ${address} with token ${token}`
  )
}
