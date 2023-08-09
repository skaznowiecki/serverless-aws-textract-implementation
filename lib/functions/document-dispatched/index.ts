import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as eventTargets from "aws-cdk-lib/aws-events-targets";
import * as events from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { EventBus } from "aws-cdk-lib/aws-events";

import { DocumentExtractEventSource, EventName } from "../../core/events";

export const documentDispatched = (
  scope: Construct,
  documentQueue: Queue,
  documentTable: Table,
  documentConfigTable: Table,
  documentBucket: Bucket,
  eventBus: EventBus
): lambda.NodejsFunction => {
  const lambdaFunction = new lambda.NodejsFunction(
    scope,
    "HandleDocumentExtractDispatched",
    {
      functionName: "handle-document-extract-dispatched",
      entry: `${__dirname}/handler.ts`,
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DOCUMENT_QUEUE_URL: documentQueue.queueUrl,
        DOCUMENT_TABLE_NAME: documentTable.tableName,
        DOCUMENT_CONFIG_TABLE_NAME: documentConfigTable.tableName,
        DOCUMENT_BUCKET_NAME: documentBucket.bucketName,
      },
      bundling: {
        minify: true,
        nodeModules: ["uuid"],
      },
    }
  );

  documentQueue.grantSendMessages(lambdaFunction);
  documentTable.grantWriteData(lambdaFunction);
  documentConfigTable.grantReadData(lambdaFunction);
  documentBucket.grantRead(lambdaFunction);

  new events.Rule(scope, "LambdaHandleDispatched", {
    eventBus,
    eventPattern: {
      source: [DocumentExtractEventSource],
      detailType: [EventName.DOCUMENT_EXTRACT_DISPATCHED],
    },
    targets: [new eventTargets.LambdaFunction(lambdaFunction)],
  });

  return lambdaFunction;
};
