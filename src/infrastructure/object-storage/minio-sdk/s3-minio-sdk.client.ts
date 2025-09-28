import { Readable } from 'node:stream'
import { Inject } from '@nestjs/common'
import type { ObjectStorage } from '../../../domain/object-storage.port'
import { S3_MINIO_SDK_CLIENT } from './s3-minio-sdk.provider'
import * as Minio from 'minio'

export class S3MinioSdkClient implements ObjectStorage {
  constructor(
    @Inject(S3_MINIO_SDK_CLIENT) private readonly s3Client: Minio.Client,
  ) {}

  async deleteObject(bucketName: string, key: string): Promise<void> {
    return this.s3Client.removeObject(bucketName, key)
  }

  async getObject(bucketName: string, key: string): Promise<Readable | null> {
    try {
      return await this.s3Client.getObject(bucketName, key)
    } catch (e) {
      return null
    }
  }

  async putObject(
    bucketName: string,
    key: string,
    body: Buffer<ArrayBufferLike>,
  ): Promise<void> {
    await this.s3Client.putObject(bucketName, key, body)
  }

  async headBucket(bucketName: string): Promise<boolean> {
    try {
      return await this.s3Client.bucketExists(bucketName)
    } catch (e) {
      return false
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    await this.s3Client.makeBucket(bucketName)
  }

  async deleteBucket(bucketName: string): Promise<void> {
    try {
      const listBucketObject = this.s3Client.listObjectsV2(bucketName)

      for await (const obj of listBucketObject) {
        await this.s3Client.removeObject(bucketName, obj.name)
      }

      await this.s3Client.removeBucket(bucketName)
    } catch (e) {
      return
    }
  }
}
