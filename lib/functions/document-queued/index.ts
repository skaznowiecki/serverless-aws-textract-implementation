import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";

import { Queue } from "aws-cdk-lib/aws-sqs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration } from "aws-cdk-lib";

export const documentQueued = (
  scope: Construct,
  documentQueue: Queue,
  documentTable: Table,
  documentConfigTable: Table,
  documentBucket: Bucket,
  textractTopic: Topic,
  textractTopicRole: Role
): lambda.NodejsFunction => {
  const lambdaFunction = new lambda.NodejsFunction(
    scope,
    "HandleDocumentQueued",
    {
      functionName:
        "handle-document-extract-queued",
      entry: `${__dirname}/handler.ts`,
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DOCUMENT_QUEUE_URL: documentQueue.queueUrl,
        DOCUMENT_TABLE_NAME: documentTable.tableName,
        DOCUMENT_CONFIG_TABLE_NAME: documentConfigTable.tableName,
        DOCUMENT_BUCKET_NAME: documentBucket.bucketName,
        TEXTRACT_TOPIC_ARN: textractTopic.topicArn,
        TEXTRACT_TOPIC_ROLE_ARN: textractTopicRole.roleArn,
      },
      bundling: {
        minify: true,
        nodeModules: ["uuid"],
      },
    }
  );

  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["iam:PassRole"],
      resources: [textractTopicRole.roleArn],
    })
  );
  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["textract:StartDocumentAnalysis"],
      resources: ["*"],
    })
  );

  documentTable.grantWriteData(lambdaFunction);
  documentConfigTable.grantReadData(lambdaFunction);
  documentBucket.grantRead(lambdaFunction);

  lambdaFunction.addEventSource(
    new SqsEventSource(documentQueue, {
      batchSize: 5,
      maxBatchingWindow: Duration.seconds(1),
      reportBatchItemFailures: true,
    })
  );

  return lambdaFunction;
};
