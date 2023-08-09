import { EventBridgeHandler } from "aws-lambda";
import { EventDefinition, EventType } from "../../core/events";
import { getDocumentMetadata } from "../../core/document-bucket";
import { getDocumentConfig } from "../../core/document-config";
import { createDocument } from "../../core/document-output";
import { sendDocumentToQueue } from "../../core/document-queue";

export const handler: EventBridgeHandler<
  EventType["dispatched"],
  EventDefinition["dispatched"],
  any
> = async (event) => {
  const { key, category, metadata } = event.detail;

  try {
    await getDocumentMetadata(key);

    const configs = await getDocumentConfig(event.detail.category);

    if (!configs.length) {
      throw new Error(`No configs found for category ${category}`);
    }

    const document = await createDocument({
      key,
      category,
      status: "pending",
      metadata,
    });

    await sendDocumentToQueue(document);
  } catch (error) {
    await createDocument({
      key,
      category,
      status: "failed",
      error: String(error),
    });
  }
};
