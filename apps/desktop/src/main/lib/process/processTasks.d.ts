/**
 * Defines the structure for a platform-specific function within the ProcessService.
 * Each function returns a Promise that resolves with its result or rejects on error.
 * Parameters and return types should be as specific as possible.
 */
export type ProcessTask<TParams extends any[] = [], TResult = any> = (
  ...args: TParams
) => Promise<TResult>

/**
 * A utility type for defining a record of named process tasks.
 * The key is the task name, and the value is the ProcessTask type.
 */
export type PlatformProcessTasks = {
  [taskName: string]: ProcessTask
}
