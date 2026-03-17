const LOCAL_DATABASE_URL = "file:./prisma/dev.db";

function readEnv(name: "DATABASE_URL" | "TURSO_DATABASE_URL" | "TURSO_AUTH_TOKEN") {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getConfiguredDatabaseUrl() {
  return readEnv("DATABASE_URL") || readEnv("TURSO_DATABASE_URL");
}

export function getDatabaseUrl() {
  return getConfiguredDatabaseUrl() ?? LOCAL_DATABASE_URL;
}

export function getLibSqlAuthToken() {
  return readEnv("TURSO_AUTH_TOKEN");
}

export function hasConfiguredDatabaseUrl() {
  return Boolean(getConfiguredDatabaseUrl());
}

function isRemoteLibSqlUrl(url: string) {
  return url.startsWith("libsql://") || url.startsWith("https://") || url.startsWith("http://");
}

export function hasUsableDatabaseConfig() {
  const url = getConfiguredDatabaseUrl();
  if (!url) return false;

  if (isRemoteLibSqlUrl(url) && !getLibSqlAuthToken()) {
    return false;
  }

  return true;
}
