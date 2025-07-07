import { Play, ImageIcon, Video, Download, Share2, Heart } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTrigger
} from '@manager/ui'
import { FC } from 'react'
import { IMedia } from '@manager/common/src'
import { VideoPlayer } from '../../components/player/video-player'
import { formatSize, formatTime } from '../../../utils/helpers'

type MediaGridLayoutProps = {
  media: IMedia[]
}

export const MediaGridLayout: FC<MediaGridLayoutProps> = (props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {props.media.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={
                      item.mime.startsWith('video/')
                        ? 'local-file://' + item.thumbnail
                        : 'local-file://' + item.path
                    }
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                  {/* Media Type Indicator */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.mime.startsWith('video/') ? (
                        <>
                          <Video className="h-3 w-3 mr-1" />
                          {formatTime(item.length || 0)}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {item.dimensions}
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Play Button for Videos */}
                  {item.mime.startsWith('video/') && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-white/90 p-3">
                        <Play className="h-6 w-6 text-black fill-black" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatSize(item.size)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>

          <DialogContent className="w-full max-w-2xl p-0 rounded-xl overflow-hidden">
            <div className="relative flex flex-col bg-background">
              <div className="bg-black">
                {item.mime.startsWith('video/') ? (
                  <VideoPlayer
                    src={'local-file://' + item.path}
                    name={item.name}
                    poster={'local-file://' + item.thumbnail}
                  />
                ) : (
                  <img
                    src={'local-file://' + item.path}
                    alt={item.name}
                    className="max-h-[60vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 border-t">
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
