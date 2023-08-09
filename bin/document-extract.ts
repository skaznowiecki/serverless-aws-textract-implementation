#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DocumentExtractStack } from '../lib/document-extract-stack';

const app = new cdk.App();
new DocumentExtractStack(app, 'DocumentExtractStack', {
  env: { account: "686165858056", region: process.env.CDK_DEFAULT_REGION || "us-east-1" },
});