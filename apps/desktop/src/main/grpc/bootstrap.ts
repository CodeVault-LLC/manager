import path from 'node:path'
import { manager } from './service-manager'

export const startGrpc = async () => {
  const protoPath = path.resolve('resources/proto/system.proto')

  await manager.startService({
    protoPath,
    packageName: 'system',
    serviceName: 'ImageConverter',
    customPort: 50051, // Use a fixed port for simplicity
    bin: path.resolve('resources/builds/system')
  })

  await manager.startService({
    protoPath,
    packageName: 'system',
    serviceName: 'FileSpaceAnalyzer',
    customPort: 50051,
    bin: path.resolve('resources/builds/system')
  })

  log.info('gRPC services started successfully')
}
