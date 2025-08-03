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
import { IMedia } from '@manager/common/src'
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
  const [filter, setFilter] = useState<string[]>(['image', 'video'])
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
        // eslint-disable-next-line no-console
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
      await fetchMedia() // Refresh the list
    } catch (error) {
      toast.error('An error occurred during upload.')
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string): Promise<void> => {
    try {
      await ipcClient.invoke('entertainment:media:delete', id)
      toast.success('Media deleted successfully.')
      // Optimistically update UI
      setMedia((prevMedia) => prevMedia.filter((item) => item.id !== id))
      setTotalMedia((prev) => prev - 1)
    } catch (error) {
      toast.error('Failed to delete media.')
      // eslint-disable-next-line no-console
      console.error(error)
      // Re-fetch to ensure consistency if optimistic update fails
      await fetchMedia()
    }
  }

  const handleLoadMore = () => {
    const nextLimit = media.length + 50
    void fetchMedia(nextLimit)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-2">
                <ImageIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">MediaViewer</h1>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  aria-label="Search media"
                />
              </div>
              {/* Filter buttons can be refactored into a reusable component if desired */}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid View"
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
                    onClick={() => setViewMode('list')}
                    aria-label="List View"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </div>

            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Media
            </Button>
          </div>
        </div>
      </header>

      {!ffmpegPath && (
        <div className="container mx-auto px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Unable to locate FFmpeg</AlertTitle>
            <AlertDescription>
              FFmpeg is required for video processing. Please install it and set
              the path in <strong>Settings &gt; Application</strong>.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading media...' : `${totalMedia} media items found`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : media.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <MediaGridLayout media={media} onDelete={handleDeleteMedia} />
            ) : (
              <MediaListLayout media={media} onDelete={handleDeleteMedia} />
            )}
            {media.length < totalMedia && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                >
                  {isFetchingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearchTerm
                ? 'Try adjusting your search terms'
                : 'Upload some images or videos to get started'}
            </p>
            <Button onClick={handleUpload} disabled={isUploading}>
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
