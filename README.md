# serverless-aws-textract-implementation

This is serverless service that uses AWS Textract to extract text from images and PDFs. The communication with the service is done via EventBridge. The service is deployed using AWS CDK.


# Technologies

- AWS CDK
- AWS Textract
- AWS EventBridge
- AWS DynamoDB
- AWS S3
- AWS Lambda
- AWS SQS


# Architecture

![Architecture OW](https://github.com/skaznowiecki/document-extract/blob/main/assets/architecture.png)


For this arquitecture we need to consider the following:

- All the communication with the service is done via EventBridge, this allows us to decouple the service from the client.

- For Amazon Textract I used `QUERIES` to extract the text from the images and PDFs. The idea is to select only the text that we need to extract and not the whole document. This way is cheaper than using `FORMS` and `TABLES`.

- The configuration for the QUERIES is done in a DynamoDB table. This allows us to change the configuration without the need to redeploy the service.


# Configuration table for the `QUERIES`

The configuration table is a DynamoDB table with the following structure:

| pk | sk | query | type |
| --- | --- | --- | --- |
| document-A | address | ["Address"] | query |
| document-A | phone_number | ["Phone number"] | query |


- The `pk` is the document name and the `sk` is the field name. 
- The `query` is the list of words that we want to extract from the document. 
- The `type` could be `query` or `existance`. The `existance` type is used to check if a word exists in the document.

# Steps to deploy the service

1. Clone the repository
2. Install the dependencies `pnpm install`
3. Set up the AWS credentials `aws configure`
4. In the `bin/document-extract.ts` fill in the `AWS_ACCOUNT` and `AWS_REGION` variables.
4. Deploy the service `cdk deploy`

# How to use the service

1. Fill in the configuration table with the documents and fields that you want to extract. In the example's folder you can find an example of the configuration table. You can run the example with `npx ts-node configuration.ts` to fill the table.
2. Upload the document to the S3 bucket. You can use the example's folder to upload the example document to the S3 bucket. You can run the example with `npx ts-node upload.ts`.
3. Send an event to the service. You can use the example's folder to send the event. You can run the example with `npx ts-node send-event.ts`.
4. Go to AWS Console and check the results in the DynamoDB table.


This is an example of the configuration table:

![Configuration table](https://github.com/skaznowiecki/document-extract/blob/main/assets/configuration-table.png)


This is an example of the input document:

![Input document](https://github.com/skaznowiecki/document-extract/blob/main/assets/sample-invoice.png)


This is an example of the result:

![Result](https://github.com/skaznowiecki/document-extract/blob/main/assets/result.png)




Any feedback is welcome!