import { Play, ImageIcon, Video, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@manager/ui'
import { FC, useState } from 'react'
import { IMedia } from '@manager/common'
import { formatSize, formatTime } from '../../../utils/helpers'
import { MediaDialog } from './MediaDialog'

type MediaGridLayoutProps = {
  media: IMedia[]
  onDelete: (id: string) => Promise<void>
}

export const MediaGridLayout: FC<MediaGridLayoutProps> = ({
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {media.map((item) => {
        const isVideo = item.mime.startsWith('video/')

        return (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer overflow-hidden border-transparent bg-muted/20 transition-all hover:border-primary/50 hover:shadow-md">
                <CardContent className="p-0">
                  {/* Thumbnail Area */}
                  <div className="relative aspect-square overflow-hidden bg-black/5">
                    {deletingId === item.id && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}

                    <img
                      src={`local-file://${isVideo ? item.thumbnail : item.path}`}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay for bottom text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Center Play Icon on Hover */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 z-10">
                        <div className="rounded-full bg-primary p-3 shadow-lg transform scale-90 transition-transform group-hover:scale-100">
                          <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Right Badge (Standard Media Placement) */}
                    <div className="absolute bottom-2 right-2 z-10 flex items-center rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-md">
                      {isVideo ? (
                        <>
                          <Video className="mr-1 h-3 w-3" />
                          {formatTime(item.length || 0)}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {item.dimensions?.split('x')[0] || 'IMG'}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-3">
                    <h3
                      className="truncate text-sm font-medium"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatSize(item.size)}</span>
                      <span className="uppercase">
                        {item.mime.split('/')[1]}
                      </span>
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
