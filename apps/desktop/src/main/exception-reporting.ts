import { app } from 'electron'

let hasSentFatalError = false

/** Report the error to Central. */
export async function reportError(
  error: Error,
  extra?: { [key: string]: string },
  nonFatal?: boolean
) {
  if (__DEV__) {
    return
  }

  // We never want to send more than one fatal error (i.e. crash) per
  // application session. This guards against us ending up in a feedback loop
  // where the act of reporting a crash triggers another unhandled exception
  // which causes us to report a crash and so on and so forth.
  if (nonFatal !== true) {
    if (hasSentFatalError) {
      return
    }
    hasSentFatalError = true
  }

  const data = new Map<string, string>()

  data.set('name', error.name)
  data.set('message', error.message)

  if (error.stack) {
    data.set('stack', error.stack)
  }

  data.set('platform', process.platform)
  data.set('version', app.getVersion())

  if (extra) {
    for (const key of Object.keys(extra)) {
      data.set(key, extra[key])
    }
  }

  /*const body = [...data.entries()]
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&')*/

  try {
    await new Promise<void>((_, __) => {
      // TODO: Add a API endpoint for this
    })
    log.info('Error report submitted')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    log.error('Failed submitting error report', error)
  }
}
