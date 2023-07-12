// Sets a config for what/where we want to conect our DB.
const Pool = require("pg").Pool;

// Your login creds
const pool = new Pool({
  user: "postgres",
  password: "Pinecone250",
  database: "ChanNotes",
  host: "localhost",
  port: 5432,
});

module.exports = pool; // We can access this in other files!
