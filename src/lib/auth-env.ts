function readEnv(name: "AUTH_SECRET" | "NEXTAUTH_SECRET") {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getAuthSecret() {
  return readEnv("AUTH_SECRET") || readEnv("NEXTAUTH_SECRET");
}
