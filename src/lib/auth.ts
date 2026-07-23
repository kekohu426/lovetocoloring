import NextAuth, { customFetch } from "next-auth";
import Google from "next-auth/providers/google";
import { fetch as undiciFetch, ProxyAgent } from "undici";
import { upsertGoogleUser } from "./users";

const authProxyUrl = process.env.AUTH_PROXY_URL;
const authProxyDispatcher = authProxyUrl ? new ProxyAgent(authProxyUrl) : null;

function authFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  if (!authProxyDispatcher) return fetch(input, init);
  return undiciFetch(input as unknown as Parameters<typeof undiciFetch>[0], {
    ...(init as unknown as Parameters<typeof undiciFetch>[1]),
    dispatcher: authProxyDispatcher,
  }) as unknown as ReturnType<typeof fetch>;
}

/**
 * Auth.js v5 with a JWT session — no database adapter. The Cradler `users` row
 * is created in the `jwt` callback on first sign-in, and its id rides along on
 * the token so every API route can identify the caller without a lookup.
 *
 * Credentials are read from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET / AUTH_SECRET
 * by convention, so the provider needs no explicit config.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      [customFetch]: authFetch,
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.sub && profile.email) {
        const user = await upsertGoogleUser({
          googleId: profile.sub,
          email: profile.email,
          name: profile.name ?? null,
          avatarUrl: typeof profile.picture === "string" ? profile.picture : null,
        });
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
