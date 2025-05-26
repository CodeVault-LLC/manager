import { exec } from 'child_process'

export const runPowerShellScript = <T>(script: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    exec(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "${script}"`,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message)
        try {
          // eslint-disable-next-line no-console
          console.log('PowerShell output:', stdout, stderr)
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
