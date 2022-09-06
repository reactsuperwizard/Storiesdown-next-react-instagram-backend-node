import axios from 'axios';
import sqlite3Client from '../../helpers/sqlite3-client';

export default async (req, res) => {
  if (req.method === 'POST') {
    let googleUrl =
      'https://www.google.com/recaptcha/api/siteverify?secret=' +
      '6LesHdcZAAAAALg-GFnVCAJCfFi39mC5LdWKCoUn' +
      '&response=' +
      req.body.captcha;

    let captchaResponse = await axios({
      url: googleUrl,
    });

    if (
      captchaResponse.data.success === false ||
      req.body.email.length > 255 ||
      req.body.username.length > 255 ||
      req.body.message > 1024
    ) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({ success: false, message: 'captcha failed' })
      );
    } else {
      const ip =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress;
      sqlite3Client.get().serialize(function () {
        sqlite3Client
          .get()
          .run(
            'INSERT INTO blocked_profiles(email,username,message,ip) VALUES(?, ?, ?, ?)',
            [
              req.body.email.toLowerCase(),
              req.body.username.toLowerCase(),
              req.body.message,
              ip,
            ],
            function (err) {
              if (err) {
                console.log(err.message);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: true,
                    message: 'This username was requested before.',
                  })
                );
              }
              // get the last insert id
              console.log(`A row has been inserted with rowid ${this.lastID}`);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(
                JSON.stringify({
                  success: true,
                  message:
                    'Thank you for requesting, we will check and remove your profile in less than 24 hours.',
                })
              );
            }
          );
      });
    }
  } else {
    return res.status(405);
  }
};
