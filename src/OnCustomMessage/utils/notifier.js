const AWS = require('aws-sdk');

const sendNotification = (notification) => {
  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01', region: 'us-east-1' }).sendEmail(notification).promise();
  console.log('Send account verification email to user', JSON.stringify(notification));
  sendPromise.then(data => {
    console.log(data.MessageId);
  }).catch(err => {
    console.error(err, err.stack);
  });
};

const notify = (data) => {
  const notification = {
    Destination: {
      CcAddresses: [],
      ToAddresses: [
        data.recipient
      ]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: data.html
        },
        Text: {
          Charset: 'UTF-8',
          Data: data.plain
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: data.subject
      }
    },
    Source: 'yanlin96.gong@gmail.com',
    ReplyToAddresses: []
  };

  sendNotification(notification);
};

module.exports = notify;
