import {
  getStoriesByScraper,
  getStoriesV2,
  getStoriesV3,
  getStoriesV4,
  getStoriesV5,
  getStoriesV52,
  getStoriesV6,
  getStoriesV7,
  getStoriesV72,
  getStoriesV8,
  getStoriesV9,
  getStoriesV10,
  getStoriesV11,
  getStoriesV12,
  getStoriesV13,
  getStoriesV14,
} from '../../../helpers/instagram';
import cryptor from '../../../helpers/cryptor';

require('dotenv').config();

export default async (req, res) => {
  const {
    query: { pk, _username },
  } = req;

  try {
    let id = pk;
    if (id.length > 20) {
      id = cryptor.decrypt(pk);
    }
    let response = {};
    let r = Math.random();
    if (r > 0.3) {
      response = await getStoriesV14(id, _username);
    } else if (r > 0.15) {
      response = await getStoriesV13(id, _username);
    } else if (r >= 0) {
      response = await getStoriesV9(id, _username);
    } else {
      // response = await getStoriesV12(id, _username);
    }
    res.status(200).json(response);
  } catch (e) {
    console.log(e, pk);
    console.log('Error story: ', _username, pk);
    res.status(200).json({ status: 0 });
  }
};
