import { Construct } from "constructs";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";

export const constructDocumentBucket = (
    scope: Construct,
): Bucket => {
    return new Bucket(scope, "DocumentBucket", {
        encryption: BucketEncryption.S3_MANAGED,
        bucketName: `documents.example.com`,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
    });
};
