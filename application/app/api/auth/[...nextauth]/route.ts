<<<<<<< HEAD
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const handler = NextAuth(authOptions);

=======
import NextAuth from "next-auth";

import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);
>>>>>>> 72f467238828254b18ae9a2f965f5bdf175dc8a9
export { handler as GET, handler as POST };
