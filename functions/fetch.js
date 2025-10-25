require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION_NAME);

    const pipeline = [
      { $match: { catch: { $lt: 3 } } },
      { $group: { _id: null, avgWaterHeight: { $avg: "$water_height" } } }
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    if (result && result.avgWaterHeight != null) {
      console.log("Average water_height for catch < 3:", result.avgWaterHeight);
    } else {
      console.log("No documents matched or no water_height values to average.");
    }
  } catch (err) {
    console.error("Error fetching documents:", err);
  } finally {
    await client.close();
  }
}

run();
