import clientPromise from "../../lib/mongoconnect";

export default async (req, res) => {
    try {
        let filters = {}
        const client = await clientPromise;
        const db = client.db("recipes");
        const recipes = await db
            .collection("recipelist")
            .find(filters)
            // .limit(10)
            .toArray();
        res.json(recipes);
    } catch (e) {
        console.error(e);
    }
}