export type { INoSqlDatabase, DocumentPath, CollectionPath, NoSqlDbPath, NoSqlDatabaseServiceConfig, } from "./no-sql-db.interface";
export { ensureValidDocumentPath } from "./no-sql-db.interface";
export type { NoSqlDbQueryConstraint } from "./no-sql-db-constraints";
export { testNoSqlDb, type TestDocumentData, dbTestRootPath, pathTestDocument, pathTestCollection, } from "./no-sql-db-spec/no-sql-db.utils.test";
export { createNoSqlDatabaseTesting, NoSqlDatabaseTesting, } from "./provider/fake/database.fake";
export type { DocumentId, IDatabaseDocuments, } from "./schema/documents/db-documents.interface";
export type { IDatabaseCollections, } from "./schema/collections/db-collections.interface";
export { DatabaseDocuments, type TestingDocumentPath, } from "./schema/documents/db-documents";
export { DatabaseCollections, } from "./schema/collections/db-collections";
export { arrayToCollectionPath } from "./utils/utils";
//# sourceMappingURL=index.d.ts.map