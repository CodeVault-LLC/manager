import { IOutput } from '@manager/common/src'

export type Preset = {
  name: string
  outputs: IOutput[]
}

export const PRESETS: Preset[] = [
  {
    name: 'Electron',
    outputs: [
      { width: 256, height: 256, format: 'ico', name: 'icon.ico' },
      { width: 1024, height: 1024, format: 'icns', name: 'icon.icns' },
      ...[16, 24, 32, 48, 64, 128, 256, 512].map((size) => ({
        width: size,
        height: size,
        format: 'png' as const,
        name: `icon-${size}x${size}.png`
      }))
    ]
  }
]
