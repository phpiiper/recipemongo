import clientPromise from "../../lib/mongoconnect";
import NextAuth from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import bcrypt from 'bcryptjs';

export default async (req, res) => {
    const session = await getServerSession(req, res, NextAuth);
    const { user, pw } = req.query;

    // Check for session
    if (!session) {
        return res.status(403).json({ message: "Not allowed!" });
    }

    if (!user || !pw) {
        return res.status(400).json({ message: "Missing username or password." });
    }

    try {
        const client = await clientPromise;
        const db = client.db("recipes");

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ user });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists!" });
        }

        // Hash password and insert new user
        const hashedPassword = await bcrypt.hash(pw, 10);
        const userProf = { user, pw: hashedPassword };

        await db.collection("users").insertOne(userProf);

        return res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
