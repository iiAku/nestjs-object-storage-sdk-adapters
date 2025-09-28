import { Duration } from 'luxon'
import { z } from 'zod'

enum ObjectStorageProvider {
  S3 = 'S3',
  R2 = 'R2',
  SCALEWAY = 'SCALEWAY',
  OSS = 'OSS',
}

export const appConfigSchema = z
  .object({
    OBJECT_STORAGE_PROVIDER: z
      .enum(ObjectStorageProvider)
      .default(ObjectStorageProvider.S3),
    OBJECT_STORAGE_ENDPOINT: z.url(),
    OBJECT_STORAGE_ACCESS_KEY_ID: z.string(),
    OBJECT_STORAGE_SECRET_ACCESS_KEY: z.string(),
    OBJECT_STORAGE_REGION: z.string(),
    OBJECT_STORAGE_PATH_STYLE: z.stringbool().default(false),
    S3_ARN_ROLE: z.string().optional(),
    S3_ROLE_SESSION_NAME: z.string().default('object-storage-access-session'),
    S3_ROLE_SESSION_DURATION_IN_SECONDS: z
      .number()
      .default(Duration.fromObject({ hours: 1 }).as('seconds')),
  })
  .refine(
    (parsedAppConfig) => {
      if (
        parsedAppConfig.OBJECT_STORAGE_PROVIDER === ObjectStorageProvider.S3
      ) {
        return (
          parsedAppConfig.S3_ARN_ROLE &&
          parsedAppConfig.S3_ROLE_SESSION_NAME &&
          parsedAppConfig.S3_ROLE_SESSION_DURATION_IN_SECONDS
        )
      }
      return true
    },
    {
      message:
        'All S3_* environement variable must be defined when OBJECT_STORAGE_PROVIDER is S3',
    },
  )
export type AppConfig = z.infer<typeof appConfigSchema>
