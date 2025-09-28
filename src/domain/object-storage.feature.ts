import type { Readable } from 'node:stream'
import type { ObjectStorage } from './object-storage.port'

export class ObjectStorageFeature {
  constructor(private readonly objectStorage: ObjectStorage) {}

  async createBucket(bucketName: string): Promise<void> {
    await this.objectStorage.createBucket(bucketName)
  }

  async removeBucket(bucketName: string): Promise<void> {
    await this.objectStorage.deleteBucket(bucketName)
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    return this.objectStorage.headBucket(bucketName)
  }

  async uploadFile(
    bucketName: string,
    key: string,
    body: Buffer,
  ): Promise<void> {
    const bucketExists = await this.objectStorage.headBucket(bucketName)
    if (!bucketExists) {
      await this.objectStorage.createBucket(bucketName)
    }
    await this.objectStorage.putObject(bucketName, key, body)
  }

  async downloadFile(
    bucketName: string,
    key: string,
  ): Promise<Readable | null> {
    return this.objectStorage.getObject(bucketName, key)
  }

  async removeFile(bucketName: string, key: string): Promise<void> {
    await this.objectStorage.deleteObject(bucketName, key)
  }
}
