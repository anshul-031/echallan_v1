import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    userType: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      userType: string;
      image?: string | null;
    };
  }
}

// Extend the built-in token types
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userType?: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST  , authOptions};