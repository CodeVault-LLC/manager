import { Buffer } from 'buffer'

import { ipcClient } from '@renderer/utils/ipcClient'
import {
  IFileAsBuffer,
  IOutput,
  IConvertedImageData
} from '@shared/types/image/image'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const useIconGenerator = () => {
  const [files, setFiles] = useState<File[]>([])
  const [outputs, setOutputs] = useState<IOutput[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const onFileValidate = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) return 'Only image files are allowed'
    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE)
      return `File must be < ${MAX_SIZE / (1024 * 1024)}MB`
    return null
  }, [])

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.slice(0, 20)}..." was rejected.`
    })
  }, [])

  const handlePresetChange = (
    presetName: string,
    presets: { name: string; outputs: IOutput[] }[]
  ) => {
    setSelectedPreset(presetName)
    const preset = presets.find((p) => p.name === presetName)
    if (preset) {
      setOutputs(preset.outputs)
      setFiles([])
    }
  }

  const handleGeneration = async () => {
    // eslint-disable-next-line no-console
    console.log('Generating icons with outputs:', outputs, files)
    const file = files[0] // eslint-disable-next-line no-console
    console.log('Selected file:', file)
    if (!(file instanceof File) || file.size === 0) return

    const fileBuffer = await new Promise<ArrayBuffer>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.readAsArrayBuffer(file)
    })

    const image: IFileAsBuffer = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      buffer: Array.from(new Uint8Array(fileBuffer))
    }

    const dataToSend: IConvertedImageData = { image, outputs }
    const response = await ipcClient.invoke('images:convert', dataToSend)

    if (response?.error) {
      // eslint-disable-next-line no-console
      console.error('Conversion failed:', response.error.message)
      return
    }

    const zipBuffer = Buffer.from(response.data.buffer)
    const blob = new Blob([zipBuffer], { type: response.data.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = response.data.filename
    a.click()
  }

  return {
    files,
    setFiles,
    outputs,
    setOutputs,
    selectedPreset,
    onFileValidate,
    onFileReject,
    handlePresetChange,
    handleGeneration
  }
}
