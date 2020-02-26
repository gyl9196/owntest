exports.handler = async (event, context) => {
  console.log("I ma here");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "data"
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  };
};
