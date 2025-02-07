import clientPromise from "../../lib/mongoconnect";
import NextAuth from "@/pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth/next";

export default async (req, res) => {
    try {
        const { id } = req.query;
        const session = await getServerSession(req, res, NextAuth);
        let filters = {id: id ? id : null}
        if (session && session.user) {
            filters.$or = [
                { access: { $ne: "private" } },
                { author: session.user.name }
            ];
        } else {
            filters.access = { $ne: "private" };
        }


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