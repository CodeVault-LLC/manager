import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os' // Import the 'os' module to get platform information

const execAsync = promisify(exec)

export interface RunCommandOptions<T = string> {
  timeout?: number
  expectedType?: 'string' | 'number' | 'boolean'
  match?: RegExp
  defaultValue?: T
  trim?: boolean
  shell?: string // Keep this for overriding, but set a smart default
  throwOnError?: boolean
  transform?: (value: string) => T
}

export async function runCommand<T = string>(
  command: string,
  options: RunCommandOptions<T> = {}
): Promise<T> {
  const {
    timeout = 3000,
    expectedType = 'string',
    match,
    defaultValue = '' as T,
    trim = true,
    // Determine the default shell based on the OS
    shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash', // Use powershell.exe on Windows by default
    throwOnError = false,
    transform
  } = options

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      shell // Use the determined shell
    })

    let result: string | T = trim ? stdout.trim() : stdout

    // Log stderr only if it's not empty, for debugging
    if (stderr) {
      log.warn(`runCommand (stderr for "${command}"): ${stderr.trim()}`)
    }

    // Validate regex
    if (match && !match.test(result)) {
      const errorMessage = `Command "${command}" output did not match pattern: ${match}. Output: "${result}"`
      log.warn(errorMessage) // Log the warning
      if (throwOnError) {
        throw new Error(errorMessage)
      }
      return defaultValue
    }

    // Transform value if needed
    if (transform) {
      try {
        result = transform(result)
      } catch (transformError) {
        const errorMessage = `Transform failed for command "${command}": ${transformError}. Output: "${result}"`
        log.error(errorMessage)
        if (throwOnError) throw new Error(errorMessage)
        return defaultValue
      }
    } else {
      switch (expectedType) {
        case 'number': {
          const numResult = parseFloat(result as string)
          if (isNaN(numResult)) {
            const errorMessage = `Expected number for command "${command}" but got "${result}".`
            log.warn(errorMessage)
            if (throwOnError) throw new Error(errorMessage)
            return defaultValue
          }
          result = numResult as unknown as T
          break
        }
        case 'boolean':
          result = /true|yes|1/i.test(result.toString()) as any
          break
        case 'string':
        default:
          // already a string
          break
      }
    }

    return result as T
  } catch (error: any) {
    const errorMessage = `Command "${command}" failed: ${error.message}`
    log.error(errorMessage) // Log the error
    if (throwOnError) throw error
    return defaultValue
  }
}
