import { IMedia } from '@manager/common/src'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@manager/ui'
import { Download, Heart, ImageIcon, Play, Share2, Video } from 'lucide-react'
import { FC } from 'react'
import { VideoPlayer } from '../../components/player/video-player'

type MediaListLayoutProps = {
  media: IMedia[]
}

export const MediaListLayout: FC<MediaListLayoutProps> = (props) => {
  return (
    <div className="space-y-2">
      {props.media.map((item) => (
        <Dialog key={item.id}>
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
            <div className="relative h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-black">
                {item.mime.startsWith('video/') ? (
                  <VideoPlayer
                    src={'local-file://' + item.path}
                    name={item.name}
                  />
                ) : (
                  <img
                    src={'local-file://' + item.path}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 bg-background border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{item.size}</span>
                      {item.dimensions && <span>{item.dimensions}</span>}
                      {item.length && <span>{item.length}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
