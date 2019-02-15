const moveSqs = require('../src/move-sqs');

jest.mock('../src/move-sqs');

describe('cli', () => {
  it('should parse the command line args and invoke the move-sqs function', () => {
    process.argv = [
      'node',
      'cli',
      '--source-queue-url',
      'http://the.source-queue-url.com',
      '--destination-queue-url',
      'http://the.destination-queue-url.com',
      '--region',
      'eu-west-1',
      '--access-key-id',
      'theAccessKey',
      '--secret-access-key',
      'theSecretAccessKey',
      'merge-json-message-with',
      JSON.stringify({ timeout: '2019-02-01T12:00' }),
    ];

    const cli = require('../src/cli'); // eslint-disable-line global-require
    expect(cli.flags).toMatchSnapshot();
    expect(moveSqs).toHaveBeenCalledWith(cli.flags);
  });
});
