import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { refreshAccessToken } from "./api"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    tokenExpiration?: string
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Store backend tokens in a temporary map keyed by the Google account ID
// so we can pass them from the signIn callback to the jwt callback
const pendingTokens = new Map<
  string,
  { accessToken: string; refreshToken: string; expiration: string }
>()

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Send user data to your backend after successful Google sign-in
      // The backend returns { accessToken, refreshToken, expiration }
      if (account?.provider === "google" && user.email) {
        try {
          const backendUrl = process.env.BACKEND_API_URL
          if (backendUrl) {
            const res = await fetch(
              `${backendUrl}/api/auth/google-signin`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  googleId: profile?.sub,
                }),
              }
            )

            if (res.ok) {
              const data = (await res.json()) as {
                accessToken: string
                refreshToken: string
                expiration: string
              }

              // Stash tokens so the jwt callback can retrieve them
              if (profile?.sub) {
                pendingTokens.set(profile.sub, data)
              }
            } else {
              console.error("Backend auth failed:", res.status)
              return false
            }
          } else {
            console.error("BACKEND_API_URL is not configured")
            return false
          }
        } catch (error) {
          console.error("Backend unreachable, blocking sign-in:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      // On first sign-in, persist backend tokens into the JWT
      if (account && profile?.sub) {
        const backendTokens = pendingTokens.get(profile.sub)
        if (backendTokens) {
          token.accessToken = backendTokens.accessToken
          token.refreshToken = backendTokens.refreshToken
          token.tokenExpiration = backendTokens.expiration
          pendingTokens.delete(profile.sub)
        }
        token.googleId = profile.sub
        return token
      }

      // Auto-refresh: if the access token has expired, use the refresh token
      const expiration = token.tokenExpiration as string | undefined
      if (expiration && Date.now() >= new Date(expiration).getTime() - 60_000) {
        try {
          const refreshed = await refreshAccessToken(
            token.refreshToken as string
          )
          token.accessToken = refreshed.accessToken
          token.refreshToken = refreshed.refreshToken
          token.tokenExpiration = refreshed.expiration
        } catch (error) {
          console.error("Token refresh failed:", error)
          token.error = "RefreshTokenError"
        }
      }

      return token
    },
    async session({ session, token }) {
      // Expose backend tokens to the client session
      session.accessToken = token.accessToken as string | undefined
      session.refreshToken = token.refreshToken as string | undefined
      session.tokenExpiration = token.tokenExpiration as string | undefined
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
