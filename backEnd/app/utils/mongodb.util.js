const { MongoClient } = require("mongodb");

class MongoDB {
    static client = null;

    static connect = async (uri) => {
        if (this.client) {
            console.log("[DEBUG MONODB_UTIL] Using existing MongoDB client instance.");
            return this.client;
        }
        console.log(`[DEBUG MONGODB_UTIL] Connecting to MongoDB URI: ${uri}...`);
        this.client = await MongoClient.connect(uri);
        console.log("[DEBUG MONGODB_UTIL] Successfully connected to MongoDB database!");
        return this.client;
    };
}

module.exports = MongoDB;