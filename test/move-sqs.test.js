const AWS = require('aws-sdk');
const { mockAwsServiceMethod } = require('jest-mock-aws');
const moveSqs = require('../src/move-sqs');
const fixtureFactory = require('./fixture-factory');

describe('move-sqs', () => {
  let input;
  let receiveMessage;
  let sendMessage;
  let deleteMessage;

  beforeEach(() => {
    input = fixtureFactory.createInput();
    receiveMessage = mockAwsServiceMethod(AWS, 'SQS', 'receiveMessage');
    sendMessage = mockAwsServiceMethod(AWS, 'SQS', 'sendMessage');
    deleteMessage = mockAwsServiceMethod(AWS, 'SQS', 'deleteMessage');
    jest.mock('');
  });

  const mockOneMessageOnSourceQueue = () => {
    receiveMessage.mockResolvedValueOnce({
      Messages: [
        {
          Body: JSON.stringify({ hello: 'world' }),
          ReceiptHandle: 'receiptHandle001',
        },
      ],
    });
    receiveMessage.mockResolvedValueOnce({});
  };

  it('should throw an error when required arguments are missing', async () => {
    const expectedError = new Error(
      'Missing required arguments: source-queue-url, destination-queue-url, region, access-key-id, secret-access-key',
    );
    await expect(moveSqs({})).rejects.toEqual(expectedError);
  });

  it('should receive the messages', async () => {
    mockOneMessageOnSourceQueue();
    await moveSqs(input);
    expect(receiveMessage.mock.calls).toMatchSnapshot();
  });

  it('should send a transformed message to the destination queue when input has `mergeJsonMessageWith` specified', async () => {
    mockOneMessageOnSourceQueue();
    input.mergeJsonMessageWith = JSON.stringify({ update: 'my update' });
    await moveSqs(input);
    expect(sendMessage.mock.calls).toMatchSnapshot();
  });

  it('should send the original message to the destination queue when input has no `mergeJsonMessageWith` specified', async () => {
    mockOneMessageOnSourceQueue();
    delete input.mergeJsonMessageWith;
    await moveSqs(input);
    expect(sendMessage.mock.calls).toMatchSnapshot();
  });

  it('should delete the message from the source queue', async () => {
    mockOneMessageOnSourceQueue();
    await moveSqs(input);
    expect(deleteMessage.mock.calls).toMatchSnapshot();
  });
});
