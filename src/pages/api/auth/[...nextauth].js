import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { useRouter } from 'next/router';
import log from 'logging-service';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials, req) {
        const { username, password } = credentials;
        const user = await prisma.user.findUnique({ where: { username } });

        if (user) {
          const passwordsMatch = await compare(password, user.password);
          if (passwordsMatch) {
            return user;
          }
        }

        // Return null if the username or password is invalid
        return null;
      }
    })
  ],

  // Use JWTs instead of sessions to store token data
  session: {
    strategy: 'jwt',
    cookie: {
      secure: false,
      sameSite: 'lax'
    }
  },

  // Encrypt JWTs using a secret
  jwt: {
    secret: process.env.JWT_SECRET
  },
  secret: process.env.JWT_SECRET,
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
      //   console.log('jwt callback');
      if (user) {
        token.user = user;
      }
      return token;
    },

    async session({ session, token, user }) {
      console.log('NextAuth.session.callback.keys', Object.keys(token));
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  adapter: PrismaAdapter({ prisma }),
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    }
  }
};

export default NextAuth(authOptions);
