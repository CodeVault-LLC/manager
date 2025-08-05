import { IMedia } from '@manager/common'
import {
  Badge,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@manager/ui'
import { ImageIcon, Play, Video } from 'lucide-react'
import { FC, useState } from 'react'
import { MediaDialog } from './MediaDialog'
import { ipcClient } from '../../../utils/ipcClient'

type MediaListLayoutProps = {
  media: IMedia[]
  onDelete: (id: string) => Promise<void>
}

export const MediaListLayout: FC<MediaListLayoutProps> = (props) => {
  const [dialogClosed, setDialogClosed] = useState(false)

  const removeMedia = async (id: string) => {
    await ipcClient.invoke('entertainment:media:delete', id).catch(() => {})
  }

  return (
    <div className="space-y-2">
      {props.media.map((item) => (
        <Dialog
          key={item.id}
          onOpenChange={() => setDialogClosed(false)}
          open={!dialogClosed}
        >
          <DialogTrigger asChild>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <img
                      src={
                        item.mime.startsWith('video/')
                          ? 'local-file://' + item.thumbnail
                          : 'local-file://' + item.path
                      }
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {item.mime.startsWith('video/') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.mime.startsWith('video/') ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Image
                          </>
                        )}
                      </Badge>
                      <span>{item.size}</span>
                      {item.dimensions && <span>{item.dimensions}</span>}
                      {item.length && <span>{item.length}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-4xl w-full h-[70vh] p-0">
            <MediaDialog item={item} deleteMedia={removeMedia} />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
