import { IDatabaseCollections } from "./db-collections.interface";
import { DocumentId } from "../documents/db-documents.interface";
import { NoSqlDbQueryConstraint } from "../../core/no-sql-db-constraints";
import {
  CollectionPath,
  DocumentPath,
  INoSqlDatabase,
} from "../../core/no-sql-db.interface";
import { Result, ErrorWithCode } from "@j2blasco/ts-result";

export class DatabaseCollections<TCollectionIdentifier, TData>
  implements IDatabaseCollections<TCollectionIdentifier, TData>
{
  private readonly db: INoSqlDatabase;
  private readonly getCollectionPath: (
    identifier: TCollectionIdentifier
  ) => CollectionPath;

  constructor(
    private deps: {
      db: INoSqlDatabase;
      getCollectionPath: (identifier: TCollectionIdentifier) => CollectionPath;
    }
  ) {
    this.db = this.deps.db;
    this.getCollectionPath = this.deps.getCollectionPath;
  }

  public async add(args: {
    identifier: TCollectionIdentifier;
    data: TData;
  }): Promise<{ id: string }> {
    const { identifier, data } = args;
    const path = this.getCollectionPath(identifier);
    return await this.db.addToCollection(path as CollectionPath, data);
  }

  public async read<TData>(args: {
    identifier: TCollectionIdentifier;
    id: DocumentId;
  }): Promise<Result<TData, ErrorWithCode<"not-found">>> {
    const { identifier } = args;
    const path = this.getCollectionPath(identifier).concat(
      args.id
    ) as DocumentPath;
    const result = await this.db.readDocument<TData>(path);
    return result;
  }

  public async readAll<TData>(args: {
    identifier: TCollectionIdentifier;
    constraints?: Array<NoSqlDbQueryConstraint<TData>>;
  }): Promise<Array<{ data: TData; id: DocumentId }>> {
    const { identifier } = args;
    const path = this.getCollectionPath(identifier);
    const result = this.db.readCollection<TData>({
      path,
      constraints: args.constraints,
    });
    return result;
  }

  public async write(args: {
    identifier: TCollectionIdentifier;
    id: DocumentId;
    data: Partial<TData>;
  }): Promise<void> {
    const { identifier } = args;
    const path = this.getCollectionPath(identifier).concat(
      args.id
    ) as DocumentPath;
    await this.db.writeDocument(path, args.data);
  }

  public async delete(args: {
    identifier: TCollectionIdentifier;
    id: DocumentId;
  }): Promise<void> {
    const { identifier } = args;
    const path = this.getCollectionPath(identifier).concat(
      args.id
    ) as DocumentPath;
    await this.db.deleteDocument(path);
  }

  public async deleteAll(args: {
    identifier: TCollectionIdentifier;
  }): Promise<void> {
    const { identifier } = args;
    const path = this.getCollectionPath(identifier);
    await this.db.deleteCollection(path);
  }
}
