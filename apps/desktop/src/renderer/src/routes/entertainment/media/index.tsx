import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Upload,
  ImageIcon,
  Video,
  Grid3X3,
  List,
  AlertCircleIcon
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, Button, Input } from '@manager/ui'
import { MediaListLayout } from '../../../core/pages/media/MediaListLayout'
import { MediaGridLayout } from '../../../core/pages/media/MediaGridLayout'
import { IMediaResponse } from '@manager/common/src'
import { ipcClient } from '../../../utils/ipcClient'
import { useApplicationStore } from '../../../core/store/application.store'

function MediaViewer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<string[]>(['image', 'video'])
  const [media, setMedia] = useState<IMediaResponse | null>(null)
  const { ffmpegPath } = useApplicationStore()

  useEffect(() => {
    void ipcClient
      .invoke('entertainment:media:list', 100, searchTerm, filter)
      .then((response) => {
        if (response.data) {
          setMedia(response.data)
        } else {
          //
        }
      })
      .catch(() => {})
  }, [searchTerm, filter])

  const [viewMode, setViewMode] = useState('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2">
                  <ImageIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">MediaViewer</h1>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={
                    filter.includes('image') && filter.includes('video')
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    setFilter(['image', 'video'])
                  }}
                >
                  All
                </Button>
                <Button
                  variant={filter.includes('image') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(['image'])
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Images
                </Button>
                <Button
                  variant={filter.includes('video') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(['video'])
                  }}
                >
                  <Video className="h-4 w-4 mr-1" />
                  Videos
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={async () => {
                const result = await window.electron.dialog.showOpenDialog({
                  properties: ['openFile', 'multiSelections'],
                  filters: [
                    {
                      name: 'Images',
                      extensions: ['jpg', 'jpeg', 'png', 'gif']
                    },
                    { name: 'Videos', extensions: ['mp4', 'avi', 'mov'] }
                  ]
                })

                if (result.canceled || result.filePaths.length === 0) return

                const filePaths = result.filePaths
                for (const filePath of filePaths) {
                  await ipcClient.invoke('entertainment:media:upload', filePath)
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
        </div>
      </header>

      {!ffmpegPath && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Unable to locate FFmpeg</AlertTitle>
          <AlertDescription>
            FFmpeg is required for media processing.
            <ul className="list-inside list-disc text-sm">
              <li>
                Please install FFmpeg and set the path in{' '}
                <code>Settings &gt; Application</code>.
              </li>
              <li>
                You can download FFmpeg from{' '}
                <a
                  href="https://ffmpeg.org/download.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  here
                </a>
                .
              </li>
              <li>
                After installation, restart the application to apply changes.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {media?.total} media items found
          </p>
        </div>

        {/* Media Grid */}
        {viewMode === 'grid' ? (
          <MediaGridLayout media={media?.data || []} />
        ) : (
          /* List View */
          <MediaListLayout media={media?.data || []} />
        )}

        {(media?.data?.length || 1) < (media?.total || 1) && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={async () => {
                const nextLimit = (media?.limit || 100) + 100
                const response = await ipcClient.invoke(
                  'entertainment:media:list',
                  nextLimit,
                  searchTerm,
                  filter
                )
                if (response.data) {
                  setMedia(response.data)
                }
              }}
            >
              Load More
            </Button>
          </div>
        )}

        {media?.data.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Upload some images or videos to get started'}
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export const Route = createFileRoute('/entertainment/media/')({
  component: MediaViewer
})
