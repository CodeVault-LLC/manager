import React, { FC, useEffect, useRef, useState, ChangeEvent } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/http-streaming' // Import for HLS/DASH support
import Player from 'video.js/dist/types/player'

// Define the shape for a bitrate level from the HLS plugin
interface BitrateLevel {
  id: number
  bitrate: number
  resolution: string
}

interface VideoPlayerProps {
  src: string
  name?: string
  poster?: string
  type?: string // default: 'video/mp4'
}

const VideoPlayer: FC<VideoPlayerProps> = ({ src, type = 'video/mp4' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<Player | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(1)
  const [bitrates, setBitrates] = useState<BitrateLevel[]>([])
  const [currentBitrate, setCurrentBitrate] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current
      if (!videoElement) return

      const playerOptions = {
        autoplay: false,
        controls: false, // Use our custom controls
        responsive: true,
        fluid: true,
        sources: [
          {
            src,
            type
          }
        ]
      }

      const player = (playerRef.current = videojs(
        videoElement,
        playerOptions,
        () => {
          console.log('Player is ready')

          const tech = player.tech({ IWillNotUseThisInProduction: true }) as any

          if (tech.hls) {
            player.on('loadedmetadata', () => {
              setDuration(player.duration())
              const levels = tech.hls.media.levels
              if (levels && levels.length > 0) {
                const availableBitrates = levels.map(
                  (level: any, index: number) => ({
                    id: index,
                    bitrate: level.bitrate,
                    resolution: `${level.width}x${level.height}`
                  })
                )
                setBitrates(availableBitrates)
                const autoLevel =
                  levels.find((l: any) => l.active === true) || levels[0]
                setCurrentBitrate(autoLevel ? autoLevel.bitrate : null)
              }
            })
          }
        }
      ))

      player.on('play', () => setIsPlaying(true))
      player.on('pause', () => setIsPlaying(false))
      player.on('timeupdate', () => setCurrentTime(player.currentTime()))
      player.on('volumechange', () => setVolume(player.volume() ?? 1))
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [src, type])

  const togglePlay = () => {
    if (playerRef.current) {
      isPlaying ? void playerRef.current.pause() : void playerRef.current.play()
    }
  }

  const changeVolume = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (playerRef.current) {
      playerRef.current.volume(newVolume)
    }
    setVolume(newVolume)
  }

  const changeBitrate = (bitrate: number) => {
    if (playerRef.current) {
      const tech = playerRef.current.tech({
        IWillNotUseThisInProduction: true
      }) as any
      if (tech.hls) {
        const levels = tech.hls.media.levels
        const selectedLevel = levels.find((l: any) => l.bitrate === bitrate)
        if (selectedLevel) {
          tech.hls.media.selectLevel(selectedLevel.id)
          setCurrentBitrate(bitrate)
        }
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const newTime = (clickPosition / progressBar.offsetWidth) * duration
    if (playerRef.current) {
      playerRef.current.currentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="relative flex justify-center items-center w-full h-full bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full max-h-[calc(80vh-4rem)] max-w-7xl flex items-center justify-center">
        <div data-vjs-player className="w-full h-full">
          <video ref={videoRef} className="video-js vjs-default-skin" />
        </div>
      </div>

      {/* Custom UI overlay */}
      <div
        className={`absolute inset-0 bg-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} sm:opacity-100`}
      >
        {/* Play/Pause button for the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className={`text-white text-6xl transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'} sm:opacity-100`}
          >
            {isPlaying ? '⏸︎' : '►'}
          </button>
        </div>

        {/* Bottom control bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} sm:opacity-100`}
        >
          {/* Progress bar */}
          <div
            className="w-full bg-gray-700 h-1 rounded-full cursor-pointer group/progress-bar mb-2"
            onClick={handleProgressClick}
          >
            <div
              className="bg-red-600 h-1 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-600 rounded-full scale-0 group-hover/progress-bar:scale-100 transition-transform"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white text-2xl">
                {isPlaying ? '⏸︎' : '►'}
              </button>

              {/* Time display */}
              <div className="text-white text-sm">
                <span>{formatTime(currentTime)}</span> /{' '}
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Volume control */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={changeVolume}
                  className="w-24 h-1 cursor-pointer accent-red-600"
                />
              </div>

              {/* Settings / Bitrate */}
              <div className="relative group/settings">
                <button className="text-white text-2xl">⚙️</button>
                <div className="absolute bottom-10 right-0 p-2 w-40 bg-black/80 text-white rounded-lg opacity-0 group-hover/settings:opacity-100 transition-opacity duration-200 z-10">
                  <p className="font-bold text-sm mb-2">Quality</p>
                  {bitrates.length > 0 && (
                    <ul>
                      {bitrates.map((b) => (
                        <li
                          key={b.id}
                          onClick={() => changeBitrate(b.bitrate)}
                          className={`cursor-pointer p-1 rounded hover:bg-gray-700 ${currentBitrate === b.bitrate ? 'bg-red-600 font-bold' : ''}`}
                        >
                          {b.resolution}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { VideoPlayer }
