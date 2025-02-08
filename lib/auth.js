import client from "@/lib/mongoconnect";
import User from "@/models/User";
import credentials from "next-auth/providers/credentials";
import {compare} from "bcrypt";

export const authOptions = {
    providers: [
        credentials({
            name: "Credentials",
            id: "credentials",
            credentials: {
                user: { label: "Username", type: "username" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Check if credentials are missing
                if (!credentials || !credentials.user || !credentials.password) {
                    throw new Error("Missing credentials");
                }

                // Ensure the MongoDB client is connected
                await client();

                // Find preferences in the database
                const user = await User.findOne({
                    user: credentials.user,
                }).select("+password");

                // If preferences not found, throw error
                if (!user) {
                    throw new Error("Wrong Username");
                }

                // Compare password hashes
                /*
                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    preferences.password
                );*/
                const passwordMatch = await compare(credentials.password, user.password)

                // If password does not match, throw error
                if (!passwordMatch) {
                    throw new Error("Wrong Password");
                }

                // Return the preferences object if authentication is successful
                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
};

export default authOptions;
