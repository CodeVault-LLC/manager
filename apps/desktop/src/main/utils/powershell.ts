import { exec } from 'child_process'

export const runPowerShellScript = <T>(file: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    exec(
      `powershell -ExecutionPolicy Bypass -File "${file}"`,
      {
        windowsHide: true,
        encoding: 'utf8'
      },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message)
        try {
          resolve(JSON.parse(stdout))
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log('Failed to parse PowerShell output', {
            error: err,
            output: stdout
          })

          reject(`Invalid JSON: ${stdout}`)
        }
      }
    )
  })
}
