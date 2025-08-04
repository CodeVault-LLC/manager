import { Play, ImageIcon, Video, Loader2 } from 'lucide-react'
import {
  Badge,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {media.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  {deletingId === item.id && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  <img
                    src={
                      item.mime.startsWith('video/')
                        ? `local-file://${item.thumbnail}`
                        : `local-file://${item.path}`
                    }
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.mime.startsWith('video/') ? (
                        <>
                          <Video className="mr-1 h-3 w-3" />
                          {formatTime(item.length || 0)}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-1 h-3 w-3" />
                          {item.dimensions}
                        </>
                      )}
                    </Badge>
                  </div>

                  {item.mime.startsWith('video/') && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-3">
                        <Play className="h-6 w-6 fill-black text-black" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="truncate text-sm font-medium">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatSize(item.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="w-full max-w-4xl p-0 rounded-xl overflow-hidden">
            <MediaDialog item={item} deleteMedia={handleDelete} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
