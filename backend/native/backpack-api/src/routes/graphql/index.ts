import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";

import { authDirectiveTransformer } from "./directives";
import { queryResolvers, userResolvers, walletResolvers } from "./query";
import type { Node, PageInfo, Resolvers } from "./types";
import { ChainId } from "./types";

export type Edge<T extends Node> = {
  cursor: string;
  node: T;
};

export type Connection<T extends Node> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
};

/**
 * Schema root and type-level resolvers.
 */
const resolvers: Resolvers = {
  Query: queryResolvers,
  User: userResolvers,
  Wallet: walletResolvers,
};

/**
 * Built schema to be executed on the Apollo server.
 * @export
 */
export const schema = authDirectiveTransformer(
  makeExecutableSchema({
    resolvers,
    typeDefs: readFileSync(join(__dirname, "schema.graphql"), "utf-8"), // Path resolution for the built distribution to schema file
  })
);

/**
 * Generate a Relay connection from a list of node objects.
 * @export
 * @template T
 * @param {T[]} nodes
 * @param {boolean} hasNextPage
 * @param {boolean} hasPreviousPage
 * @returns {(Connection<T> | null)}
 */
export function createConnection<T extends Node>(
  nodes: T[],
  hasNextPage: boolean,
  hasPreviousPage: boolean
): Connection<T> | null {
  if (nodes.length === 0) {
    return null;
  }

  const edges: Edge<T>[] = nodes.map((i) => ({
    cursor: Buffer.from(`edge_cursor:${i.id}`).toString("base64"),
    node: i,
  }));

  return edges.length === 0
    ? null
    : {
        edges,
        pageInfo: {
          startCursor: edges[0].cursor,
          endCursor: edges.at(-1)?.cursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
}

/**
 * Infer and return a ChainId enum variant from the argued string value.
 * @export
 * @param {string} val
 * @returns {(ChainId | never)}
 */
export function inferChainIdFromString(val: string): ChainId | never {
  switch (val) {
    case "ethereum": {
      return ChainId.Ethereum;
    }

    case "solana": {
      return ChainId.Solana;
    }

    default: {
      throw new Error(`unknown chain id string: ${val}`);
    }
  }
}