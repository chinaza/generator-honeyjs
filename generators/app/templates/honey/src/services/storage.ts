import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getEnv } from '../config';

const s3 = new S3Client({
  region: getEnv('AWS_S3_REGION'),
  credentials: {
    accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('AWS_ACCESS_KEY')
  }
});

export async function deleteObject(
  key: string,
  bucket = getEnv('AWS_S3_BUCKET')
) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  await s3.send(command);
}

export function generateObjUrl(key: string, bucket = getEnv('AWS_S3_BUCKET')) {
  return new URL(`https://${bucket}.s3.amazonaws.com/${key}`).toString();
}

export default s3;
