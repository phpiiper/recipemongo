import { MongoClient } from "mongodb";

const URI = "mongodb+srv://"+process.env.MONGODB_DEFAULT_USER+":"+process.env.MONGODB_DEFAULT_PW + "@" + process.env.MONGO_DB;
const options = { appName: "devrel.template.nextjs" };
let client;

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global;

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(URI, options);
    }
    client = globalWithMongo._mongoClient;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(URI, options);
}

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.

export default client;
