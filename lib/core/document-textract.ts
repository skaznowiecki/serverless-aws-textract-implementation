import {
    GetDocumentAnalysisCommand,
    GetDocumentAnalysisResponse,
    Query,
    StartDocumentAnalysisCommand,
    StartDocumentAnalysisResponse,
    TextractClient,
} from "@aws-sdk/client-textract";

const BUCKET_NAME: string = process.env.DOCUMENT_BUCKET_NAME!;
const TOPIC_ARN: string = process.env.TEXTRACT_TOPIC_ARN!;
const ROLE_ARN: string = process.env.TEXTRACT_TOPIC_ROLE_ARN!;

const client = new TextractClient({ apiVersion: "2018-06-27" });

export const startDocumentAnalysis = async (
    key: string,
    queries: Query[],
): Promise<StartDocumentAnalysisResponse> => {

    const command = new StartDocumentAnalysisCommand({
        NotificationChannel: {
            RoleArn: ROLE_ARN,
            SNSTopicArn: TOPIC_ARN,
        },
        DocumentLocation: {
            S3Object: {
                Bucket: BUCKET_NAME,
                Name: key,
            },
        },
        FeatureTypes: ["QUERIES"],
        QueriesConfig: {
            Queries: queries
        },
    });

    return await client.send(command);
};

export const getDocumentAnalysis = async (
    jobId: string
): Promise<GetDocumentAnalysisResponse> => {
    const command = new GetDocumentAnalysisCommand({
        JobId: jobId,
    });

    return client.send(command);
};
