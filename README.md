# NestJS S3 SDK Compatibility Tester

This project is a **NestJS application** that exposes APIs wrapping the [AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) and [MinIO SDK](https://min.io/).
It is designed to help you verify whether your chosen S3-compatible storage provider (e.g., AWS S3, Cloudflare R2, Scaleway Object Storage, MinIO) works properly with these SDKs.

## Features

* 🌐 NestJS standalone app that do absolutely nothing
* 🔀 Simple **port and domain abstraction** for testing interactions.
* ✅ Integration tests to check S3-compatibility of different providers.
* 🧩 Works with AWS, Cloudflare R2, Scaleway, and MinIO (local or remote).

## Why?

Different providers implement the S3 protocol slightly differently. This app helps you **validate your provider's compatibility** with the official AWS SDK and the MinIO SDK.

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) LTS
* [pnpm](https://pnpm.io/) v8+
* Docker (optional, for running MinIO locally or localstack)

### Installation

```bash
# Clone repository
# Install dependencies
pnpm install
```

### Usage

In order to run all test (unit + integration)
```bash
pnpm run test test/integration/minio-sdk.spec.ts
```


In order to run all test (integration per sdk)
```bash
pnpm run test test/integration/minio-sdk.spec.ts
```

```bash
pnpm run test test/integration/aws-sdk.spec.ts
```

### Configuration

Create a `.env` file with your S3 provider credentials (see .env.example):

```env
#AWS
#S3_ARN_ROLE=arn:aws:iam::XXXXXXXXXXXX:role/XXXXXXXXXXXX
#OBJECT_STORAGE_REGION=us-east-1
#OBJECT_STORAGE_ACCESS_KEY_ID=XXXXXXXXXXXX
#OBJECT_STORAGE_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
#OBJECT_STORAGE_PROVIDER=S3
#OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com
#OBJECT_STORAGE_PATH_STYLE=false

#Cloudflare R2
#OBJECT_STORAGE_REGION=auto
#OBJECT_STORAGE_ACCESS_KEY_ID=XXXXXXXXXXXX
#OBJECT_STORAGE_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
#OBJECT_STORAGE_PROVIDER=R2
#OBJECT_STORAGE_ENDPOINT=https://XXXXXXXXXXXX.r2.cloudflarestorage.com
#OBJECT_STORAGE_PATH_STYLE=true

#Scaleway
#OBJECT_STORAGE_REGION=fr-par
#OBJECT_STORAGE_ACCESS_KEY_ID=XXXXXXXXXXXX
#OBJECT_STORAGE_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
#OBJECT_STORAGE_PROVIDER=SCALEWAY
#OBJECT_STORAGE_ENDPOINT=https://s3.fr-par.scw.cloud
#OBJECT_STORAGE_PATH_STYLE=true
```

> ⚠️ You can use credentials from **AWS S3, Cloudflare R2, Scaleway, or MinIO**.

The integration tests will use your `.env` configuration to check whether your provider works with both AWS SDK and MinIO SDK.

## Provider Compatibility

| Provider          | AWS SDK | MinIO SDK | Notes                                                           |
| ----------------- | ------- | --------- |-----------------------------------------------------------------|
| **Amazon S3**     | ✅ Works | ✅ Works   | –                                                               |
| **Cloudflare R2** | ✅ Works | ❌ Fails   | MinIO SDK not compatible within that repo, but supposed to work |
| **Scaleway**      | ✅ Works | ✅ Works   | Slower responses with MinIO SDK                                 |
| **Aliyun OSS**    | ✅ Works | ✅ Works   | Not yet tested inside this repo                                 |

## Compatibility ressources and SDKs:

- https://developers.cloudflare.com/r2/api/s3/api/
- https://www.alibabacloud.com/help/en/oss/developer-reference/compatibility-with-amazon-s3?spm=a2c63.p38356.0.i1
- https://www.scaleway.com/en/docs/object-storage/api-cli/using-api-call-list/


- https://github.com/minio/minio-js
- https://github.com/aws/aws-sdk-js-v3
- https://github.com/ali-sdk/ali-oss


## Improvements

* [ ] Better error handling
* [ ] Usage of logger for operation info / debug
* [ ] Add Docker Compose setup for easy local MinIO or localstack testing.
* [ ] Provide CI/CD examples for automated compatibility checks.
* [ ] Add OSS SDK (Aliyun) support.