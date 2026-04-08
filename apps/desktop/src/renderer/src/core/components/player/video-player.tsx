import React, { FC, useEffect, useRef, useState, ChangeEvent } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/http-streaming'
import Player from 'video.js/dist/types/player'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Repeat,
  Maximize,
  Minimize,
  PictureInPicture
} from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  type?: string
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  src,
  type = 'video/mp4',
  poster
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<Player | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  const [bitrates, setBitrates] = useState<
    { id: number; bitrate: number; resolution: string }[]
  >([])
  const [currentBitrate, setCurrentBitrate] = useState<number | null>(null)

  const [isHovered, setIsHovered] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  let hideControlsTimeout: NodeJS.Timeout

  // Handle auto-hiding controls when playing
  const handleMouseMove = () => {
    setIsHovered(true)
    clearTimeout(hideControlsTimeout)
    if (isPlaying) {
      hideControlsTimeout = setTimeout(() => {
        if (!showSettings) setIsHovered(false)
      }, 2500)
    }
  }

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const player = (playerRef.current = videojs(
        videoRef.current,
        {
          autoplay: false,
          controls: false,
          fill: true,
          responsive: true,
          poster,
          sources: [{ src, type }]
        },
        () => {
          const tech = player.tech({ IWillNotUseThisInProduction: true }) as any
          if (tech.hls) {
            player.on('loadedmetadata', () => {
              const levels = tech.hls.media.levels
              if (levels?.length > 0) {
                setBitrates(
                  levels.map((l: any, i: number) => ({
                    id: i,
                    bitrate: l.bitrate,
                    resolution: `${l.width}x${l.height}`
                  }))
                )
                const autoLevel = levels.find((l: any) => l.active) || levels[0]
                setCurrentBitrate(autoLevel?.bitrate || null)
              }
            })
          }
        }
      ))

      player.on('play', () => setIsPlaying(true))
      player.on('pause', () => setIsPlaying(false))
      player.on('timeupdate', () => setCurrentTime(player.currentTime()))
      player.on('volumechange', () => {
        setVolume(player.volume() ?? 1)
        setIsMuted(player.muted() ?? false)
      })
      player.on('durationchange', () => setDuration(player.duration()))
      player.on('ended', () => setIsPlaying(false))
    }
    return () => playerRef.current?.dispose()
  }, [src, type, poster])

  // Keyboard binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'arrowright':
          e.preventDefault()
          if (playerRef.current)
            playerRef.current.currentTime(playerRef.current.currentTime() + 5)
          break
        case 'arrowleft':
          e.preventDefault()
          if (playerRef.current)
            playerRef.current.currentTime(playerRef.current.currentTime() - 5)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  }, [])

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFsChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const togglePlay = () =>
    isPlaying ? playerRef.current?.pause() : playerRef.current?.play()
  const toggleMute = () => {
    if (playerRef.current) playerRef.current.muted(!playerRef.current.muted())
  }
  const toggleLoop = () => {
    setIsLooping(!isLooping)
    playerRef.current?.loop(!isLooping)
  }
  const toggleFullscreen = async () =>
    !document.fullscreenElement
      ? await containerRef.current?.requestFullscreen()
      : await document.exitFullscreen()
  const togglePiP = async () =>
    document.pictureInPictureElement
      ? await document.exitPictureInPicture()
      : await videoRef.current?.requestPictureInPicture()

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    playerRef.current?.currentTime(
      ((e.clientX - rect.left) / rect.width) * duration
    )
  }

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black group overflow-hidden ${!isHovered && isPlaying ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowSettings(false)
      }}
      onDoubleClick={toggleFullscreen}
    >
      <div data-vjs-player className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin w-full h-full object-contain"
          onClick={(e) => e.detail === 1 && togglePlay()}
        />
      </div>

      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Center Play Indicator (Only shows briefly on pause) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-black/60 p-5 rounded-full backdrop-blur-sm hover:bg-primary/90 transition-all pointer-events-auto shadow-2xl"
            >
              <Play size={40} className="fill-white text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="absolute bottom-0 w-full px-4 pb-4 pt-16 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-auto">
          <div
            className="w-full bg-white/20 h-1 sm:h-1.5 rounded-full cursor-pointer group/progress transition-all hover:h-2"
            onClick={handleProgressClick}
          >
            <div
              className="bg-primary h-full rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow" />
            </div>
          </div>

          <div className="flex items-center justify-between text-white mt-3">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={togglePlay}
                className="hover:text-primary transition-colors"
              >
                {isPlaying ? (
                  <Pause size={22} className="fill-current" />
                ) : (
                  <Play size={22} className="fill-current" />
                )}
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="hover:text-primary transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    playerRef.current?.volume(v)
                    if (v > 0) playerRef.current?.muted(false)
                  }}
                  className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 cursor-pointer accent-primary h-1"
                />
              </div>

              <span className="text-xs sm:text-sm font-medium tabular-nums text-white/80 select-none">
                {formatTime(currentTime)}{' '}
                <span className="text-white/40 mx-1">/</span>{' '}
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-5">
              <button
                onClick={togglePiP}
                className="hover:text-primary transition-colors hidden sm:block"
                title="Picture-in-Picture"
              >
                <PictureInPicture size={18} />
              </button>

              <button
                onClick={toggleLoop}
                className={`transition-colors hidden sm:block ${isLooping ? 'text-primary' : 'hover:text-primary'}`}
                title="Loop"
              >
                <Repeat size={18} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-primary transition-transform duration-300 hover:rotate-90"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute bottom-12 right-0 p-4 w-56 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col gap-5">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Speed
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => {
                              setPlaybackRate(rate)
                              playerRef.current?.playbackRate(rate)
                            }}
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${playbackRate === rate ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                    {bitrates.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Quality
                        </p>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {bitrates.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                const tech = playerRef.current?.tech({
                                  IWillNotUseThisInProduction: true
                                }) as any
                                tech?.hls.media.selectLevel(b.id)
                                setCurrentBitrate(b.bitrate)
                              }}
                              className={`text-left px-2 py-1.5 text-xs rounded-md transition-colors ${currentBitrate === b.bitrate ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10 text-white'}`}
                            >
                              {b.resolution}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="hover:text-primary transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
