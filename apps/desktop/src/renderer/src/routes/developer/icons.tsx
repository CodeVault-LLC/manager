import { OutputList } from '@renderer/core/components/icons/OutputList'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { PRESETS } from '@renderer/core/pages/icons/presets'
import { useIconGenerator } from '@renderer/core/pages/icons/useIconGenerator'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { Upload, X } from 'lucide-react'

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
  FileUploadTrigger,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Separator,
  Button
} from '@manager/ui'

import { Loader } from '../../core/components/loader/loading-spinner'

const IconGenerator = () => {
  const {
    loading,
    files,
    setFiles,
    outputs,
    setOutputs,
    selectedPreset,
    onFileReject,
    onFileValidate,
    handlePresetChange,
    handleGeneration
  } = useIconGenerator()

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="max-w-4xl p-6 space-y-6">
        <h1 className="text-3xl font-bold">Icon Generator</h1>
        <Separator />

        <FileUpload
          value={files}
          onValueChange={setFiles}
          onFileValidate={onFileValidate}
          onFileReject={onFileReject}
          accept="image/*"
          maxFiles={1}
        >
          <FileUploadDropzone>
            <div className="flex flex-col items-center gap-2">
              <Upload className="size-6 text-muted-foreground" />
              <p className="font-medium text-sm">Drop image here or browse</p>
              <FileUploadTrigger asChild>
                <Button size="sm" variant="outline" disabled={loading}>
                  Browse
                </Button>
              </FileUploadTrigger>
            </div>
          </FileUploadDropzone>
          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={file.name} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>

        <div className="space-y-2">
          <Label htmlFor="preset">Preset</Label>
          <Select
            value={selectedPreset}
            onValueChange={(v) => handlePresetChange(v, PRESETS)}
          >
            <SelectTrigger id="preset">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <OutputList outputs={outputs} setOutputs={setOutputs} />

        <Button
          className="w-full mt-4"
          onClick={handleGeneration}
          disabled={loading || files.length === 0}
        >
          {loading ? <Loader /> : 'Generate Icons'}
        </Button>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/developer/icons')({
  component: IconGenerator
})
