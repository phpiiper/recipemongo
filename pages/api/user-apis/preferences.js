import clientPromise from "@/lib/mongoconnect";
import NextAuth from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import bcrypt from 'bcryptjs';

export default async (req, res) => {
    const session = await getServerSession(req, res, NextAuth);
    // Check for session
    if (!session) {
        return res.status(403).json({ message: `Not allowed!` });
    }

    try {
        let userID = session.user.name;
        const client = await clientPromise;
        const db = client.db("recipes");

        if (req.method === "GET") {
            // Handle GET request: Get user preferences
            const user = await db.collection("users").findOne({ user: userID });
            if (user) {
                return res.json(user.prefs); // Send user prefs as the response
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        }

        if (req.method === "POST") {
            // Handle POST request: Update user preferences
            const { prefs } = req.body; // Expecting 'prefs' in the body (should be an object)

            if (!prefs) {
                return res.status(400).json({ message: "Preferences are required" });
            }

            const user = await db.collection("users").findOne({ user: userID });
            if (user) {
                // Update the user's preferences in the database
                const result = await db.collection("users").updateOne(
                    { user: userID },
                    { $set: { "prefs": prefs } }
                );
                if (result.modifiedCount !== 1){
                    return res.status(400).json({message: "No preferences were modified.", result, prefs})
                }
                return res.status(200).json({ message: "Preferences updated successfully: " + JSON.stringify(result) });
            } else {
                return res.status(404).json({ message: "User not found" });
            }
        }

        return res.status(405).json({ message: "Method Not Allowed" });

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: `Internal server error. ${error}` });
    }
};
