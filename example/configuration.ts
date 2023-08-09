
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DocumentConfig } from "../lib/core/entities";

const client = new DynamoDBClient({
    region: "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "DocumentConfigs";

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

export const createDocument = async (item: DocumentConfig): Promise<void> => {
    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    });

    await docClient.send(command);
};

export const run = async () => {
    await Promise.all(items.map((item) => createDocument(item)));
};

run()