const mongoose = require("mongoose");
const Opportunity = require("../models/Opportunity");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MongoDB URI not configured. Running in demo mode.");
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log("Collections ready: Users, Opportunities");

    // Index verification (optional — development only)
    if (process.env.NODE_ENV === 'development') {
      const indexes = await Opportunity.collection.getIndexes();
      console.log("🔍 Opportunity Indexes:", Object.keys(indexes));
    }

  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    console.warn("Running in demo mode without database.");
  }
};

module.exports = connectDB;