const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('../db/blocked-profiles.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the blocked profiles database.');
});

// db.serialize(function () {
//   db.run(
//     'CREATE TABLE IF NOT EXISTS blocked_profiles (\
// 	id INTEGER PRIMARY KEY,\
// 	email TEXT NOT NULL,\
// 	username TEXT NOT NULL UNIQUE,\
//   message TEXT NOT NULL,\
//   ip TEXT NOT NULL)'
//   );
// });

// db.serialize(function () {
//   db.run('CREATE UNIQUE INDEX idx_username ON blocked_profiles (username);');
// });

// const p = new Promise((resolve, reject) => {
//   db.serialize(function () {
//     db.get(
//       'SELECT * FROM blocked_profiles WHERE username = 1234 LIMIT 1',
//       function (err, row) {
//         if (row == undefined) {
//           console.log('ko');
//         } else {
//           console.log('co');
//         }
//         resolve();
//       }
//     );
//   });
// });
// p.then(() => {
//   console.log('111');
// });

// db.serialize(function () {
//   db.run('DROP TABLE blocked_profiles');
// });

db.serialize(function () {
  db.each('SELECT rowid AS id, username, ip FROM blocked_profiles', function (
    err,
    row
  ) {
    console.log(row.id + ': ' + row.username, row.ip);
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
