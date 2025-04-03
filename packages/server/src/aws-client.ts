import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'admin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'password',
  },
  forcePathStyle: true,
});

export const createBuckets = async (): Promise<void> => {
  await createBucket('avatars');
};

const createBucket = async (bucketName: string): Promise<void> => {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou')
      // eslint-disable-next-line no-console -- Logging
      console.log('Bucket already exists.');
    else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- Error message
      throw new Error(`Error creating bucket: ${error.message}`);
    }
  }
};

export { s3 };
