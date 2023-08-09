import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { constructDocumentBucket } from './resources/document-bucket';
import { constructDocumentQueue } from './resources/document-queue';
import { constructTextractTopic } from './resources/textract-topic';
import { constructDocumentOutputTable } from './resources/document-output-table';
import { constructDocumentConfigTable } from './resources/document-config-table';
import { constructEventBus } from './resources/event-bus';
import { documentAnalysed } from './functions/document-analysed';
import { documentDispatched } from './functions/document-dispatched';
import { documentQueued } from './functions/document-queued';
import { documentTableStream } from './functions/document-table-stream';

export class DocumentExtractStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const eventBus = constructEventBus(this);

    const documentBucket = constructDocumentBucket(this);
    const documentOutputTable = constructDocumentOutputTable(this);
    const documentConfigTable = constructDocumentConfigTable(this);

    const documentQueue = constructDocumentQueue(this);

    const { topic, topicRole } = constructTextractTopic(this);


    documentDispatched(this, documentQueue, documentOutputTable, documentConfigTable, documentBucket, eventBus);
    documentQueued(this, documentQueue, documentOutputTable, documentConfigTable, documentBucket, topic, topicRole);
    documentAnalysed(this, documentOutputTable, documentConfigTable, topic);
    documentTableStream(this, documentOutputTable, eventBus);

  }
}
