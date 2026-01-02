import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const { privateKey, publicKey } = await generateKeyPair("RS256", {
  extractable: true,
});

const privateKeyPem = await exportPKCS8(privateKey);
const publicKeyJwk = await exportJWK(publicKey);

const jwks = JSON.stringify({
  keys: [
    {
      use: "sig",
      alg: "RS256",
      ...publicKeyJwk,
    },
  ],
});

process.stdout.write(
  `CONVEX_AUTH_PRIVATE_KEY="${privateKeyPem.replace(/\n/g, "\\n")}"`
);
process.stdout.write("\n\n");
process.stdout.write(`JWKS=${jwks}`);
process.stdout.write("\n");
