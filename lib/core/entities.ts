// DOCUMENT OUTPUT

export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
    pk: string;
    key: string;
    category: string;

    id?: string;
    jobId?: string;

    status: DocumentStatus;

    metadata?: Record<string, string | number>;
    result?: Record<string, string[] | boolean>;

    error?: string;

    createdAt: number;
    updatedAt: number;
}


export type UpdateDocumentAttrs = Partial<
    Pick<Document, "status" | "result" | "error" | "jobId" | "updatedAt">
>;


// DOCUMENT CONFIGURATION

export type DocumentConfigType = "query" | "existance";

export interface DocumentConfig {
    pk: string;
    sk: string;
    type: DocumentConfigType;
    query?: string[];
}
