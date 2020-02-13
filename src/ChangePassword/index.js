const AWS = require('aws-sdk');
const qs = require('querystring');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool
} = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const key = 'v28zWKSqIEIFjtJdL0as3XIOQt9cc9zu'; // need to put in the secret

const decrypt = (text) => {
  const iv = Buffer.from(text.iv, 'hex');
  const encryptedText = Buffer.from(text.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const login = (cognitoUser, username, password) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (data) => {
        return resolve(data);
      },
      onFailure: (err) => {
        return reject(err);
      }
    });
  });
};

const changePassword = (cognitoUser, oldPassword, newPassword) => {
  return new Promise((resolve, reject) => {
    cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const userPool = new CognitoUserPool({
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.USER_POOL_CLIENT_ID
});

exports.handler = async (event, context) => {
  const requestBody = qs.parse(event.body);
  const newPassword = requestBody.newPassword;
  // As we cannot know what user types, frontend deal with it
  const username = requestBody.username.toLowerCase();
  const id = username;
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id
    }
  };

  // extract it for both function call
  const cognitoUser = new CognitoUser({
    Username: id,
    Pool: userPool
  });
  try {
    const data = await dynamodb.get(params).promise();
    const oldPassword = decrypt(data.Item.tempPassword);
    console.log('record oldPassword', oldPassword);
    await login(cognitoUser, id, oldPassword);
    // After authentifcate the user, we could change the password
    const infoChange = await changePassword(cognitoUser, oldPassword, newPassword);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: infoChange
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: e.code,
        name: e.name,
        message: e.message
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
};
