const AWS = require('aws-sdk');
const qs = require('querystring');
const generatePassword = require('password-generator');
const crypto = require('crypto');
const schema = require('./validation/schema');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const clientId = process.env.USER_POOL_CLIENT_ID;
const { DateTime } = require('luxon');
const key = 'v28zWKSqIEIFjtJdL0as3XIOQt9cc9zu'; // need to put in the secret

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

exports.handler = async (event, context) => {
  console.log(event);
  const { username, firstName, lastName } = qs.parse(event.body);
  const { err, value } = schema.validate({
    username,
    firstName,
    lastName
  });

  // check the parameter
  if (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        err
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
  const givenName = value.firstName;
  const familyName = value.lastName;
  const temporaryPassword = generatePassword(10, false, /[a-zA-Z0-9]/);
  const encryptedPassword = encrypt(temporaryPassword);
  const params = {
    ClientId: clientId,
    Password: temporaryPassword,
    Username: value.username.toLowerCase(),
    UserAttributes: [
      {
        Name: 'email',
        Value: value.username.toLowerCase()
      },
      {
        Name: 'given_name',
        Value: givenName
      },
      {
        Name: 'family_name',
        Value: familyName
      }
    ]
  };
  try {
    const data = await cognito.signUp(params).promise();
    // make sure cognito signup firstly
    console.log(data);
    const tableParams = {
      TableName: process.env.TABLE_NAME,
      Item: {
        id: value.username.toLowerCase(),
        tempPassword: encryptedPassword,
        firstName: givenName,
        lastName: familyName,
        updated_at: DateTime.local().setZone('Australia/Melbourne').toISO()
      }
    };
    await dynamodb.put(tableParams).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'success'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        Error: e
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
};
