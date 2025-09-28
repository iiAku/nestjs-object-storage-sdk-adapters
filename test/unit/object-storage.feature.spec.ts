import { beforeAll, describe, expect, it } from 'vitest'
import { ObjectStorageFeature } from '../../src/domain/object-storage.feature'
import { FakeObjectStorageClient } from './fake-object-storage.client'
import { streamToBuffer } from '../integration/utils'

describe('Object Storage Feature', () => {
  let objectStorageFeature: ObjectStorageFeature
  let objectStorageClient: FakeObjectStorageClient

  beforeAll(() => {
    objectStorageClient = new FakeObjectStorageClient()
    objectStorageFeature = new ObjectStorageFeature(objectStorageClient)
  })

  it('Should be able to create a bucket', async () => {
    const bucketName = 'test-bucket'
    await objectStorageFeature.createBucket(bucketName)
    const exists = await objectStorageClient.headBucket(bucketName)
    expect(exists).toBe(true)
  })

  it('Should be able to check if a bucket exists', async () => {
    const bucketName = 'existing-bucket'
    await objectStorageClient.createBucket(bucketName)
    const exists = await objectStorageFeature.bucketExists(bucketName)
    expect(exists).toBe(true)
  })

  it('Should be able to delete a bucket', async () => {
    const bucketName = 'bucket-to-delete'
    await objectStorageClient.createBucket(bucketName)
    await objectStorageFeature.removeBucket(bucketName)
    const exists = await objectStorageClient.headBucket(bucketName)
    expect(exists).toBe(false)
  })

  it('Should be able to upload a file', async () => {
    const bucketName = 'upload-bucket'
    const key = 'test-file.txt'
    const body = Buffer.from('Hello, World!')
    await objectStorageFeature.createBucket(bucketName)
    await objectStorageFeature.uploadFile(bucketName, key, body)
    const file = await objectStorageClient.getObject(bucketName, key)
    const fileToBuffer = await streamToBuffer(file!)
    expect(file).not.toBeNull()
    expect(fileToBuffer).not.toBeNull()
    expect(fileToBuffer).toEqual(body)
  })

  it('Should be able to download a file', async () => {
    const bucketName = 'download-bucket'
    const key = 'test-file.txt'
    const body = Buffer.from('Hello, World!')
    await objectStorageClient.createBucket(bucketName)
    await objectStorageClient.putObject(bucketName, key, body)
    const file = await objectStorageFeature.downloadFile(bucketName, key)
    const fileToBuffer = await streamToBuffer(file!)
    expect(file).not.toBeNull()
    expect(fileToBuffer).not.toBeNull()
    expect(fileToBuffer).toEqual(body)
  })

  it('Should be able to delete a file', async () => {
    const bucketName = 'delete-bucket'
    const key = 'test-file.txt'
    const body = Buffer.from('Hello, World!')
    await objectStorageClient.createBucket(bucketName)
    await objectStorageClient.putObject(bucketName, key, body)
    await objectStorageFeature.removeFile(bucketName, key)
    const file = await objectStorageClient.getObject(bucketName, key)
    expect(file).toBeNull()
  })
})
