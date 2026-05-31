import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION ?? "eu-west-1" });

function getReceiptsBucket() {
  const bucket = process.env.RECEIPTS_BUCKET;
  if (!bucket) {
    throw new Error("Environment variable RECEIPTS_BUCKET is required for receipt storage.");
  }
  return bucket;
}

export function getReceiptKey(filename: string) {
  return `receipts/${filename}`;
}

export async function uploadReceiptToS3(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string
) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: getReceiptsBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getReceiptSignedUrl(key: string, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({
    Bucket: getReceiptsBucket(),
    Key: key,
  });

  return awsGetSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
