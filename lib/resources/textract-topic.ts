import { Construct } from "constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export const constructTextractTopic = (
    scope: Construct,
): {
    topic: Topic;
    topicRole: Role;
} => {
    const topic = new Topic(scope, "TextractTopic", {
        displayName: `document-textract`,
    });

    const topicRole = new Role(scope, "TextractTopicRole", {
        roleName: `document-textract-role`,
        assumedBy: new ServicePrincipal("textract.amazonaws.com"),
    });

    topic.grantPublish(topicRole);

    return {
        topic,
        topicRole,
    };
};
