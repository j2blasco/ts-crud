import { Result, ErrorWithCode } from "@j2blasco/ts-result";
import { Subject } from "rxjs";
import { NoSqlDbQueryConstraint } from "../../no-sql-db-constraints";
import { INoSqlDatabase, NoSqlDbPath, DocumentPath, CollectionPath } from "../../no-sql-db.interface";
export declare function createNoSqlDatabaseTesting(): NoSqlDatabaseTesting;
export declare class NoSqlDatabaseTesting implements INoSqlDatabase {
    private dataStore;
    onWrite$: Subject<{
        path: NoSqlDbPath;
        before: unknown | null;
        after: unknown;
    }>;
    private fakeCommunicationDelayMs;
    private simulateCommunicationDelay;
    onDelete$: Subject<{
        path: NoSqlDbPath;
        before: unknown;
    }>;
    readDocument(path: DocumentPath): Promise<Result<any, ErrorWithCode<"not-found">>>;
    private copyElement;
    readCollection<T>(args: {
        path: CollectionPath;
        constraints?: Array<NoSqlDbQueryConstraint<T>>;
    }): Promise<Array<{
        data: T;
        id: string;
    }>>;
    private getElementAtPath;
    addToCollection(path: CollectionPath, data: unknown): Promise<{
        id: string;
    }>;
    writeDocument(path: DocumentPath, data: any): Promise<void>;
    deleteDocument(path: DocumentPath): Promise<void>;
    deleteCollection(path: CollectionPath): Promise<void>;
}
//# sourceMappingURL=database.fake.d.ts.map