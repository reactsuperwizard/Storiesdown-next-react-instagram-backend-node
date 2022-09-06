import fs from 'fs';

export default async (req, res) => {
  const trendingUsers = JSON.parse(fs.readFileSync('./db/trending-users.json'));
  res.status(200).json(trendingUsers);
};
