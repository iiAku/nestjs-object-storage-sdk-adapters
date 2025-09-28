import { Logger } from '../../domain/logger.port'
import { PinoLogger } from 'nestjs-pino'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NestPinoLogger implements Logger {
  constructor(private readonly logger: PinoLogger) {}
  debug(message: string, context?: object): void {
    this.logger.debug(context instanceof Error ? context : { context }, message)
  }

  error(message: string, context?: object): void {
    this.logger.error(context instanceof Error ? context : { context }, message)
  }

  fatal(message: string, context?: object): void {
    this.logger.fatal(context instanceof Error ? context : { context }, message)
  }

  info(message: string, context?: object): void {
    this.logger.info(context instanceof Error ? context : { context }, message)
  }

  log(message: string, context?: object): void {
    this.info(message, context)
  }

  trace(message: string, context?: object): void {
    this.logger.trace(context instanceof Error ? context : { context }, message)
  }

  warn(message: string, context?: object): void {
    this.logger.warn(context instanceof Error ? context : { context }, message)
  }
}
