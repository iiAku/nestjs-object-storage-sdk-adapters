import { DateTime } from 'luxon'
import { ConfigService } from '@nestjs/config'
import { AppConfig } from '../../../app.config'
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants'
import { AwsCredentialIdentity } from '@smithy/types'
import * as Minio from 'minio'
import { ClientOptions } from 'minio'
import { awsStsAssumeRole } from '../aws-sts-asume-role.helper'

export class S3MinioSdkFactory {
  private s3CLient: Minio.Client | null = null
  private expirationTime: DateTime | null = null
  private awsCredentialIdentity: AwsCredentialIdentity | null = null
  private readonly parsedConfig: AppConfig

  constructor(configService: ConfigService) {
    this.parsedConfig = configService.get(VALIDATED_ENV_PROPNAME)!
  }

  private isExpired(): boolean {
    if (!this.expirationTime) {
      return true
    }
    return DateTime.now() >= this.expirationTime
  }

  private areCredentialsValid = (): boolean =>
    this.s3CLient !== null && !this.isExpired()

  private async createCredentials() {
    const endpointUrl = new URL(this.parsedConfig.OBJECT_STORAGE_ENDPOINT)

    const clientOptions: ClientOptions = {
      region: this.parsedConfig.OBJECT_STORAGE_REGION,
      endPoint: endpointUrl.hostname,
      useSSL: this.parsedConfig.OBJECT_STORAGE_REGION.startsWith('https'),
      port: +endpointUrl.port,
      pathStyle: this.parsedConfig.OBJECT_STORAGE_PATH_STYLE,
    }

    this.awsCredentialIdentity = await awsStsAssumeRole(this.parsedConfig)
    // Set expiration time 5 minutes before actual expiration
    this.expirationTime = DateTime.fromJSDate(
      this.awsCredentialIdentity.expiration!,
    ).minus({ minutes: 5 })

    clientOptions.accessKey = this.awsCredentialIdentity.accessKeyId
    clientOptions.secretKey = this.awsCredentialIdentity.secretAccessKey

    if (this.awsCredentialIdentity.sessionToken) {
      clientOptions.sessionToken = this.awsCredentialIdentity.sessionToken
    }

    this.s3CLient = new Minio.Client(clientOptions)
  }

  async getCredentials() {
    if (!this.areCredentialsValid()) {
      await this.createCredentials()
    }
    return this.s3CLient!
  }
}
