import { DocumentPath, INoSqlDatabase } from "../../no-sql-db.interface";
import { IDatabaseDocuments } from "./db-documents.interface";
export type TestingDocumentPath = string;
export declare class DatabaseDocuments<TDocumentIdentifier, TData> implements IDatabaseDocuments<TDocumentIdentifier, TData> {
    private readonly db;
    private readonly getDocumentPath;
    constructor(deps: {
        getDocumentPath: (identifier: TDocumentIdentifier) => DocumentPath;
        db: INoSqlDatabase;
    });
    create(args: {
        identifier: TDocumentIdentifier;
        data: TData;
    }): Promise<void>;
    read(args: {
        identifier: TDocumentIdentifier;
    }): Promise<TData>;
    update(args: {
        identifier: TDocumentIdentifier;
        data: Partial<TData>;
    }): Promise<void>;
    delete(args: {
        identifier: TDocumentIdentifier;
    }): Promise<void>;
}
//# sourceMappingURL=db-documents.d.ts.map