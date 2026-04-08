import { FC, useState } from 'react'
import { VideoPlayer } from '../../components/player/video-player'
import { IMedia } from '@manager/common'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button
} from '@manager/ui'
import {
  Delete,
  Download,
  Share2,
  Loader2,
  Video,
  ImageIcon
} from 'lucide-react'
import { formatSize, formatTime } from '../../../utils/helpers'

type MediaDialogProps = {
  item: IMedia
  deleteMedia: (id: string) => Promise<void>
}

export const MediaDialog: FC<MediaDialogProps> = ({ item, deleteMedia }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const isVideo = item.mime.startsWith('video/')

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteMedia(item.id)
  }

  return (
    // Fixed height ensures the flex container never collapses to 0 height.
    <div className="flex flex-col w-full h-[80vh] sm:h-[85vh] overflow-hidden bg-black rounded-lg shadow-2xl">
      {/* Media Content Area: Takes up all remaining space above the bottom bar */}
      <div className="flex-1 w-full min-h-0 bg-black/95 relative flex items-center justify-center">
        {isVideo ? (
          <div className="w-full h-full">
            <VideoPlayer
              src={`local-file://${item.path}`}
              poster={`local-file://${item.thumbnail}`}
            />
          </div>
        ) : (
          <img
            src={`local-file://${item.path}`}
            alt={item.name}
            className="w-full h-full object-contain p-4"
          />
        )}
      </div>

      {/* Bottom Info Bar: Fixed size, cannot be squished by the media */}
      <div className="shrink-0 border-t border-white/10 bg-zinc-950 p-4 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg font-medium text-white truncate"
              title={item.name}
            >
              {item.name}
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 rounded text-zinc-300">
                {isVideo ? <Video size={12} /> : <ImageIcon size={12} />}
                {item.mime.split('/')[1].toUpperCase()}
              </span>
              <span>{formatSize(item.size)}</span>
              {item.dimensions && <span>• {item.dimensions}</span>}
              {item.length && <span>• {formatTime(item.length)}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Download className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-zinc-800 mx-1" /> {/* Divider */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={isDeleting}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Delete className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Media</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action cannot be undone. This will permanently delete
                    the file from your local storage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 hover:text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Permanently Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
