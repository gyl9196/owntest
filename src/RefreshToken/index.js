global.fetch = require('node-fetch');

const refreshTokens = (refreshToken) => {
  return global.fetch('https://cognito-idp.ap-southeast-2.amazonaws.com/', {
    headers: {
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      'Content-Type': 'application/x-amz-json-1.1'
    },
    mode: 'cors',
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      ClientId: '2cn6b2d6vl0aaleqdj4oo9hs48',
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
        // SECRET_HASH: "your_secret", // In case you have configured client secret
      }
    })
  }).then((res) => {
    return res.json(); // this will give jwt id and access tokens
  });
};

exports.handler = async (event, context) => {
  const { refreshToken } = JSON.parse(event.body).params.data;
  try {
    const data = await refreshTokens(refreshToken);
    console.log(data.__type);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  } catch (e) {
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
