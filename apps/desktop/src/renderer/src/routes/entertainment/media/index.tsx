import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Upload,
  ImageIcon,
  Grid3X3,
  List,
  AlertCircleIcon,
  Loader2
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@manager/ui'
import { MediaListLayout } from '../../../core/pages/media/MediaListLayout'
import { MediaGridLayout } from '../../../core/pages/media/MediaGridLayout'
import { IMedia } from '@manager/common'
import { ipcClient } from '../../../utils/ipcClient'
import { useApplicationStore } from '../../../core/store/application.store'
import { useDebounce } from '../../../hooks/use-debounce'
import { toast } from 'sonner'

function MediaViewer() {
  const [media, setMedia] = useState<IMedia[]>([])
  const [totalMedia, setTotalMedia] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [filter] = useState<string[]>(['image', 'video'])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { ffmpegPath } = useApplicationStore()

  const fetchMedia = useCallback(
    async (limit = 50) => {
      if (limit === 50) setIsLoading(true)
      else setIsFetchingMore(true)

      try {
        const response = await ipcClient.invoke(
          'entertainment:media:list',
          limit,
          debouncedSearchTerm,
          filter
        )
        if (response.data) {
          setMedia(response.data.data)
          setTotalMedia(response.data.total)
        }
      } catch (error) {
        toast.error('Failed to fetch media.')
        console.error(error)
        setMedia([])
        setTotalMedia(0)
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    },
    [debouncedSearchTerm, filter]
  )

  useEffect(() => {
    void fetchMedia()
  }, [fetchMedia])

  const handleUpload = async () => {
    const result = await window.electron.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Media Files',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov']
        }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) return

    setIsUploading(true)
    const uploadPromises = result.filePaths.map((path) =>
      ipcClient.invoke('entertainment:media:upload', path)
    )

    try {
      await Promise.all(uploadPromises)
      toast.success(`${result.filePaths.length} file(s) uploaded successfully!`)
      await fetchMedia()
    } catch (error) {
      toast.error('An error occurred during upload.')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string): Promise<void> => {
    try {
      await ipcClient.invoke('entertainment:media:delete', id)
      toast.success('Media deleted successfully.')
      setMedia((prevMedia) => prevMedia.filter((item) => item.id !== id))
      setTotalMedia((prev) => prev - 1)
    } catch (error) {
      toast.error('Failed to delete media.')
      console.error(error)
      await fetchMedia()
    }
  }

  const handleLoadMore = () => {
    const nextLimit = media.length + 50
    void fetchMedia(nextLimit)
  }

  return (
    <div className="flex h-full flex-col bg-background p-4 sm:p-6">
      {!ffmpegPath && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Unable to locate FFmpeg</AlertTitle>
          <AlertDescription>
            FFmpeg is required for video processing. Please install it and set
            the path in <strong>Settings &gt; Application</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Streamlined Utility Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary"
              aria-label="Search media"
            />
          </div>
          <span className="hidden text-sm font-medium text-muted-foreground sm:inline-block">
            {isLoading ? '...' : `${totalMedia} items`}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center rounded-md border bg-muted/50 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="ml-2"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : media.length > 0 ? (
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <MediaGridLayout media={media} onDelete={handleDeleteMedia} />
            ) : (
              <MediaListLayout media={media} onDelete={handleDeleteMedia} />
            )}

            {media.length < totalMedia && (
              <div className="flex justify-center pb-6">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="min-w-[120px]"
                >
                  {isFetchingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No media found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {debouncedSearchTerm
                ? 'Try adjusting your search terms.'
                : 'Upload some images or videos to get started.'}
            </p>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
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
