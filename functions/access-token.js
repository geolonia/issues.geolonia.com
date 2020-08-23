const fetch = require("isomorphic-fetch");
const {
  REACT_APP_GITHUB_OAUTH_APP_CLIENT_ID,
  GITHUB_OAUTH_APP_CLIENT_SECRET,
} = process.env;

const allowedOrigins = [
  "http://localhost:3000",
  "https://geolonia-ops.netlify.app/",
];

exports.handler = (event, _1, callback) => {
  // check method
  const method = event.httpMethod;
  if (method.toUpperCase() !== "POST") {
    return callback(null, {
      statusCode: 405,
      body: JSON.stringify({ message: "method not allowed" }),
    });
  }

  // check header
  const { origin } = event.headers;
  if (!allowedOrigins.includes(origin)) {
    return callback(null, {
      statusCode: 403,
      body: JSON.stringify({ message: "invalid request" }),
    });
  }

  // check body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid request body" }),
    });
  }

  const { code } = body;
  if (code) {
    fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: REACT_APP_GITHUB_OAUTH_APP_CLIENT_ID,
        client_secret: GITHUB_OAUTH_APP_CLIENT_SECRET,
        code,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": origin,
          },
          body: JSON.stringify(data),
        });
      });
  } else {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid parameters" }),
    });
  }
};
