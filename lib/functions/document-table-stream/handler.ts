import { DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { EventInput, dispatchEvents } from "../../core/document-event";
import { Document } from "../../core/entities";
import { EventName } from "../../core/events";


export const handler: DynamoDBStreamHandler = async (event) => {
  const events: EventInput[] = event.Records.filter(
    (record) =>
      (record.eventName === "INSERT" || record.eventName === "MODIFY") &&
      record.dynamodb?.NewImage
  ).map((record) => {
    const document = unmarshall(
      record.dynamodb!.NewImage as { [key: string]: AttributeValue }
    ) as Document;

    const detailType =
      document.status === "completed"
        ? EventName.DOCUMENT_EXTRACT_PROCESSED
        : EventName.DOCUMENT_EXTRACT_FAILED;

    return {
      detail: document,
      detailType,
    };
  });

  await dispatchEvents(events);
};
