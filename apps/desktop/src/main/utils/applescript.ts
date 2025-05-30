import { exec } from 'node:child_process'

export const runAppleScript = <T>(scriptpath: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    exec(
      `osascript "${scriptpath}"`,
      { encoding: 'utf8' },
      (error: any, stdout: string, stderr: string) => {
        if (error) {
          return reject(stderr || error.message)
        }
        try {
          // eslint-disable-next-line no-console
          console.log('AppleScript output:', stdout, stderr)
          resolve(JSON.parse(stdout))
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log('Failed to parse AppleScript output', {
            error: err,
            output: stdout
          })
          reject(`Invalid JSON: ${stdout}`)
        }
      }
    )
  })
}
