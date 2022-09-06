import fs from 'fs';
import { getUserInfoByScraper } from '../../helpers/instagram';
export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      if (req.body.secretKey != 'stefantat') {
        return res
          .status(200)
          .json({ success: false, message: 'Wrong secret key!' });
      }
      let listUsers = req.body.listUsers
        .trim()
        .split('\n')
        .map((u) => u.trim());
      const currentUsers = JSON.parse(
        fs.readFileSync('./db/trending-users.json')
      ).map((u) => u.username);
      listUsers = listUsers.filter((u) => currentUsers.indexOf(u) == -1);
      // console.log(listUsers);
      const p = [];
      let errorUsers = [];
      listUsers.forEach((username) => {
        p.push(
          getUserInfoByScraper(username).then((response) => {
            if (response === false) {
              errorUsers.push(username);
              return false;
            }
            return {
              username,
              full_name: response.full_name,
              profile_pic_url: response.profile_pic_url,
            };
          })
        );
      });
      let users = await Promise.all(p);
      // console.log(users);
      users = users.filter((u) => u !== false);
      let message = '';
      if (errorUsers.length > 0) {
        message =
          'Cannot get info: ' +
          errorUsers.join(', ') +
          '. The others are updated.';
      } else {
        message = 'Updated!';
      }
      fs.writeFileSync(
        './db/trending-users.json',
        JSON.stringify(users, null, 2)
      );
      return res.status(200).json({ success: true, message });
    } catch (e) {
      console.log(e);
      return res.status(200).json({ success: false, message: 'Failed!' });
    }
  } else {
    return res.status(405);
  }
};
