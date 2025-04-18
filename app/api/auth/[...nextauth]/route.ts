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
    isEmployee?: boolean;
    designation?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      userType: string;
      image?: string | null;
      isEmployee?: boolean;
      designation?: string;
    };
  }
}

// Extend the built-in token types
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userType?: string;
    isEmployee?: boolean;
    designation?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isEmployee: { label: "Is Employee", type: "text", optional: true }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter an email and password");
          }

          // Check if this is an employee login attempt
          if (credentials.isEmployee === 'true') {
            const employee = await prisma.employee.findUnique({
              where: {
                email: credentials.email,
              },
              include: {
                privileges: true
              }
            });

            if (!employee) {
              throw new Error("No employee found with this email");
            }

            const isValidPassword = await bcrypt.compare(
              credentials.password,
              employee.password
            );

            if (!isValidPassword) {
              throw new Error("Invalid password");
            }

            return {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              userType: "EMPLOYEE",
              image: employee.image,
              isEmployee: true,
              designation: employee.designation,
            };
          }

          // Regular user authentication
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            }
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            image: user.image,
            isEmployee: false
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.isEmployee = user.isEmployee;
        token.designation = user.designation;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.user.isEmployee = token.isEmployee as boolean;
        session.user.designation = token.designation as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };