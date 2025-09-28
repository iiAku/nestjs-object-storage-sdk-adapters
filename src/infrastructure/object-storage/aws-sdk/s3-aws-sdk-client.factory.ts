import { DateTime } from 'luxon'
import { ConfigService } from '@nestjs/config'
import { AppConfig } from '../../../app.config'
import { VALIDATED_ENV_PROPNAME } from '@nestjs/config/dist/config.constants'
import { S3Client } from '@aws-sdk/client-s3'
import { AwsCredentialIdentity } from '@smithy/types'
import { awsStsAssumeRole } from '../aws-sts-asume-role.helper'

export class S3AwsSdkClientFactory {
  private s3CLient: S3Client | null = null
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

  private createCredentials() {
    this.s3CLient = new S3Client({
      region: this.parsedConfig.OBJECT_STORAGE_REGION,
      endpoint: this.parsedConfig.OBJECT_STORAGE_ENDPOINT,
      credentialDefaultProvider: () => {
        return async () => {
          if (this.areCredentialsValid()) {
            return this.awsCredentialIdentity!
          }
          this.awsCredentialIdentity = await awsStsAssumeRole(this.parsedConfig)
          // Set expiration time 5 minutes before actual expiration
          this.expirationTime = DateTime.fromJSDate(
            this.awsCredentialIdentity.expiration!,
          ).minus({ minutes: 5 })
          return this.awsCredentialIdentity
        }
      },
    })
  }

  async getCredentials() {
    if (!this.areCredentialsValid()) {
      this.createCredentials()
    }
    return this.s3CLient!
  }
}
