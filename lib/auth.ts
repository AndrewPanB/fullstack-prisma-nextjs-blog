import { createRequire } from 'node:module';
import prisma from './prisma'

const require = createRequire(import.meta.url);
const GitHubProvider = require('next-auth/providers/github').default;
const { PrismaAdapter } = require('@next-auth/prisma-adapter');

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
};
