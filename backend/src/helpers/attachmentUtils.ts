import * as AWS from 'aws-sdk'
import { Types } from 'aws-sdk/clients/s3'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('attachmentUtils');

const s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' });
const bucketName: string = process.env.BUCKET_NAME;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export async function createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
    console.log('Generating URL')

    const url = s3Client.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachmentId,
        Expires: urlExpiration
    });


    logger.info(`Created presignedURL ${url}.`);
    return url as string;
}