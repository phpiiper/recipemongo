import clientPromise from "../../lib/mongoconnect";

export default async (req, res) => {
    try {
        const { id } = req.query;
        let filters = {id: id ? id : null}


        const client = await clientPromise;
        const db = client.db("recipes");
        const recipes = await db
            .collection("recipelist")
            .find(filters)
            // .limit(10)
            .toArray();
        res.json(recipes[0]);
    } catch (e) {
        console.error(e);
    }
}