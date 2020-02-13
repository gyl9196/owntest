const ejs = require('ejs');
const iassign = require('immutable-assign');

exports.handler = async (event, context) => {
  const confirmUrl = `http://test/account/verify?username=${encodeURIComponent(
    event.request.userAttributes.email
  )}&code=${event.request.codeParameter}`;

  const params = {
    confirmUrl: confirmUrl
  };

  const renderedEmail = await ejs.renderFile('./templates/test.html.ejs', params);

  return iassign(
    event,
    (e) => e.response,
    (r) => {
      r.emailMessage = renderedEmail;
      return r;
    }
  );
};
