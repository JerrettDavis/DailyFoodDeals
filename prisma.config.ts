import path from "node:path";
import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./src/lib/database-config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: getDatabaseUrl(),
  },
});
