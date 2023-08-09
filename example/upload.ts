
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DocumentConfig } from "../lib/core/entities";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";

const client = new S3Client({
    region: "us-east-1",
});

const BUCKET_NAME = "documents.example.com";

const items: DocumentConfig[] = [
    {
        pk: "document",
        sk: "name",
        query: ["Name"],
        type: "query",
    },
    {
        pk: "document",
        sk: "company",
        query: ["Company"],
        type: "query",
    },
];

const uploadFile = async (): Promise<void> => {

    const file = readFileSync('../assets/sample-invoice.png')

    await client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `example.png`,
        Body: file
    }))
};

const run = async () => {
    await uploadFile();
};

run()
