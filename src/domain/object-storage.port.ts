import type { Readable } from 'node:stream'

export abstract class ObjectStorage {
  abstract getObject(bucketName: string, key: string): Promise<Readable | null>
  abstract putObject(
    bucketName: string,
    key: string,
    body: Buffer,
  ): Promise<void>
  abstract deleteObject(bucketName: string, key: string): Promise<void>
  abstract createBucket(bucketName: string): Promise<void>
  abstract deleteBucket(bucketName: string): Promise<void>
  abstract headBucket(bucketName: string): Promise<boolean>
}
