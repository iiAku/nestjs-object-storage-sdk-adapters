import { S3AwsSdkClientFactory } from './s3-aws-sdk-client.factory'

export const S3_AWS_SDK_CLIENT = Symbol('S3_AWS_SDK_CLIENT')

export const s3AwsSdkClientProvider = {
  provide: S3_AWS_SDK_CLIENT,
  useFactory: async (s3ClientFactory: S3AwsSdkClientFactory) =>
    s3ClientFactory.getCredentials(),
  inject: [S3AwsSdkClientFactory],
}
