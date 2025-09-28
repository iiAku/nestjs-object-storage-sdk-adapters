import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { appConfigSchema } from './app.config'
import { ObjectStorageFeature } from './domain/object-storage.feature'
import { ObjectStorage } from './domain/object-storage.port'
import { s3AwsSdkClientProvider } from './infrastructure/object-storage/aws-sdk/s3-aws-sdk-client.provider'
import { S3AwsSdkClient } from './infrastructure/object-storage/aws-sdk/s3-aws-sdk.client'
import { S3AwsSdkClientFactory } from './infrastructure/object-storage/aws-sdk/s3-aws-sdk-client.factory'
import { NestPinoLogger } from './infrastructure/logger/nest-pino.logger'
import { s3MinioSdkClientProvider } from './infrastructure/object-storage/minio-sdk/s3-minio-sdk.provider'
import { LoggerModule } from 'nestjs-pino'
import { S3MinioSdkFactory } from './infrastructure/object-storage/minio-sdk/s3-minio-sdk.factory'

export const appModuleImports = [
  ConfigModule.forRoot({
    isGlobal: true,
    validate: (config) => appConfigSchema.parse(config),
  }),
  LoggerModule.forRoot(),
]

export const appModuleProviders = [
  { provide: Logger, useClass: NestPinoLogger },
  s3AwsSdkClientProvider,
  {
    provide: S3AwsSdkClientFactory,
    useFactory: (configService: ConfigService) =>
      new S3AwsSdkClientFactory(configService),
    inject: [ConfigService],
  },
  s3MinioSdkClientProvider,
  {
    provide: S3MinioSdkFactory,
    useFactory: (configService: ConfigService) =>
      new S3MinioSdkFactory(configService),
    inject: [ConfigService],
  },
  { provide: ObjectStorage, useClass: S3AwsSdkClient },
  {
    provide: ObjectStorageFeature,
    useFactory: (objectStorage: ObjectStorage) =>
      new ObjectStorageFeature(objectStorage),
    inject: [ObjectStorage],
  },
]

export const appModuleExports = [ObjectStorageFeature]

@Module({
  imports: [...appModuleImports],
  providers: [...appModuleProviders],
  exports: [...appModuleExports],
})
export class AppModule {}
