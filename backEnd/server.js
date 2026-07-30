const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

async function startServer() {
    try {
        console.log("Starting application initialization sequence...");
        
        // Connect to Database
        await MongoDB.connect(config.db.uri);
        
        // Start Web Server
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`\n==================================================`);
            console.log(`Server is running successfully on port ${PORT}!`);
            console.log(`Local API URL: http://localhost:${PORT}`);
            console.log(`==================================================\n`);
        });
    } catch (error) {
        console.error("Cannot start server! Error details:", error);
        process.exit(1);
    }
}

startServer();