import clientPromise from "@/lib/mongoconnect";
import bcrypt from "bcryptjs"

export default async (req, res) => {
    try {
        if (req.body) {
            const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const client = await clientPromise;
            const db = client.db("recipes");
            if (req.method === "POST") {
                if (body.username.length < 5){
                    return res.status(400).json({
                        message: "Username must be longer than 5 characters!"
                    });
                }
                if (body.password.length < 5){
                    return res.status(400).json({
                        message: "Password must be longer than 5 characters!"
                    });
                }
                const user_exists = await db
                    .collection("users")
                    .find({user: body.username})
                    // .limit(10)
                    .toArray();
                if (user_exists.length === 1){
                    return res.status(400).json({
                        message: "Username is taken!"
                    });
                }
                // ELSE: create account
                const salt = await bcrypt.genSalt(10);
                let acc = {};
                    acc.user = body.username;
                    acc.password = await bcrypt.hash(body.password,salt)
                    acc.prefs = {
                        fontFamily: "Calibri",
                        fontSize: "18px",
                        categories: {},
                        iconTextHelp: true,
                        shortenMeasurements: false,
                        compactSize: "Standard",
                        theme: "Light",
                        favorites: []
                    }

                const recipes = await db.collection("users").insertOne(acc);
                return res.status(200).json({
                    message: 'Data inserted successfully',
                    insertedId: recipes.insertedId,
                });
            }
            return res.status(405).json({ message: "Method Not Allowed" });
        }
        else {res.status(400).json({message: "No request body!"});}

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: `Internal server error. ${error}` });
    }
};
