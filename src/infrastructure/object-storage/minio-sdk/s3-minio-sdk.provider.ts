import { S3MinioSdkFactory } from './s3-minio-sdk.factory'

export const S3_MINIO_SDK_CLIENT = Symbol('S3_MINIO_SDK_CLIENT')

export const s3MinioSdkClientProvider = {
  provide: S3_MINIO_SDK_CLIENT,
  useFactory: async (s3MinioSdkFactory: S3MinioSdkFactory) =>
    s3MinioSdkFactory.getCredentials(),
  inject: [S3MinioSdkFactory],
}
