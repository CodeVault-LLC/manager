import { IMedia } from '@manager/common'
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@manager/ui'
import { ImageIcon, Play, Video, Loader2 } from 'lucide-react'
import { FC, useState } from 'react'
import { MediaDialog } from './MediaDialog'
import { formatSize, formatTime } from '../../../utils/helpers'

type MediaListLayoutProps = {
  media: IMedia[]
  onDelete: (id: string) => Promise<void>
}

export const MediaListLayout: FC<MediaListLayoutProps> = ({
  media,
  onDelete
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {media.map((item) => {
        const isVideo = item.mime.startsWith('video/')
        const isDeleting = deletingId === item.id

        return (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer border-transparent bg-muted/20 transition-colors hover:border-primary/30 hover:bg-muted/50">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded bg-black/10">
                      {isDeleting && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      )}
                      <img
                        src={`local-file://${isVideo ? item.thumbnail : item.path}`}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <Play className="h-5 w-5 fill-white text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                      )}
                    </div>

                    {/* Title & Mobile Meta */}
                    <div className="flex flex-1 min-w-0 flex-col justify-center">
                      <h3
                        className="truncate text-sm font-medium"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground sm:hidden">
                        <span>{formatSize(item.size)}</span>
                        <span>•</span>
                        {isVideo ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </div>
                    </div>

                    {/* Desktop Meta (Right Aligned) */}
                    <div className="hidden sm:flex shrink-0 items-center gap-6 text-sm text-muted-foreground pr-4">
                      {isVideo && item.length ? (
                        <div className="flex items-center gap-1.5 w-16 justify-end">
                          <Video className="h-3.5 w-3.5" />
                          <span>{formatTime(item.length)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 w-24 justify-end">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span className="truncate">{item.dimensions}</span>
                        </div>
                      )}
                      <div className="w-20 text-right tabular-nums">
                        {formatSize(item.size)}
                      </div>
                      <div className="w-12 text-right uppercase text-xs font-medium">
                        {item.mime.split('/')[1]}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            <DialogContent className="w-full max-w-5xl p-0 overflow-hidden border-none bg-black/95">
              <MediaDialog item={item} deleteMedia={handleDelete} />
            </DialogContent>
          </Dialog>
        )
      })}
    </div>
  )
}
