enum LogLevel {
  Trace = 'Trace',
  Debug = 'Debug',
  Info = 'Info',
  Log = 'Log',
  Warn = 'Warn',
  Error = 'Error',
  Fatal = 'Fatal',
}

export const levelString: { [key: string]: string } = {
  [LogLevel.Trace]: 'trace',
  [LogLevel.Debug]: 'debug',
  [LogLevel.Info]: 'info',
  [LogLevel.Log]: 'log',
  [LogLevel.Warn]: 'warn',
  [LogLevel.Error]: 'error',
  [LogLevel.Fatal]: 'fatal',
}

export abstract class Logger {
  abstract trace(message: string, context?: object): void
  abstract debug(message: string, context?: object): void
  abstract info(message: string, context?: object): void
  abstract log(message: string, context?: object): void
  abstract warn(message: string, context?: object): void
  abstract error(message: string, context?: object): void
  abstract fatal(message: string, context?: object): void
}
