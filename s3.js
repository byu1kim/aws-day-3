import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadImage(imageName, imageBuffer, mimetype) {
  // Create params that the S3 client will use to upload the image
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: imageBuffer,
    ContentType: mimetype,
  };

  // Upload the image to S3
  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);

  return data;
}

export async function deleteImage(imageName) {
  console.log("S3 Delete?");
  const params = {
    Bucket: bucketName,
    Key: imageName,
  };
  console.log(imageName);

  const command = new DeleteObjectCommand(params);
  const data = await s3Client.send(command);
  console.log(data);

  return data;
}

export async function signedUrl(fileName) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60 * 24,
  });

  return signedUrl;
}
