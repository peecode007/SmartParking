// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // console.log('Authorize credentials:', credentials);
        if (!credentials?.email || !credentials?.password) {
          // console.log('Missing credentials');
          return null;
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          // console.log('User found:', user);
          if (!user) {
            // console.log('No user found');
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          // console.log('Password valid:', isValid);
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
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
    // async signIn({ user }) {
    //   const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // fallback for local dev
    
    //   if (user.role === 'admin') {
    //     return `${baseUrl}/admin-dashboard`;
    //   }
    //   return `${baseUrl}/dashboard`;
    // }
    
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };