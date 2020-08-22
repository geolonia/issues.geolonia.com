const crypto = require("crypto");

const { CLIENT_ID, CLIENT_SECRET } = process.env;

exports.handler = (event, contect, callback) => {
  const { code, state } = event.queryStringParameters;
  if (code) {
    const state = crypto.randomBytes(128).toString("hex");

    fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redurect_uri: "http://localhost:8080/login/callback",
        state,
      }),
      header: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        callback(data);
      });
  }
};
