import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DocumentConfig } from "./entities";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME: string = process.env.DOCUMENT_CONFIG_TABLE_NAME!

export const getDocumentConfig = async (
    category: string,
    tableName: string = TABLE_NAME
): Promise<DocumentConfig[]> => {
    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "pk = :category ",
        ExpressionAttributeValues: {
            ":category": category,
        },
    });

    const response = await docClient.send(command);

    return (response.Items || []) as DocumentConfig[];
};
