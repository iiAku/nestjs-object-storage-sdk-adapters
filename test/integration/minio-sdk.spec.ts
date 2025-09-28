import {Test} from '@nestjs/testing'
import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {appModuleExports, appModuleImports, appModuleProviders,} from '../../src/app.module'
import {ObjectStorageFeature} from '../../src/domain/object-storage.feature'
import {ObjectStorage} from '../../src/domain/object-storage.port'
import {bucketPrefix, streamToBuffer} from './utils'
import {S3MinioSdkClient} from '../../src/infrastructure/object-storage/minio-sdk/s3-minio-sdk.client'
import {randomUUID} from 'node:crypto'

describe('S3_MINIO_SDK_CLIENT - Object Storage Feature', () => {
  let objectStorageFeature: ObjectStorageFeature
  let objectStorageClient: ObjectStorage

  const testBucket = {
    created: [],
    get name() {
      const name = `${bucketPrefix}-${randomUUID()}`
      this.created.push(name)
      return name
    },
  }

  afterAll(async () => {
    const listBucket = testBucket.created
    for (const bucket of listBucket) {
      await objectStorageClient.deleteBucket(bucket)
    }
  })

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [...appModuleImports],
      providers: [...appModuleProviders],
      exports: [...appModuleExports],
    })
      .overrideProvider(ObjectStorage)
      .useClass(S3MinioSdkClient)
      .compile()

    objectStorageFeature = moduleRef.get(ObjectStorageFeature)
    objectStorageClient = moduleRef.get(ObjectStorage)
  })

  it('Should be able to create a bucket', async () => {
    const bucketName = testBucket.name
    await objectStorageFeature.createBucket(bucketName)
    const exists = await objectStorageClient.headBucket(bucketName)
    expect(exists).toBe(true)
  })

  it('Should be able to check if a bucket exists', async () => {
    const bucketName = testBucket.name
    await objectStorageClient.createBucket(bucketName)
    const exists = await objectStorageFeature.bucketExists(bucketName)
    expect(exists).toBe(true)
  })

  it('Should be able to delete a bucket', async () => {
    const bucketName = testBucket.name
    await objectStorageClient.createBucket(bucketName)
    await objectStorageFeature.removeBucket(bucketName)
    const exists = await objectStorageClient.headBucket(bucketName)
    expect(exists).toBe(false)
  })

  it('Should be able to upload a file', async () => {
    const bucketName = testBucket.name
    const key = 'upload-test-file.txt'
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
    const bucketName = testBucket.name
    const key = 'download-test-file.txt'
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
    const bucketName = testBucket.name
    const key = 'delete-test-file.txt'
    const body = Buffer.from('Hello, World!')
    await objectStorageClient.createBucket(bucketName)
    await objectStorageClient.putObject(bucketName, key, body)
    await objectStorageFeature.removeFile(bucketName, key)
    const file = await objectStorageClient.getObject(bucketName, key)
    expect(file).toBeNull()
  })
})
