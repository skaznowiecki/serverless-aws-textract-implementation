import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import { DocumentExtractEventSource, EventDefinition, EventName } from "../lib/core/events";



export const ebClient = new EventBridgeClient({ region: "us-east-1" });

const EVENT_BUS_NAME = 'document-event-bus';


export interface EventInput {
    detailType: string;
    detail: any;
}

export const dispatchEvents = async (
    payload: EventDefinition["dispatched"]
) => {
    const params: PutEventsCommandInput = {
        Entries: [{
            DetailType: EventName.DOCUMENT_EXTRACT_DISPATCHED,
            Detail: JSON.stringify(payload),
            EventBusName: EVENT_BUS_NAME,
            Source: DocumentExtractEventSource,
        }]
    };

    await ebClient.send(new PutEventsCommand(params));
};


export const run = async () => {
    await dispatchEvents(
        {
            category: "document",
            key: "example.png",
            metadata: {
                name: "example.png",
            }
        }
    );
};

run();