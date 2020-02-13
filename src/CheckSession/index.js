const { CognitoUser, CognitoUserPool } = require("amazon-cognito-identity-js");
const qs = require("querystring");

global.fetch = require("node-fetch");

const userPool = new CognitoUserPool({
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.USER_POOL_CLIENT_ID
});

const checkSession = cognitoUser => {
  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
      }
      resolve(session);
    });
  });
};

exports.handler = async (event, context) => {
  const requestBody = qs.parse(event.body);
  const username = requestBody.username.toLowerCase();
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  });

  try {
    const data = await checkSession(cognitoUser);
    console.log(data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: data
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    };
  } catch (e) {
    console.log("============> error", e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: e.code,
        name: e.name,
        message: e.message
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    };
  }
};
