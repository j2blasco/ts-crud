import { DocumentPath, CollectionPath, INoSqlDatabase } from "../core/no-sql-db.interface";
export type TestDocumentData = {
    stringField?: string;
    numberField?: number;
    arrayField?: Array<string>;
};
export declare const dbTestRootPath = "test";
export declare const pathTestDocument: DocumentPath;
export declare const pathTestCollection: CollectionPath;
export declare function testNoSqlDb(db: INoSqlDatabase): void;
//# sourceMappingURL=no-sql-db-spec.d.ts.map