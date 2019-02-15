exports.createInput = () => ({
  sourceQueueUrl:
    'https://sqs.eu-west-1.amazonaws.com/123456789012/the-source-queue',
  destinationQueueUrl:
    'https://sqs.eu-west-1.amazonaws.com/123456789012/the-destination-queue',
  region: 'eu-west-1',
  accessKeyId: 'AK1234567MYACCESSKEY',
  secretAccessKey: 'AK1234567MYSECRETKEY',
  mergeJsonMessageWith: JSON.stringify({ update: '2019-02-15T08:09:34.827Z' }),
});
