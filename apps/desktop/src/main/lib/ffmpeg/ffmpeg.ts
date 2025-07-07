import pathToFfmpeg from 'ffmpeg-static-electron'
import { execAsyncWorker } from '../exec-worker'

const ffmpegPathPlaceholder = 'FFMPEG'
const inputPathPlaceholder = 'INPUT'
const outputPathPlaceholder = 'OUTPUT'
const videoStreamLineRegex = /Stream #.+: Video:(.+)\r?\n/

/**
 * Run a FFmpeg command
 *
 * [Note: FFmpeg in Electron]
 *
 * There is a Wasm build of FFmpeg, but that is currently 10-20 times slower
 * that the native build. That is slow enough to be unusable for our purposes.
 * https://ffmpegwasm.netlify.app/docs/performance
 *
 * So the alternative is to bundle a FFmpeg executable binary with our app. e.g.
 *
 *     yarn add fluent-ffmpeg ffmpeg-static ffprobe-static
 *
 * (we only use ffmpeg-static, the rest are mentioned for completeness' sake).
 *
 * Interestingly, Electron already bundles an binary FFmpeg library (it comes
 * from the ffmpeg fork maintained by Chromium).
 * https://chromium.googlesource.com/chromium/third_party/ffmpeg
 * https://stackoverflow.com/questions/53963672/what-version-of-ffmpeg-is-bundled-inside-electron
 *
 * This can be found in (e.g. on macOS) at
 *
 *     $ file ente.app/Contents/Frameworks/Electron\ Framework.framework/Versions/Current/Libraries/libffmpeg.dylib
 *     .../libffmpeg.dylib: Mach-O 64-bit dynamically linked shared library arm64
 *
 * But I'm not sure if our code is supposed to be able to use it, and how.
 */
export type FFmpegCommand = string[] | { default: string[]; hdr: string[] }

export const ffmpegExec = async (
  command: FFmpegCommand,
  inputFilePath: string,
  outputFilePath: string
): Promise<void> => {
  let resolvedCommand: string[]
  if (Array.isArray(command)) {
    resolvedCommand = command
  } else {
    const isHDR = await isHDRVideo(inputFilePath)
    resolvedCommand = isHDR ? command.hdr : command.default
  }

  const cmd = substitutePlaceholders(
    resolvedCommand,
    inputFilePath,
    outputFilePath
  )

  await execAsyncWorker(cmd)
}

const substitutePlaceholders = (
  command: string[],
  inputFilePath: string,
  outputFilePath: string
) =>
  command.map((segment) => {
    if (segment == ffmpegPathPlaceholder) {
      return ffmpegBinaryPath()
    } else if (segment == inputPathPlaceholder) {
      return inputFilePath
    } else if (segment == outputPathPlaceholder) {
      return outputFilePath
    } else {
      return segment
    }
  })

/**
 * Return the path to the `ffmpeg` binary.
 *
 * At runtime, the FFmpeg binary is present in a path like (macOS example):
 * `ente.app/Contents/Resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg`
 */
const ffmpegBinaryPath = () => {
  // This substitution of app.asar by app.asar.unpacked is suggested by the
  // ffmpeg-static library author themselves:
  // https://github.com/eugeneware/ffmpeg-static/issues/16
  return pathToFfmpeg.path!.replace('app.asar', 'app.asar.unpacked')
}

/**
 * Heuristically detect if the file at given path is a HDR video.
 *
 * This is similar to {@link detectVideoCharacteristics}, and see that
 * function's documentation for all the caveats. Specifically, this function
 * uses an allow-list, and considers any file with color transfer "smpte2084" or
 * "arib-std-b67" to be HDR. Caveats:
 *
 * 1. These particular constants are not guaranteed to be correct; these are
 *    from various internet posts as being used / recommended for detecting HDR.
 *
 * 2. Since we don't have ffprobe, we're not checking the color space value
 *    itself but a substring of the stream line in the ffmpeg stderr output.
 *
 * This check should generally not have false positives (unless something else
 * in the log line triggers #2), but it can have false negative. This is the
 * lesser of the two evils since if we apply the tonemapping to any non-BT.709
 * file, we start getting the "code 3074: no path between colorspaces" error
 * during the JPEG or H.264 conversion.
 *
 * - See: [Note: Alternative FFmpeg command for HDR videos]
 * - See: [Note: Tonemapping HDR to HD]
 *
 * @param inputFilePath The path to a video file on the user's machine.
 *
 * @returns `true` if this file is likely a HDR video. Exceptions are treated as
 * `false` to make this function safe to invoke without breaking the happy path.
 */
const isHDRVideo = async (inputFilePath: string) => {
  try {
    const videoInfo = await pseudoFFProbeVideo(inputFilePath)
    const vs = videoStreamLineRegex.exec(videoInfo)?.at(1)
    if (!vs) return false
    return vs.includes('smpte2084') || vs.includes('arib-std-b67')
  } catch (e) {
    log.warn(`Could not detect HDR status of ${inputFilePath}`, e)
    return false
  }
}

/**
 * Return the stderr of ffmpeg in an attempt to gain information about the video
 * at the given {@link inputFilePath}.
 *
 * We don't have the ffprobe binary at hand, which is why we need to use this
 * alternative. See: [Note: Parsing CLI output might break on ffmpeg updates]
 *
 * @returns the stderr of ffmpeg after running it on the input file. The exact
 * command we run is:
 *
 *     ffmpeg -i in.mov -an -frames:v 0 -f null - 2>info.txt
 *
 * And the returned string is the contents of the `info.txt` thus produced.
 */
const pseudoFFProbeVideo = async (inputFilePath: string) => {
  const command = [
    ffmpegPathPlaceholder,
    // Reduce the amount of output lines we have to parse.
    ['-hide_banner'],
    ['-i', inputPathPlaceholder],
    '-an',
    ['-frames:v', '0'],
    ['-f', 'null'],
    '-'
  ].flat()

  const cmd = substitutePlaceholders(command, inputFilePath, /* NA */ '')

  const { stderr } = await execAsyncWorker(cmd)

  return stderr
}
