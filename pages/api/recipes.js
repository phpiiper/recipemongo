import clientPromise from "../../lib/mongoconnect";
import { getServerSession } from "next-auth/next";
import NextAuth from "@/pages/api/auth/[...nextauth]";

export default async (req, res) => {
    try {
        const client = await clientPromise;
        const session = await getServerSession(req, res, NextAuth);
        const db = client.db("recipes");

        // Extract query parameters
        const { name, cat, ingredients, getCategories } = req.query;
        let filters = {};

        // Check for valid session
        if (session && session.user) {
            filters.$or = [
                { access: { $ne: "private" } },
                { author: session.user.name }
            ];
        } else {
            filters.access = { $ne: "private" };
        }

        console.log("Received Query Params:", req.query); // Debugging

        // Handle name & category search with `$regex`
        if (name?.trim()) {
            filters.name = { $regex: new RegExp(name.trim(), "i") }; // Case-insensitive regex search
        }

        if (cat?.trim()) {
            filters.cat = { $regex: new RegExp(cat.trim(), "i") }; // Case-insensitive category search
        }

        // Handle ingredient search (ignore if empty)
        if (ingredients?.trim()) {
            const ingredientArray = ingredients
                .split(",")
                .map(ing => ing.trim())
                .filter(ing => ing.length > 0); // Remove empty values

            if (ingredientArray.length > 0) {
                filters.$or = [
                    { "ingredients.ingredient": { $in: ingredientArray.map(ing => new RegExp(ing, "i")) } }, // Direct ingredient match
                    { "ingredients.ingredients.ingredient": { $in: ingredientArray.map(ing => new RegExp(ing, "i")) } } // Nested ingredient match
                ];
            }
        }

        const query = filters;

        console.log("Final MongoDB Query:", JSON.stringify(query, null, 2)); // Debugging

        // Check if we need to fetch categories instead of recipes
        if (getCategories === "yes") {
            const categories = await db.collection("recipelist")
                .distinct("cat", query);
            return res.json({ categories });
        }

        // Fetch matching recipes (handle empty filters gracefully)
        const recipes = await db.collection("recipelist").find(query).toArray();

        res.json(recipes);
    } catch (e) {
        console.error("MongoDB Query Error:", e);

        // Check if the error is related to text search issues
        if (e.message.includes("text index required")) {
            return res.status(400).json({ error: "MongoDB text index is missing. Try using regex search instead." });
        }

        res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
};
