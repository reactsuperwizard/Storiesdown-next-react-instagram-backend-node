import { getUserInfo } from '../../../helpers/instagram';
import redisClient from '../../../helpers/redis-client';
import sqlite3Client from '../../../helpers/sqlite3-client';
import cryptor from '../../../helpers/cryptor';
require('dotenv').config();

export default async (req, res) => {
  let {
    query: { id, key },
  } = req;
  id = id.toLowerCase();
  if (key != 'storiesdown' || id.includes(' ')) {
    return res.status(200).json({ status: 0 });
  }

  let igApi = async () => {
    const isExist = await new Promise((resolve, reject) => {
      sqlite3Client.get().serialize(function () {
        sqlite3Client
          .get()
          .get(
            'SELECT 1 FROM blocked_profiles WHERE username = ? LIMIT 1',
            [id],
            function (err, row) {
              if (row == undefined) {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          );
      });
    });
    if (isExist) {
      console.log('Blocked profile:', id);
      return res.status(200).json({ status: 0 });
    }
    try {
      let user = {};
      try {
        if (await redisClient.isExist(id)) {
          user.info = await redisClient.getUser({ username: id });
        }
      } catch (error) {
        console.log('redisClient:', error);
      }

      if (user.info == undefined) {
        const data = await getUserInfo(id);
        if (data.status == 1) {
          await redisClient.setUser(data.info);
          data.info.id = data.info.pk;
          data.info.pk = cryptor.encrypt(data.info.pk.toString());
          data.status = 1;
        }
        return res.status(200).json(data);
      } else {
        user.info.is_private === 'true'
          ? (user.info.is_private = true)
          : (user.info.is_private = false);
        user.info.id = user.info.pk;
        user.info.pk = cryptor.encrypt(user.info.pk.toString());
        user.status = 1;
        return res.status(200).json(user);
      }
    } catch (error) {
      console.log('User error: ', error.toString());
      console.log('Error user: ', id);
      return res.status(200).json({ status: 2 });
    }
  };
  if (redisClient.get() == null) {
    redisClient.create();
  }
  igApi();
};
