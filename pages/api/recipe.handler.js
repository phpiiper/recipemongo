import clientPromise from "../../lib/mongoconnect";
import NextAuth from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async (req, res) => {
    const session = await getServerSession(req, res, NextAuth);

    // Error handling function
    function errMsg(x) {
        res.status(418).json({
            message: `Data not pushed! ${x ? x : ""}`,
        });
        return; // Ensures no further code runs after the error is sent
    }

    // Check for session
    if (session) {
        let recipe = req.body;

        // Ensure recipe exists and fields are valid
        if (!recipe) {
            return errMsg("Req not sent.");
        }
        if (!recipe.name || recipe.name.length < 3) {
            return errMsg("Recipe name is not long enough");
        }
        if (!recipe.cat || recipe.cat.length < 3) {
            return errMsg("Recipe category name is not long enough");
        }

        // Handle POST request to insert data
        if (req.method === 'POST') {
            try {
                const client = await clientPromise;
                const db = client.db("recipes");
                if (session === "authenticated" && session.user) {  recipe.access = "private"; recipe.author = session.user.name;
                 }
                const recipes = await db.collection("recipelist").insertOne(recipe);

                res.status(201).json({
                    message: 'Data inserted successfully',
                    insertedId: recipes.insertedId,
                });
            } catch (e) {
                console.error(e);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
        // Handle PUT request to update data
        else if (req.method === "PUT") {
            try {
                const client = await clientPromise;
                const db = client.db("recipes");

                // Ensure you're querying with the correct primary field (usually _id)
                const updateResult = await db.collection("recipelist").updateOne(
                    { _id: recipe._id }, // Assuming you're using _id for identification
                    { $set: recipe }
                );

                // Check if any document was updated
                if (updateResult.modifiedCount > 0) {
                    res.status(200).json({
                        message: 'Data updated successfully',
                    });
                } else if (updateResult.upsertedId) {
                    res.status(200).json({
                        message: 'Data inserted (upsert) successfully',
                        insertedId: updateResult.upsertedId,
                    });
                } else {
                    res.status(404).json({
                        message: 'No matching recipe found to update',
                    });
                }
            } catch (e) {
                console.error(e);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
        // Handle unsupported HTTP methods
        else {
            res.status(405).json({ message: 'Method Not Allowed' });
        }
    } else {
        // No session found
        res.status(401).json({
            error: "You must be signed in to view the protected content on this page.",
        });
    }
};
