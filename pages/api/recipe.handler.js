import clientPromise from "../../lib/mongoconnect";
import NextAuth from "@/pages/api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
export default async (req, res) => {
    const session = await getServerSession(req, res, NextAuth)
    if (session) {
        if (req.method === 'POST') {
            try {
                const { recipe } = req.body;
                const client = await clientPromise;
                const db = client.db("recipes");
                const recipes = await db
                    .collection("recipelist")
                    .insertOne(recipe)
                res.status(201).json({
                    message: 'Data inserted successfully',
                    insertedId: recipes.insertedId,
                });
            } catch (e) {
                console.error(e);
            }
        } else if (req.method === "PUT") {

        }else {
            res.status(405).json({message: 'Method Not Allowed'});
        }
    } else {
        res.send({
            error: "You must be signed in to view the protected content on this page.",
        })

    }
}

