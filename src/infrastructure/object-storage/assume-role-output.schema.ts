import { HttpStatus } from '@nestjs/common'
import type { AwsCredentialIdentity } from '@smithy/types'
import { z } from 'zod'

export const assumeRoleOutputSchema = z
  .object({
    $metadata: z.object({
      httpStatusCode: z.literal(HttpStatus.OK),
    }),
    Credentials: z.object({
      AccessKeyId: z.string(),
      SecretAccessKey: z.string(),
      SessionToken: z.string().optional(),
      Expiration: z.date().optional(),
    }),
  })
  .transform((data): AwsCredentialIdentity => {
    return {
      accessKeyId: data.Credentials.AccessKeyId,
      secretAccessKey: data.Credentials.SecretAccessKey,
      sessionToken: data.Credentials.SessionToken,
      expiration: data.Credentials.Expiration,
    }
  })
