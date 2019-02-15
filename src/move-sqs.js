const AWS = require('aws-sdk');
const deepMerge = require('deepmerge');
const pWhilst = require('p-whilst');
const pLimit = require('p-limit');
const { kebabCase } = require('change-case');

const MOVE_CONCURRENCY = 65;
const RECEIVE_PARAMS = { MaxNumberOfMessages: 10, VisibilityTimeout: 10 };
const REQUIRED_ARGS = [
  'sourceQueueUrl',
  'destinationQueueUrl',
  'region',
  'accessKeyId',
  'secretAccessKey',
];

const validate = (input) => {
  const missing = REQUIRED_ARGS.filter((arg) => input[arg] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required arguments: ${missing
        .map((arg) => kebabCase(arg))
        .join(', ')}`,
    );
  }
};

const createSQS = ({ region, accessKeyId, secretAccessKey }) =>
  new AWS.SQS({
    apiVersion: '2012-11-05',
    region,
    accessKeyId,
    secretAccessKey,
  });

const receiveMessagesBatch = async ({ sqs, queueUrl }) => {
  const data = await sqs
    .receiveMessage({ ...RECEIVE_PARAMS, QueueUrl: queueUrl })
    .promise();
  return data.Messages ? data.Messages : null;
};

const receiveAllMessages = async ({ sqs, queueUrl }) => {
  let stopReceiving = false;
  let messages = [];
  await pWhilst(
    () => !stopReceiving,
    async () => {
      const messagesBatch = await receiveMessagesBatch({ sqs, queueUrl });
      if (messagesBatch) {
        messages = messages.concat(messagesBatch);
      } else {
        stopReceiving = true;
      }
    },
  );
  return messages;
};

const transformJSON = ({ json, mergeJsonMessageWith }) => {
  const override = JSON.parse(mergeJsonMessageWith);
  const jsonObj = JSON.parse(json);
  return JSON.stringify(deepMerge(jsonObj, override));
};

const sendMessage = async ({ sqs, queueUrl, messageBody }) => {
  await sqs
    .sendMessage({ QueueUrl: queueUrl, MessageBody: messageBody })
    .promise();
};

const deleteMessage = async ({ sqs, queueUrl, receiptHandle }) =>
  sqs
    .deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle })
    .promise();

const createMoveJob = async ({
  message,
  sqs,
  mergeJsonMessageWith,
  sourceQueueUrl,
  destinationQueueUrl,
}) => {
  const messageBody = mergeJsonMessageWith
    ? transformJSON({
        json: message.Body,
        mergeJsonMessageWith,
      })
    : message.Body;

  await sendMessage({ sqs, queueUrl: destinationQueueUrl, messageBody });
  await deleteMessage({
    sqs,
    queueUrl: sourceQueueUrl,
    receiptHandle: message.ReceiptHandle,
  });
};

module.exports = async (input) => {
  await validate(input);
  const start = new Date().getTime();
  const {
    sourceQueueUrl,
    destinationQueueUrl,
    region,
    accessKeyId,
    secretAccessKey,
    mergeJsonMessageWith,
  } = input;

  const sqs = createSQS({ region, accessKeyId, secretAccessKey });
  const messages = await receiveAllMessages({ sqs, queueUrl: sourceQueueUrl });
  const limit = pLimit(MOVE_CONCURRENCY);
  const moveJobs = messages.map((message) =>
    limit(() =>
      createMoveJob({
        message,
        sqs,
        mergeJsonMessageWith,
        sourceQueueUrl,
        destinationQueueUrl,
      }),
    ),
  );
  await Promise.all(moveJobs);
  const end = new Date().getTime();
  console.log(`Moved ${moveJobs.length} message(s) in ${end - start} ms`); // eslint-disable-line no-console
};
