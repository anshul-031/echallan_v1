import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.R2_ACCOUNT_ID) throw new Error('R2_ACCOUNT_ID is required');
if (!process.env.R2_ACCESS_KEY_ID) throw new Error('R2_ACCESS_KEY_ID is required');
if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error('R2_SECRET_ACCESS_KEY is required');
if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is required');

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export const listDocuments = async (vrn: string): Promise<Record<string, string>> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: vrn + '/', // Assuming documents are stored in a folder named after the VRN
      Delimiter: '/',
    });

    const response = await r2Client.send(command);

    if (!response.Contents) {
      return {};
    }

    const documents: Record<string, string> = {};
    response.Contents.forEach((object) => {
      if (object.Key) {
        const parts = object.Key.split('/');
        const docType = parts[1];
        const fileName = parts[2];
        if (docType && fileName) {
          documents[docType] = fileName;
        }
      }
    });

    return documents;
  } catch (error) {
    console.error('Error listing documents:', error);
    return {};
  }
};
