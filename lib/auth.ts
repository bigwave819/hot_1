import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index";
import { admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";

const adminRole = "admin";
const userRole = "user";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: "your-client-id",
            clientSecret: "your-client-secret",
            redirectURI: "https://example.com/api/auth/callback/google"
        },
    },
    session: {
        expiresIn: 604800, // 7 days
        updateAge: 86400, // 1 day
    },
    plugins: [
        admin({
            adminRoles: [adminRole],
            defaultRole: userRole,
        }),
        nextCookies(),
    ]
});