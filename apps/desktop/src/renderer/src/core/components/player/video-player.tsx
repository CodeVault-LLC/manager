import { FC, useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Player from 'video.js/dist/types/player'
import { useLocalStorage } from './useLocalStorage'

interface VideoPlayerProps {
  src: string
  name?: string
  poster?: string
  type?: string // default: 'video/mp4'
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  src,
  poster,
  type = 'video/mp4'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<Player | null>(null)

  const [volume, setVolume] = useLocalStorage<number>('video-volume', 1)
  const [playbackRate, setPlaybackRate] = useLocalStorage<number>(
    'video-playback-rate',
    1
  )

  useEffect(() => {
    if (!videoRef.current) return

    const player = videojs(videoRef.current, {
      autoplay: true,
      loop: true,
      controls: true,
      preload: 'auto',
      poster,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'progressControl',
          'durationDisplay',
          'playbackRateMenuButton',
          'fullscreenToggle'
        ],
        volumePanel: {
          inline: false
        }
      },
      techOrder: ['html5'],
      sources: [{ src, type }]
    })

    playerRef.current = player

    player.volume(volume)
    player.playbackRate(playbackRate)

    player.on('volumechange', () => {
      const vol = player.volume()
      if (typeof vol === 'number') setVolume(vol)
    })

    player.on('ratechange', () => {
      const rate = player.playbackRate()
      setPlaybackRate(rate || 1)
    })

    return () => {
      player.dispose()
    }
  }, [src, poster, type])

  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
      <div className="relative max-h-[80vh] max-w-[90vw] w-full">
        <video
          ref={videoRef}
          className="video-js vjs-theme-city vjs-big-play-centered w-full h-full object-contain"
          style={{
            maxHeight: '80vh',
            maxWidth: '100%',
            aspectRatio: '16/9'
          }}
        />
      </div>
    </div>
  )
}
