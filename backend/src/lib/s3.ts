import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config.js";

const hasS3Credentials = !!(config.s3.accessKey && config.s3.secretKey);

const s3Config: ConstructorParameters<typeof S3Client>[0] = {
  region: config.s3.region,
  forcePathStyle: true,
};

if (config.s3.endpoint) {
  s3Config.endpoint = config.s3.endpoint;
}

if (hasS3Credentials) {
  s3Config.credentials = {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  };
}

export const s3Client = new S3Client(s3Config);

const Bucket = config.s3.bucket;

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

/** When S3 credentials are not set, uploads go to local ./uploads (dev fallback). */
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  if (!hasS3Credentials) {
    const fullPath = path.join(UPLOADS_DIR, key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, Buffer.from(body));
    return key;
  }
  await s3Client.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!hasS3Credentials) {
    return `${config.apiPrefix}/uploads/${key}`;
  }
  const command = new GetObjectCommand({ Bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function objectExists(key: string): Promise<boolean> {
  if (!hasS3Credentials) return false;
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
