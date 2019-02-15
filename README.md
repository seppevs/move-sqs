# move-sqs
Move all SQS messages from one queue to another, with an ability to modify the message

✨ [![Build Status](http://img.shields.io/travis/seppevs/move-sqs.svg?style=flat)](https://travis-ci.org/seppevs/move-sqs) [![Coverage Status](https://coveralls.io/repos/github/seppevs/move-sqs/badge.svg?branch=master)](https://coveralls.io/r/seppevs/move-sqs) [![NPM](http://img.shields.io/npm/v/move-sqs.svg?style=flat)](https://www.npmjs.org/package/move-sqs) [![Downloads](http://img.shields.io/npm/dm/move-sqs.svg?style=flat)](https://www.npmjs.org/package/move-sqs) [![Dependencies](https://david-dm.org/seppevs/move-sqs.svg)](https://david-dm.org/seppevs/move-sqs) [![Known Vulnerabilities](https://snyk.io/test/github/seppevs/move-sqs/badge.svg)](https://snyk.io/test/github/seppevs/move-sqs) ✨

## Why?
This can be helpful when you want to reprocess all messages from a deadletter queue.

## Installation
````bash
$ npm install -g move-sqs
````

## Usage Help

```
$ move-sqs --help
  Move all SQS messages from one queue to another, with an ability to modify the message

  Usage
    $ move-sqs <input>

  Options
    --source-queue-url, -s  Source AWS SQS Queue URL
    --destination-queue-url, -d  Destination AWS SQS Queue URL
    --region, -r  AWS Region
    --access-key-id, -k  AWS Access Key ID
    --secret-access-key, -S AWS Secret Access Key
	--merge-json-message-with, -o (OPTIONAL) Merge the json message body with a given json string 
	
```

## Examples

### Basis usage:
`
$ move-sqs --sourceQueueUrl \"https://sqs.eu-west-1.amazonaws.com/123456789012/from-queue" --destinationQueueUrl "https://sqs.eu-west-1.amazonaws.com/123456789012/to-queue" --region "eu-west-1" --accessKeyId "YourAwsAccessKeyId" --secretAccessKey "YourAwsSecretKey"
`

### With --merge-json-message-with
`
$ move-sqs --sourceQueueUrl "https://sqs.eu-west-1.amazonaws.com/123456789012/from-queue" --destinationQueueUrl "https://sqs.eu-west-1.amazonaws.com/123456789012/to-queue" --region "eu-west-1" --accessKeyId "YourAwsAccessKeyId" --secretAccessKey "YourAwsSecretKey" --merge-json-message-with "{\"someAttribute\": \"weWantToChangeOrSet\"}"
`

The `--merge-json-message-with` argument is optional.

You can use it to modify the message body. The tool will parse the message body as json + parse your input as json.
Then it will perform a merge of the two and send the result to the destination queue.

