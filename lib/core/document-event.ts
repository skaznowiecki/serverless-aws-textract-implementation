import {
    EventBridgeClient,
    PutEventsCommand,
    PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import { DocumentExtractEventSource } from "./events";
export const ebClient = new EventBridgeClient({ region: "us-east-1" });

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!;

export interface EventInput {
    detailType: string;
    detail: any;
}

export const dispatchEvents = async (
    events: EventInput[],
) => {
    const params: PutEventsCommandInput = {
        Entries: events.map((event) => ({
            DetailType: event.detailType,
            Detail: JSON.stringify(event.detail),
            EventBusName: EVENT_BUS_NAME,
            Source: DocumentExtractEventSource,
        })),
    };

    await ebClient.send(new PutEventsCommand(params));
};
