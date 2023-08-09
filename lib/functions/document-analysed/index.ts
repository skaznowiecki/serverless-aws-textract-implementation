import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";

import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Topic } from "aws-cdk-lib/aws-sns";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration } from "aws-cdk-lib";

export const documentAnalysed = (
  scope: Construct,
  documentTable: Table,
  documentConfigTable: Table,
  textractTopic: Topic
): lambda.NodejsFunction => {
  const lambdaFunction = new lambda.NodejsFunction(
    scope,
    "HandleDocumentAnalysed",
    {
      functionName: "handle-document-extract-analysed",
      entry: `${__dirname}/handler.ts`,
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DOCUMENT_TABLE_NAME: documentTable.tableName,
        DOCUMENT_CONFIG_TABLE_NAME: documentConfigTable.tableName,
        TEXTRACT_TOPIC_ARN: textractTopic.topicArn,
      },
      bundling: {
        minify: true,
      },
      timeout: Duration.seconds(30),
    }
  );

  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["textract:GetDocumentAnalysis"],
      resources: ["*"],
    })
  );

  documentTable.grantReadWriteData(lambdaFunction);
  documentConfigTable.grantReadData(lambdaFunction);

  lambdaFunction.addEventSource(new SnsEventSource(textractTopic));

  return lambdaFunction;
};
