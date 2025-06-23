import { Result, ErrorWithCode } from "@j2blasco/ts-result";
import { NoSqlDbQueryConstraint } from "./no-sql-db-constraints";
import { Observable } from "rxjs";
export declare function ensureValidDocumentPath(array: string[]): Result<DocumentPath, ErrorWithCode<"invalid-path">>;
export type CollectionPath = [string] | [string, string, string] | [string, string, string, string, string];
export type DocumentPath = [string, string] | [string, string, string, string] | [string, string, string, string, string, string];
export type NoSqlDbPath = string[];
export type NoSqlDatabaseServiceConfig = {
    create: () => INoSqlDatabase;
    mappings: {
        portalPageDbRootPath: string;
    };
};
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
    writeDocument<T>(path: DocumentPath, data: T): Promise<void>;
    readDocument<T>(path: DocumentPath): Promise<Result<T, ErrorWithCode<"not-found">>>;
    deleteDocument(path: DocumentPath): Promise<void>;
    readCollection<T>(args: {
        path: CollectionPath;
        constraints?: Array<NoSqlDbQueryConstraint<T>>;
    }): Promise<Array<{
        data: T;
        id: string;
    }>>;
    addToCollection<T>(path: CollectionPath, data: T): Promise<{
        id: string;
    }>;
    deleteCollection(path: CollectionPath): Promise<void>;
}
