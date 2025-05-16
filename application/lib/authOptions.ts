<<<<<<< HEAD
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
=======
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
<<<<<<< HEAD
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
=======
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
<<<<<<< HEAD
          console.error('Authorize error:', error);
=======
          console.error("Authorize error:", error);
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
          return null;
        }
      },
    }),
  ],
  pages: {
<<<<<<< HEAD
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
=======
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
    maxAge: 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
