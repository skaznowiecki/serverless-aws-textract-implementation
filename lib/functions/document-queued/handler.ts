import { SQSEvent } from "aws-lambda";
import { getDocumentConfig } from "../../core/document-config";
import { Document } from "../../core/entities";
import { startDocumentAnalysis } from "../../core/document-textract";
import { updateDocument } from "../../core/document-output";
import { Query } from "@aws-sdk/client-textract";


export const handler = async (event: SQSEvent): Promise<void> => {
  const promises = event.Records.map((record) => {
    const document = JSON.parse(record.body) as Document;
    return processRecord(document);
  });
  await Promise.all(promises);
};

const processRecord = async (document: Document): Promise<void> => {
  const configs = await getDocumentConfig(document.category);

  const queries: Query[] = configs
    .filter((c) => typeof c.query !== "undefined" && c.type === "query")
    .reduce((pv: string[], cv) => {
      return [...new Set([...pv, ...cv.query!])];
    }, []).map((q) => {
      return {
        Text: q,
      };
    });

  const response = await startDocumentAnalysis(document.key, queries);

  await updateDocument(document.pk, {
    status: "processing",
    jobId: response.JobId,
    updatedAt: Number(Date.now()),
  });
};
