import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Document } from "./entities";

const client = new SQSClient({
    region: "us-east-1",
});

const QUEUE_URL = process.env.DOCUMENT_QUEUE_URL!

export const sendDocumentToQueue = async (
    document: Document,
): Promise<void> => {
    const command = new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(document),
    });

    await client.send(command);

};
