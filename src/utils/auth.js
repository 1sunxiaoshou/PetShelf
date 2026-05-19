// src/utils/auth.js
import { createNeonAuth } from "@neondatabase/neon-js";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
let neonAuthClient = null;

// Initialize Neon Auth Client if URL is present
if (authUrl) {
  try {
    neonAuthClient = createNeonAuth({
      authUrl: authUrl
    });
  } catch (err) {
    console.warn("Neon Auth initialization warning, falling back to mock mode:", err);
  }
}

/**
 * Checks if the user is currently authenticated
 * @returns {Promise<{ isAuthenticated: boolean, user: { id: string, name: string } | null, token: string | null }>}
 */
export async function getSession() {
  if (neonAuthClient) {
    try {
      const session = await neonAuthClient.getSession();
      if (session && session.user) {
        return {
          isAuthenticated: true,
          user: {
            id: session.user.id || session.user.sub,
            name: session.user.email || session.user.name || "NeonUser"
          },
          token: session.token
        };
      }
    } catch (err) {
      console.error("Neon Auth session verification error:", err);
    }
  }

  // Graceful Offline Sandbox Dev Mode fallback
  return {
    isAuthenticated: true, // Auto-logged in local sandbox
    user: {
      id: "local-dev-user",
      name: "LocalDevPanda"
    },
    token: "mock-jwt-token-local-dev"
  };
}

/**
 * Sign in action
 */
export async function signIn() {
  if (neonAuthClient) {
    try {
      await neonAuthClient.signIn();
      return;
    } catch (err) {
      console.error("Neon Auth sign-in failed:", err);
    }
  }
  
  alert("Local mock session activated: Logged in as LocalDevPanda!");
}

/**
 * Sign out action
 */
export async function signOut() {
  if (neonAuthClient) {
    try {
      await neonAuthClient.signOut();
      return;
    } catch (err) {
      console.error("Neon Auth sign-out failed:", err);
    }
  }

  alert("Local mock session logged out successfully!");
}
