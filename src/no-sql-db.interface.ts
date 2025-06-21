import {
  Result,
  ErrorWithCode,
  resultSuccess,
  resultError,
} from "@j2blasco/ts-result";
import { NoSqlDbQueryConstraint } from "./no-sql-db-constraints";
import { Observable } from "rxjs";

export function ensureValidDocumentPath(
  array: string[]
): Result<DocumentPath, ErrorWithCode<"invalid-path">> {
  if (array.length % 2 === 0) {
    return resultSuccess(array as DocumentPath);
  }
  return resultError.withCode("invalid-path");
}

export type CollectionPath =
  | [string]
  | [string, string, string]
  | [string, string, string, string, string];

export type DocumentPath =
  | [string, string]
  | [string, string, string, string]
  | [string, string, string, string, string, string];

export type NoSqlDbPath = string[];

export type NoSqlDatabaseServiceConfig = {
  create: () => INoSqlDatabase;
  mappings: {
    portalPageDbRootPath: string;
  };
};

// NoSQL document database, like Firestore or MongoDB
export interface INoSqlDatabase {
  onWrite$: Observable<{
    path: NoSqlDbPath;
    before: unknown | null;
    after: unknown;
  }>;
  onDelete$: Observable<{
    path: NoSqlDbPath;
    before: unknown;
  }>;

  // Document
  writeDocument<T>(path: DocumentPath, data: T): Promise<void>;
  readDocument<T>(
    path: DocumentPath
  ): Promise<Result<T, ErrorWithCode<"not-found">>>;
  deleteDocument(path: DocumentPath): Promise<void>;

  // Collection
  readCollection<T>(args: {
    path: CollectionPath;
    constraints?: Array<NoSqlDbQueryConstraint<T>>;
  }): Promise<Result<Array<{ data: T; id: string }>, ErrorWithCode<"not-found">>>;
  addToCollection<T>(path: CollectionPath, data: T): Promise<{ id: string }>;
  deleteCollection(path: CollectionPath): Promise<void>;
}
