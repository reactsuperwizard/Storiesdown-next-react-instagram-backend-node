import redis from 'redis';
const { promisify } = require('util');

let rc = null;
// let countUserInfo = null;
let sessions = {};
export default {
  create: function () {
    if (rc === null) {
      console.log('Create client');
      rc = redis.createClient();
      console.log('pm_id:', process.env.pm_id);
    }
    return rc;
  },

  get: function () {
    return rc;
  },

  setRunTimeAccount: async function (account, opt) {
    const setAsync = promisify(rc.set).bind(rc);
    const expireAsync = promisify(rc.expire).bind(rc);
    try {
      if (opt.limit == true) {
        await setAsync(`runTime--${account}`, 0);
        await expireAsync(`runTime--${account}`, 60 * 60 * 6);
      } else {
        await setAsync(`runTime--${account}`, new Date().getTime());
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getRunTimeAccount: async function (account) {
    const getAsync = promisify(rc.get).bind(rc);
    try {
      const time = await getAsync(`runTime--${account}`);
      return time;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  setUser: async function (userInfo) {
    const setAsync = promisify(rc.set).bind(rc);
    const hSetAsync = promisify(rc.hset).bind(rc);
    const expireAsync = promisify(rc.expire).bind(rc);

    try {
      await hSetAsync(userInfo.username, Object.entries(userInfo).flat());
      await expireAsync(userInfo.username, 60 * 60 * 24 * 6);
      await setAsync(`pk--${userInfo.pk}`, userInfo.username);
      await expireAsync(`pk--${userInfo.pk}`, 60 * 60 * 24 * 6);
      return true;
    } catch (error) {
      if (error.toString().includes('maxmemory')) {
        console.log('Error Reddis: maxmemory ');
      } else {
        console.log(error);
      }
      return false;
    }
  },

  getUser: async function (params) {
    const hGetAsync = promisify(rc.hgetall).bind(rc);
    const getAsync = promisify(rc.get).bind(rc);

    try {
      let username = params.username;
      if (params.pk) {
        username = await getAsync(`pk--${params.pk}`);
      }
      const user = await hGetAsync(username);
      return user;
    } catch (error) {
      console.log(error);
      return {};
    }
  },

  isExist: async function (key) {
    const existAsync = promisify(rc.exists).bind(rc);

    try {
      return (await existAsync(key)) == 1;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};
