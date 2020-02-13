const {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool
} = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');
const userPool = new CognitoUserPool({
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.USER_POOL_CLIENT_ID
});

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

const getUserAttributes = (cognitoUser) => {
  return new Promise((resolve, reject) => {
    cognitoUser.getUserAttributes((e, result) => {
      if (e) {
        return reject(e);
      }
      return resolve(result);
    });
  });
};

exports.handler = async (event, context) => {
  const { username, password } = JSON.parse(event.body).params.data;
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool
  });
  try {
    const userInfo = await login(cognitoUser, username, password);
    const data = await getUserAttributes(cognitoUser);
    console.log(data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        userInfo
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (e) {
    return {
      statusCode: e.statusCode,
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
