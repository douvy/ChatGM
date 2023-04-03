// generate-types.ts

import { generateTypeGraphQLTypes } from "@generated/typegraphql-prisma";

generateTypeGraphQLTypes({
  schemaPath: "./prisma/schema.prisma",
  outputDirPath: "./generated",
});

