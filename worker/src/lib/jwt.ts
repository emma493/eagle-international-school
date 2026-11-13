import { jwtVerify, errors as joseErrors } from "jose";

// Cache for Google's public keys (Firebase ID token signing keys)
let publicKeysCache: { [kid: string]: string } | null = null;
let keysFetchedAt = 0;
const KEYS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const FIREBASE_CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

async function fetchPublicKeys(projectId: string): Promise<{ [kid: string]: string }> {
  const now = Date.now();
  if (publicKeysCache && now - keysFetchedAt < KEYS_CACHE_TTL) {
    return publicKeysCache;
  }

  const res = await fetch(FIREBASE_CERT_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Firebase public keys: ${res.status}`);
  }

  const keys: { [kid: string]: string } = await res.json();
  publicKeysCache = keys;
  keysFetchedAt = now;
  return keys;
}

export async function verifyIdToken(env: any, idToken: string) {
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured");
  }

  const keys = await fetchPublicKeys(projectId);

  // Try each public key until one verifies successfully
  const lastError: Error[] = [];

  for (const [kid, pemCert] of Object.entries(keys)) {
    try {
      const { payload } = await jwtVerify(idToken, pemCert, {
        algorithms: ["RS256"],
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });

      return payload as {
        uid: string;
        role?: string;
        email?: string;
        phone_number?: string;
        [key: string]: any;
      };
    } catch (err: any) {
      lastError.push(err);
    }
  }

  throw new joseErrors.JOSEError(
    `Failed to verify Firebase ID token: ${lastError.map((e) => e.message).join("; ")}`
  );
}
