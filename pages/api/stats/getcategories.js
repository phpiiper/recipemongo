import clientPromise from "@/lib/mongoconnect";

export default async (req, res) => {
    // Check for session
    try {
        const client = await clientPromise;
        const db = client.db("recipes");
        const recipes = await db.collection("recipelist")
        const result = await recipes.distinct("cat")
        res.json(result)
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: `Internal server error. ${error}` });
    }
};

