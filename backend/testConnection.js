const { MongoClient } = require("mongodb");

const uri =
  "mongodb://ashalalam2005_db_user:3lXl3N3sUrdGdOPO@ac-mibqvxf-shard-00-00.ckp1scw.mongodb.net:27017,ac-mibqvxf-shard-00-01.ckp1scw.mongodb.net:27017,ac-mibqvxf-shard-00-02.ckp1scw.mongodb.net:27017/?ssl=true&replicaSet=atlas-mibqvxf-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ SUCCESS: Connected to MongoDB!");
  } catch (error) {
    console.error("❌ ERROR:", error.message);
  } finally {
    await client.close();
  }
}

run();