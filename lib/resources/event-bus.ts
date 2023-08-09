import { Construct } from "constructs";
import { EventBus } from "aws-cdk-lib/aws-events";

export const constructEventBus = (scope: Construct): EventBus => {
    return new EventBus(scope, "EventBus", {
        eventBusName: `document-event-bus`,
    });
};
