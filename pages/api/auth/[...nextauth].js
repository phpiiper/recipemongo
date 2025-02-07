import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from 'mongodb';
import { compare } from 'bcrypt';

export default NextAuth({
    session: {
        jwt: true,
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                let client;

                try {
                    client = await MongoClient.connect("mongodb+srv://"+process.env.MONGODB_DEFAULT_USER+":"+process.env.MONGODB_DEFAULT_PW + "@" + process.env.MONGO_DB,
                        { useNewUrlParser: true, useUnifiedTopology: true }
                    );

                    const users = await client.db("recipes").collection('users');
                    const result = await users.findOne({ user: credentials.user });

                    if (!result) {
                        throw new Error('No user found with the username');
                    }

                    // const checkPassword = await compare(credentials.password, result.password);
                    const checkPassword = await compare(credentials.password, result.password)
                    if (!checkPassword) {
                        throw new Error('Password doesn’t match');
                    }

                    return { user: result.user };
                } catch (error) {
                    throw new Error(error.message);
                } finally {
                    if (client) {
                        await client.close();
                    }
                }
            },
            credentials: {
                user: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    }
});
