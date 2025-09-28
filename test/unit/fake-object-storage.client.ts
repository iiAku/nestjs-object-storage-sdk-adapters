import { Readable } from 'node:stream'
import type { ObjectStorage } from '../../src/domain/object-storage.port'

export class FakeObjectStorageClient implements ObjectStorage {
  private buckets: Map<string, Map<string, Readable>> = new Map()

  async getObject(bucketName: string, key: string): Promise<Readable | null> {
    const bucket = this.buckets.get(bucketName)
    if (bucket) {
      return bucket.get(key) || null
    }
    return null
  }

  async putObject(
    bucketName: string,
    key: string,
    body: Buffer,
  ): Promise<void> {
    let bucket = this.buckets.get(bucketName)
    if (!bucket) {
      bucket = new Map()
      this.buckets.set(bucketName, bucket)
    }
    bucket.set(key, Readable.from(body))
  }

  async deleteObject(bucketName: string, key: string): Promise<void> {
    const bucket = this.buckets.get(bucketName)
    if (bucket) {
      bucket.delete(key)
    }
  }

  async headBucket(bucketName: string): Promise<boolean> {
    return this.buckets.has(bucketName)
  }

  async createBucket(bucketName: string): Promise<void> {
    if (!this.buckets.has(bucketName)) {
      this.buckets.set(bucketName, new Map())
    }
  }

  async deleteBucket(bucketName: string): Promise<void> {
    this.buckets.delete(bucketName)
  }
}
