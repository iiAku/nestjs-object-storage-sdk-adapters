import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { AppConfig } from '../../app.config'
import { assumeRoleOutputSchema } from './assume-role-output.schema'
import { HttpStatus } from '@nestjs/common'
import { DateTime } from 'luxon'

export const awsStsAssumeRole = async (parsedConfig: AppConfig) => {
  if (!parsedConfig.S3_ARN_ROLE) {
    //if no role credentials are not temporary
    return assumeRoleOutputSchema.parse({
      $metadata: {
        httpStatusCode: HttpStatus.OK,
      },
      Credentials: {
        AccessKeyId: parsedConfig.OBJECT_STORAGE_ACCESS_KEY_ID,
        SecretAccessKey: parsedConfig.OBJECT_STORAGE_SECRET_ACCESS_KEY,
        Expiration: DateTime.now().plus({ day: 10 }).toJSDate(), // long expiration
      },
    })
  }

  const stsClient = new STSClient({
    region: parsedConfig.OBJECT_STORAGE_REGION,
    credentials: {
      accessKeyId: parsedConfig.OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: parsedConfig.OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  })

  const assumeRoleCommand = new AssumeRoleCommand({
    RoleArn: parsedConfig.S3_ARN_ROLE,
    RoleSessionName: parsedConfig.S3_ROLE_SESSION_NAME,
    DurationSeconds: parsedConfig.S3_ROLE_SESSION_DURATION_IN_SECONDS, // 1 hour
  })

  const assumeRoleCommandOutput = await stsClient.send(assumeRoleCommand)
  return assumeRoleOutputSchema.parse(assumeRoleCommandOutput)
}
