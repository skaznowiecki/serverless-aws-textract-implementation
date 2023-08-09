import { SNSEvent, SNSHandler } from "aws-lambda";
import { getDocumentByJobId, updateDocument } from "../../core/document-output";
import { getDocumentAnalysis } from "../../core/document-textract";
import { getDocumentConfig } from "../../core/document-config";
import { documentTextractParser } from "../../core/document-textract-lib";



interface TextractTopicMessage {
  JobId: string;
  Status: string;
  API: string;
  Timestamp: number;
  DocumentLocation: {
    S3ObjectName: string;
    S3Bucket: string;
  };
}


export const handler: SNSHandler = async (event: SNSEvent) => {
  const promises = event.Records.map((record) => {
    return processMessage(record.Sns.Message);
  });
  await Promise.all(promises);
};

const processMessage = async (message: string) => {
  const { JobId } = JSON.parse(message) as TextractTopicMessage;
  const document = await getDocumentByJobId(JobId);

  if (!document) {
    throw new Error(`Document ${JobId} not found`);
  }

  const documentAnalysis = await getDocumentAnalysis(JobId);
  const blocks = documentAnalysis.Blocks || [];

  if (!blocks.length) {
    return;
  }

  const configs = await getDocumentConfig(document.category);

  const result = documentTextractParser(blocks, configs);

  return updateDocument(document.pk, {
    result,
    status: "completed",
    updatedAt: Number(Date.now()),
  });
};
