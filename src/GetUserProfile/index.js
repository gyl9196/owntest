const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  // 验证jwt token
  let response = {};
  const tableParams = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: '7a9bca2e-7e8c-450f-b71c-0903430a5f52'
    }
  };

  try {
    const data = await dynamodb.get(tableParams).promise();
    response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data.Item
      })
    };
  } catch (e) {
    console.log('Could not locate session', e);
    console.log(e.message);
  }

  return response;
};
