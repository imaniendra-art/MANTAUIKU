import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan kata sandi wajib diisi");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("Email tidak terdaftar");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Kata sandi salah");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          unitCode: user.unitCode,
          unitName: user.unitName,
          assignedIKUCodes: user.assignedIKUCodes || [],
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.unitCode = user.unitCode;
        token.unitName = user.unitName;
        token.assignedIKUCodes = user.assignedIKUCodes;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.unitCode = token.unitCode as string;
        session.user.unitName = token.unitName as string;
        session.user.assignedIKUCodes = (token.assignedIKUCodes as string[]) || [];
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "mantauiku-super-secret-key-2026",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
