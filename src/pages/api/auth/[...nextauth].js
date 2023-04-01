import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '../../../lib/mongodb';
import { compare } from 'bcrypt';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { useRouter } from 'next/router';

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// const client = await clientPromise;

export default NextAuth({
    providers: [
        CredentialsProvider({
            type: 'credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials, req) {
                const { username, password } = credentials;
                const client = await clientPromise;
                await client.connect();

                const db = client.db('ChatGM');

                const user = await db.collection('users').findOne({ username });

                if (user) {
                    const passwordsMatch = await compare(password, user.password);
                    if (passwordsMatch) {
                        return user;
                    }
                } else {
                    // Return null if the username or password is invalid
                    return null;
                }
            },
        }),
    ],

    // Use JWTs instead of sessions to store token data
    session: {
        strategy: 'jwt',
    },

    // Encrypt JWTs using a secret
    jwt: {
        secret: process.env.JWT_SECRET,
    },

    // Specify the URL to redirect to when authentication is successful
    // If this property is not set, the user will be redirected to the home page
    callbacks: {
        // async signIn({ user, account, profile, email, credentials }) {
        //     console.log("signIn callback");
        //     return true
        // },

        async signOut() {
            await nextAuth.signout();
            const router = useRouter();
            router.push('/auth/signin');
        },

        async jwt({ token, user, account, profile, isNewUser }) {
            console.log("jwt callback");
            if (user) {
                token.user = user;
            }
            return token;
        },

        async session({ session, token, user }) {
            console.log("session callback");
            return token;
        },
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    adapter: MongoDBAdapter(client, {
        dbName: process.env.MONGODB_DB,
    }),
});
