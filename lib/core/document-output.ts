import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Document, UpdateDocumentAttrs } from "./entities";

import { v4 as uuid } from "uuid";

const TABLE_NAME: string = process.env.DOCUMENT_TABLE_NAME!

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

export const getDocumentByJobId = async (
    jobId: string,

): Promise<Document | undefined> => {
    const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "byJobId",
        ExpressionAttributeNames: {
            "#jobId": "jobId",
        },
        ExpressionAttributeValues: {
            ":jobId": jobId,
        },
        KeyConditionExpression: "#jobId = :jobId",
    });

    const result = await docClient.send(command);

    const items = (result.Items || []) as Document[];

    return items[0];
};

export const createDocument = async (
    attrs: Omit<Document, "pk" | "createdAt" | "updatedAt">,
): Promise<Document> => {
    const item: Document = {
        pk: uuid(),
        ...attrs,
        createdAt: Number(new Date()),
        updatedAt: Number(new Date()),
    };

    const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    });

    await docClient.send(command);

    return item;
};



export const updateDocument = async (
    pk: string,
    attrs: UpdateDocumentAttrs,
): Promise<Document> => {

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, string> = {};
    const updateExpression: string[] = [];

    const keys = Object.keys(attrs) as (keyof UpdateDocumentAttrs)[];

    keys.filter((key) => typeof attrs[key] !== "undefined").forEach((key) => {
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = attrs[key] as string;
        updateExpression.push(`#${key} = :${key}`);
    })

    const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            pk,
        },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        ConditionExpression: "attribute_exists(pk)",
    });

    const result = await docClient.send(command);

    return result.Attributes as Document;
};