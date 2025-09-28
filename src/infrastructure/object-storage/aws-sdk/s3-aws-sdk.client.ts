import { Readable } from 'node:stream'
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3'
import { Inject } from '@nestjs/common'
import type { ObjectStorage } from '../../../domain/object-storage.port'
import { S3_AWS_SDK_CLIENT } from './s3-aws-sdk-client.provider'

export class S3AwsSdkClient implements ObjectStorage {
  constructor(@Inject(S3_AWS_SDK_CLIENT) private readonly s3Client: S3Client) {}

  async deleteObject(bucketName: string, key: string): Promise<void> {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    await this.s3Client.send(deleteObjectCommand)
  }

  async getObject(bucketName: string, key: string): Promise<Readable | null> {
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })

      const response = await this.s3Client.send(getObjectCommand)

      if (response.Body) {
        return Readable.fromWeb(response.Body.transformToWebStream() as any)
      }

      return null
    } catch (e) {
      return null
    }
  }

  async putObject(
    bucketName: string,
    key: string,
    body: Buffer<ArrayBufferLike>,
  ): Promise<void> {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
      })
      await this.s3Client.send(putObjectCommand)
    } catch (e) {
      console.error('Error putting object:', e)
    }
  }

  async headBucket(bucketName: string): Promise<boolean> {
    try {
      const headBucketCommandInput = new HeadBucketCommand({
        Bucket: bucketName,
      })
      await this.s3Client.send(headBucketCommandInput)
      return true
    } catch (e) {
      return false
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
    })
    await this.s3Client.send(createBucketCommand)
  }

  async deleteBucket(bucketName: string): Promise<void> {
    try {
      const listBucketObject = new ListObjectsV2Command({ Bucket: bucketName })

      const listedObjects = await this.s3Client.send(listBucketObject)

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        for (const object of listedObjects.Contents) {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: object.Key!,
            }),
          )
        }
      }

      const deleteBucketCommand = new DeleteBucketCommand({
        Bucket: bucketName,
      })

      await this.s3Client.send(deleteBucketCommand)
    } catch (e) {}
  }
}
