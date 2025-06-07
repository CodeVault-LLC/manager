import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface RunCommandOptions<T = string> {
  timeout?: number
  expectedType?: 'string' | 'number' | 'boolean'
  match?: RegExp
  defaultValue?: T
  trim?: boolean
  shell?: string
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
    shell = '/bin/bash',
    throwOnError = false,
    transform
  } = options

  try {
    const { stdout } = await execAsync(command, {
      timeout,
      shell
    })

    let result: string | T = trim ? stdout.trim() : stdout

    // Validate regex
    if (match && !match.test(result)) {
      if (throwOnError)
        throw new Error(`Output does not match pattern: ${match}`)
      return defaultValue
    }

    // Transform value if needed
    if (transform) {
      result = transform(result)
    } else {
      switch (expectedType) {
        case 'number':
          result = parseFloat(result) as unknown as T
          if (isNaN(result as number)) {
            if (throwOnError) throw new Error('Output is not a valid number')
            return defaultValue
          }
          break
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
    if (throwOnError) throw error
    return defaultValue as T
  }
}
