import { Construct } from "constructs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Duration } from "aws-cdk-lib";

export const constructDocumentQueue = (
    scope: Construct,
): Queue => {
    const DLQueue = new Queue(scope, "DocumentQueueDeadLetter", {
        queueName: `document-dlq`,
    });

    const queue = new Queue(scope, "DocumentQueue", {
        queueName: `document-queue`,
        visibilityTimeout: Duration.seconds(15),
        deadLetterQueue: {
            maxReceiveCount: 2,
            queue: DLQueue,
        },
    });

    return queue
};
