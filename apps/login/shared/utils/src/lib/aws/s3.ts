import {
  GetObjectCommand,
  S3Client,
  PutObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
// import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Logger } from '@nestjs/common';
import fs from 'fs';
import { Readable } from 'stream';

let s3: S3Client;

/**
 * Initializes the S3 client if it hasn't been initialized already.
 */
function getClient() {
  if (!s3) {
    const clientOpt: S3ClientConfig = {
      region: 'ap-northeast-2', // Default region
      apiVersion: 'latest',
    };

    // TODO [info] on local need aws profile
    // clientOpt['credentials'] = fromIni({
    // profile: process.env['AWS_PROFILE'],
    //   profile: 'default',
    // });

    s3 = new S3Client(clientOpt);
  }
  return s3;
}

/**
 * Converts a readable stream to a string.
 * @param stream Readable stream from S3 response body
 * @returns Promise<string>
 */
async function streamToString(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', chunk => chunks.push(chunk)); // Collect chunks of data
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    }); // Concatenate and convert to Buffer
    stream.on('error', reject); // Handle errors
  });
}

/**
 * Retrieves a file from S3 as a Buffer.
 * @param bucket S3 bucket name
 * @param key S3 object key
 * @returns Buffer containing file data, or null if an error occurs
 */
export async function getFile(
  bucket: string,
  key: string,
): Promise<Buffer | null> {
  const s3 = getClient();

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);

    if (response.Body) {
      if (response.Body instanceof Readable) {
        // Convert the readable stream to a Buffer
        return await streamToString(response.Body);
      } else {
        Logger.error('Response body is not a readable stream.');
        return null;
      }
    }
  } catch (error) {
    Logger.error('Error getting file from S3:', error);
  }

  return null;
}

/**
 * Downloads a file from S3 and saves it to a local file.
 * @param bucket S3 bucket name
 * @param key S3 object key
 * @param localPath Local directory path to save the file
 * @param fileName Name of the local file
 * @param encoding File encoding (default: binary)
 * @returns Local file path, null if an error occurs, or undefined if the file does not exist
 */
export async function getFileToLocalFile(
  bucket: string,
  key: string,
  fileName: string,
  localPath?: string,
  _encoding?: BufferEncoding,
): Promise<string | null | undefined> {
  const s3 = getClient();

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);

    if (response.Body) {
      if (response.Body instanceof Readable) {
        // Convert the readable stream to a Buffer
        const buffer = await streamToString(response.Body);

        // Create the directory if it doesn't exist
        if (localPath) {
          fs.mkdirSync(localPath, { recursive: true });
        }

        // Write the buffer to a file
        if (localPath) {
          fs.writeFileSync(`${localPath}/${fileName}`, new Uint8Array(buffer));
        } else {
          fs.writeFileSync(`${fileName}`, new Uint8Array(buffer));
        }

        return `${localPath}/${fileName}`;
      } else {
        Logger.error('Response body is not a readable stream.');
        return null;
      }
    }
  } catch (error) {
    Logger.error('Error getting file from S3:', error);
  }

  return null;
}

/**
 * Uploads an image to S3.
 * @param bucket S3 bucket name
 * @param path S3 object path
 * @param fileName Name of the file to be saved in S3
 * @param buffer Image data as a Buffer
 * @param contentType MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns Promise<boolean> indicating success or failure
 */
export async function uploadImage(
  bucket: string,
  path: string,
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<boolean> {
  const s3 = getClient();
  try {
    const key = `${path}/${fileName}`; // Construct the S3 object key

    const command = new PutObjectCommand({
      // ACL: 'public-read',
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);
    return true;
  } catch (error) {
    Logger.error('Error uploading image to S3:', error);
    return false;
  }
}
