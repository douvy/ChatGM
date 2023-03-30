import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '../../../lib/mongodb';

export default NextAuth({
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {
                console.log('......')
                const { username, password } = credentials;
                const client = await clientPromise;
                await client.connect();

                const db = client.db('ChatGM');

                const user = await db.collection('users').findOne({ username });

                if (user && user.password === password) {
                    // Return true if the username and password are valid
                    return user;
                } else {
                    // Return null if the username or password is invalid
                    return null;
                }
            },
        }),
    ],

    // Use JWTs instead of sessions to store token data
    session: {
        // jwt: true,
    },

    // Encrypt JWTs using a secret
    jwt: {
        secret: process.env.JWT_SECRET,
    },

    // Specify the URL to redirect to when authentication is successful
    // If this property is not set, the user will be redirected to the home page
    callbacks: {
        async jwt(token, user, account, profile, isNewUser) {
            if (user) {
                token.userId = user._id;
            }

            return token;
        },

        async session(session, token) {
            session.user = {
                id: token.userId,
            };

            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    }
});
