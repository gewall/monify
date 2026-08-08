import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_google_client_secret",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "dummy_github_client_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy_github_client_secret",
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        try {
          const foundUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (foundUsers.length === 0) {
            return null;
          }

          const user = foundUsers[0];

          if (!user.passwordHash) {
            // User registered via OAuth, no password set
            return null;
          }

          const isValidPassword = bcrypt.compareSync(password, user.passwordHash);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
            image: user.image,
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
      }
      // Ensure token.id is resolved against database by email if missing
      if (!token.id && token.email) {
        try {
          const found = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, token.email.toLowerCase()))
            .limit(1);
          if (found.length > 0) {
            token.id = found[0].id;
          }
        } catch (err) {
          console.error("jwt callback user lookup error:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET || "fallback_super_secret_auth_key_1234567890",
});
