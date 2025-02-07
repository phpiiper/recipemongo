import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from 'mongodb';
import { compare } from 'bcrypt';

let client;

async function connectToDatabase() {
    if (client) {
        return client;
    }

    const mongoUri = `mongodb+srv://${process.env.MONGODB_DEFAULT_USER}:${process.env.MONGODB_DEFAULT_PW}@${process.env.MONGO_DB}`;

    client = await MongoClient.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    return client;
}


export default NextAuth({
    session: {
        strategy: 'jwt',  // Updated from 'jwt' (which is now the default strategy)
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                const dbClient = await connectToDatabase();
                const usersCollection = dbClient.db("recipes").collection('users');

                // Find user by username
                const user = await usersCollection.findOne({ user: credentials.user });

                if (!user) {
                    throw new Error('No user found with the username');
                }

                // Compare password with bcrypt
                const isValidPassword = await compare(credentials.password, user.password);
                if (!isValidPassword) {
                    throw new Error('Password doesn’t match');
                }

                // Return the user data
                return { id: user._id, name: user.user };
            },
            credentials: {
                user: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
            },
        }),
    ],
    callbacks: {
        // SignIn callback to add any additional logic before the session
        async signIn({ user, account, profile, email, credentials }) {
            // Here, you can log user data or perform extra checks
            return true;
        },

        // Redirect callback after sign-in (ensures valid redirect paths)
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },

        // JWT callback to attach user data to JWT
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },

        // Session callback to include user data in the session object
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
            }
            return session;
        },
    },
});
