const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    db: {
        uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach"
    }
};

console.log("[DEBUG CONFIG] Loaded config:", JSON.stringify(config, null, 2));
module.exports = config;