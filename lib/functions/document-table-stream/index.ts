import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";

import * as events from "aws-cdk-lib/aws-events";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration } from "aws-cdk-lib";

export const documentTableStream = (
  scope: Construct,
  documentTable: Table,
  eventBus: events.EventBus
): lambda.NodejsFunction => {
  const lambdaFunction = new lambda.NodejsFunction(
    scope,
    "HandleDocumentTableStream",
    {
      functionName: "handle-document-table-stream",
      entry: `${__dirname}/handler.ts`,
      handler: "handler",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
      bundling: {
        minify: true,
      },
    }
  );

  eventBus.grantPutEventsTo(lambdaFunction);

  lambdaFunction.addEventSource(
    new DynamoEventSource(documentTable, {
      batchSize: 10,
      startingPosition: StartingPosition.LATEST,
      maxBatchingWindow: Duration.seconds(5),
      filters: [
        {
          pattern: JSON.stringify({
            eventName: ["INSERT", "MODIFY"],
            dynamodb: {
              NewImage: {
                status: {
                  S: ["completed", "failed"],
                },
              },
            },
          }),
        },
      ],
    })
  );

  return lambdaFunction;
};
