import { resultSuccess, unwrapSuccessResult } from "@j2blasco/ts-result";
import { DocumentPath, INoSqlDatabase } from "../../core/no-sql-db.interface";
import { IDatabaseDocuments } from "./db-documents.interface";
import { JsonObject } from "../../utils/json-type";

export type TestingDocumentPath = string;

export class DatabaseDocuments<TDocumentIdentifier, TData extends JsonObject>
  implements IDatabaseDocuments<TDocumentIdentifier, TData>
{
  private readonly db: INoSqlDatabase;
  private readonly getDocumentPath: (
    identifier: TDocumentIdentifier
  ) => DocumentPath;

  constructor(deps: {
    getDocumentPath: (identifier: TDocumentIdentifier) => DocumentPath;
    db: INoSqlDatabase;
  }) {
    this.getDocumentPath = deps.getDocumentPath;
    this.db = deps.db;
  }

  public async create(args: {
    identifier: TDocumentIdentifier;
    data: TData;
  }): Promise<void> {
    const { identifier, data } = args;
    const path = this.getDocumentPath(identifier);
    const result = await this.db.writeDocument(path, data);
    result.unwrapOrThrow(); // Convert Result to void or throw error
  }

  // TODO: implement results
  public async read(args: { identifier: TDocumentIdentifier }): Promise<TData> {
    const { identifier } = args;
    const path = this.getDocumentPath(identifier);
    const document = (await this.db.readDocument(path)).catchError(() => {
      return resultSuccess(undefined);
    });
    return unwrapSuccessResult(document) as TData;
  }

  public async update(args: {
    identifier: TDocumentIdentifier;
    data: Partial<TData>;
  }): Promise<void> {
    const { identifier, data } = args;
    const path = this.getDocumentPath(identifier);
    const result = await this.db.writeDocument(path, data as JsonObject);
    result.unwrapOrThrow(); // Convert Result to void or throw error
  }

  public async delete(args: {
    identifier: TDocumentIdentifier;
  }): Promise<void> {
    const { identifier } = args;
    const path = this.getDocumentPath(identifier);
    const result = await this.db.deleteDocument(path);
    result.unwrapOrThrow(); // Convert Result to void or throw error
  }
}
