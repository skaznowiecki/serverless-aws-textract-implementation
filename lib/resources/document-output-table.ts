import { RemovalPolicy } from "aws-cdk-lib";
import {
    AttributeType,
    BillingMode,
    StreamViewType,
    Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
export const constructDocumentOutputTable = (
    scope: Construct,
): Table => {
    const table = new Table(scope, "DocumentOutputsTable", {
        tableName: `DocumentOutputs`,
        partitionKey: { name: "pk", type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY,
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    table.addGlobalSecondaryIndex({
        indexName: "byJobId",
        partitionKey: {
            name: "jobId",
            type: AttributeType.STRING,
        },
    });

    return table;
};
