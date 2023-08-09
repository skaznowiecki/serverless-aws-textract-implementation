type DispatchedEventType = "document-extract:dispatched";

type CompletedEventType = "document-extract:completed";
type FailedEventType = "document-extract:failed";

interface DispatchedEventDefinition {
    key: string;
    category: string;
    metadata?: any;
}

type CompletedEventDefinition = Document;
type FailedEventDefinition = Document;

export interface EventType {
    dispatched: DispatchedEventType;
    completed: CompletedEventType;
    failed: FailedEventType;
}

export interface EventDefinition {
    dispatched: DispatchedEventDefinition;
    completed: CompletedEventDefinition;
    failed: FailedEventDefinition;
}

export enum EventName {
    DOCUMENT_EXTRACT_DISPATCHED = "document-extract:dispatched",
    DOCUMENT_EXTRACT_FAILED = "document-extract:failed",
    DOCUMENT_EXTRACT_PROCESSED = "document-extract:completed",
}

export type DocumentExtractEventSource = "document-extract";
export const DocumentExtractEventSource = "document-extract";
