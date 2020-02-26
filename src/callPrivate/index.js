global.fetch = require("node-fetch");

const refreshTokens = () => {
  return global
    .fetch(
      "https://cid5y5jmtl.execute-api.ap-southeast-2.amazonaws.com/Dev/test"
    )
    .then(res => {
      return res.json(); // this will give jwt id and access tokens
    });
};

exports.handler = async (event, context) => {
  try {
    const data = await refreshTokens();
    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
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
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    };
  }
};
