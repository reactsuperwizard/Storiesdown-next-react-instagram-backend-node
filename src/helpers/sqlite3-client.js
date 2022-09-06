const sqlite3 = require('sqlite3').verbose();

let client = null;

export default {
  get: function () {
    if (client === null) {
      client = new sqlite3.Database('./db/blocked-profiles.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the blocked profiles database.');
      });
    }
    return client;
  },
};
