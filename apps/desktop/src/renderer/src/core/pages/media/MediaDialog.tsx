import { FC, useState } from 'react'
import { VideoPlayer } from '../../components/player/video-player' // Assuming a better player component
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
import { Delete, Download, Share2, Loader2 } from 'lucide-react'
import { formatSize, formatTime } from '../../../utils/helpers'

type MediaDialogProps = {
  item: IMedia
  deleteMedia: (id: string) => Promise<void>
  // downloadMedia and shareMedia can be implemented similarly
}

export const MediaDialog: FC<MediaDialogProps> = ({ item, deleteMedia }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // The parent will handle UI updates and toast notifications.
    // The dialog will close automatically when the parent state updates.
    await deleteMedia(item.id)
    // No need to set isDeleting back to false, as the component will unmount.
  }

  return (
    <div className="relative flex max-h-[80vh] flex-col">
      <div className="flex flex-1 items-center justify-center bg-black">
        {item.mime.startsWith('video/') ? (
          <div className="w-full max-w-4xl">
            <VideoPlayer src={`local-file://${item.path}`} />
          </div>
        ) : (
          <img
            src={`local-file://${item.path}`}
            alt={item.name}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      <div className="border-t bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatSize(item.size)}</span>
              {item.dimensions && <span>{item.dimensions}</span>}
              {item.length && <span>{formatTime(item.length)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Download">
              <Download className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="Delete"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Delete className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the media file from your records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Continue
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
