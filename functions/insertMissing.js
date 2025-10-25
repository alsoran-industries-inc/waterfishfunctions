require("dotenv").config();
const { MongoClient } = require("mongodb");
const records = require("[path/to/file]");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);


async function run() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION_NAME);
    records.forEach(element => {
        //check for date existing
        //insert only if not existing
    });

  } finally {
    await client.close();
  }
}
run().catch(console.dir);