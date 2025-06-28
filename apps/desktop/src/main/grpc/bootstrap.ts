import path from 'node:path'
import { manager } from './service-manager'

export const startGrpc = async () => {
  const systemProto = path.resolve('resources/proto/system.proto')
  const networkProto = path.resolve('resources/proto/network.proto')

  await manager.startService({
    protoPath: systemProto,
    packageName: 'system',
    serviceName: 'ImageConverter',
    customPort: 50051, // Use a fixed port for simplicity
    bin: path.resolve('resources/builds/system')
  })

  await manager.startService({
    protoPath: systemProto,
    packageName: 'system',
    serviceName: 'FileSpaceAnalyzer',
    customPort: 50051,
    bin: path.resolve('resources/builds/system')
  })

  await manager.startService({
    protoPath: networkProto,
    packageName: 'network',
    serviceName: 'NetworkScanner',
    customPort: 50051,
    bin: path.resolve('resources/builds/system')
  })

  log.info('gRPC services started successfully')
}
