import { IDatabaseCollections } from "./db-collections.interface";
import { DocumentId } from "../documents/db-documents.interface";
import { NoSqlDbQueryConstraint } from "../../no-sql-db-constraints";
import { CollectionPath, INoSqlDatabase } from "../../no-sql-db.interface";
import { Result, ErrorWithCode } from "@j2blasco/ts-result";
export declare class DatabaseCollections<TCollectionIdentifier, TData> implements IDatabaseCollections<TCollectionIdentifier, TData> {
    private deps;
    private readonly db;
    private readonly getCollectionPath;
    constructor(deps: {
        db: INoSqlDatabase;
        getCollectionPath: (identifier: TCollectionIdentifier) => CollectionPath;
    });
    add(args: {
        identifier: TCollectionIdentifier;
        data: TData;
    }): Promise<{
        id: string;
    }>;
    read<TData>(args: {
        identifier: TCollectionIdentifier;
        id: DocumentId;
    }): Promise<Result<TData, ErrorWithCode<"not-found">>>;
    readAll<TData>(args: {
        identifier: TCollectionIdentifier;
        constraints?: Array<NoSqlDbQueryConstraint<TData>>;
    }): Promise<Array<{
        data: TData;
        id: DocumentId;
    }>>;
    write(args: {
        identifier: TCollectionIdentifier;
        id: DocumentId;
        data: Partial<TData>;
    }): Promise<void>;
    delete(args: {
        identifier: TCollectionIdentifier;
        id: DocumentId;
    }): Promise<void>;
    deleteAll(args: {
        identifier: TCollectionIdentifier;
    }): Promise<void>;
}
//# sourceMappingURL=db-collections.d.ts.map