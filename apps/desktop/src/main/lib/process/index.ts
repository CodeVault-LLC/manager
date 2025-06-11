import { PlatformProcessTasks, ProcessTask } from './processTasks.d'

export class ProcessService {
  private static instance: ProcessService
  private platformTasks: PlatformProcessTasks = {} // Stores the loaded tasks for the current platform

  private constructor() {}

  static getInstance(): ProcessService {
    if (!ProcessService.instance) {
      ProcessService.instance = new ProcessService()
    }
    return ProcessService.instance
  }

  /**
   * Registers a new task with the ProcessService for the current platform.
   * This is your "hook" function.
   *
   * @param taskName The unique name of the task (e.g., 'checkPrinterStatus').
   * @param platform The platform for which this task is applicable (e.g., 'darwin', 'linux', 'win32').
   * @param taskFunction The asynchronous function that performs the task.
   * @template TParams The types of the parameters for the task function.
   * @template TResult The return type of the task function.
   */
  registerTask<TResult = any, TParams extends any[] = []>(
    taskName: string,
    platform: NodeJS.Platform,
    taskFunction: ProcessTask<TParams, TResult>
  ): void {
    if (process.platform !== platform) return

    if (this.platformTasks[taskName]) {
      log.warn(
        `ProcessService: Task "${taskName}" is being re-registered. Overwriting existing implementation.`
      )
    }
    this.platformTasks[taskName] = taskFunction
    log.debug(`ProcessService: Registered task "${taskName}".`)
  }

  /**
   * Executes a platform-specific task.
   *
   * @param taskName The name of the task to execute (e.g., 'getWifiSSID', 'isFirewallEnabled').
   * @param args Any arguments to pass to the task function.
   * @returns A Promise resolving with the task's result.
   * If the task is unimplemented or fails, it returns `undefined` (or a specific default
   * that the caller of `runTask` can provide).
   * @template TResult The expected return type of the task.
   * @template TParams The types of the parameters for the task.
   */
  async runTask<TResult = any, TParams extends any[] = []>(
    taskName: keyof PlatformProcessTasks | string, // Allow string for dynamically added tasks
    ...args: TParams
  ): Promise<TResult | undefined> {
    const task = this.platformTasks[taskName] as
      | ProcessTask<TParams, TResult>
      | undefined

    if (!task) {
      log.warn(
        `ProcessService: Task "${String(taskName)}" is not implemented or registered for ${process.platform}.`
      )
      return undefined
    }

    try {
      return await task(...args)
    } catch (error) {
      log.error(
        `ProcessService: Error executing task "${String(taskName)}" on ${process.platform}:`,
        error
      )
      return undefined
    }
  }
}
