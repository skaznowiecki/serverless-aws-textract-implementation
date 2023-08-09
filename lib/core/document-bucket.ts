import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "us-east-1",
});

const BUCKET_NAME: string = process.env.DOCUMENT_BUCKET_NAME!


interface FileMetadata {
    size: number;
    lastModified: Date;
    contentType: string;
}

export const getDocumentMetadata = async (
    key: string,
): Promise<FileMetadata> => {
    const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const response = await client.send(command);

    return {
        size: response.ContentLength!,
        lastModified: response.LastModified!,
        contentType: response.ContentType!,
    };
};
