const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;

console.log("Inside db.js");
console.log("TYPE OF POOL:", typeof pool.query);
