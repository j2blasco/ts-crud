import { DependencyInjector } from 'src/services/injector/injector';
import { DocumentPath, INoSqlDatabase } from '../../no-sql-db.interface';
import { IDatabaseDocuments } from './db-documents.interface';
import { resultSuccess, unwrapSuccessResult } from 'src/common/utils/result';
import { noSqlDatabaseInjectionToken } from '../../no-sql-db.inject-token';

export type TestingDocumentPath = string;

export class DatabaseDocuments<TDocumentIdentifier, TData>
  implements IDatabaseDocuments<TDocumentIdentifier, TData>
{
  private db: INoSqlDatabase;
  private getDocumentPath: (identifier: TDocumentIdentifier) => DocumentPath;

  constructor(deps: {
    getDocumentPath: (identifier: TDocumentIdentifier) => DocumentPath;
  }) {
    this.getDocumentPath = deps.getDocumentPath;
    this.db = DependencyInjector.inject(noSqlDatabaseInjectionToken);
  }

  public async create(args: {
    identifier: TDocumentIdentifier;
    data: TData;
  }): Promise<void> {
    const { identifier, data } = args;
    const path = this.getDocumentPath(identifier);
    await this.db.writeDocument(path, data);
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
    await this.db.writeDocument(path, data);
  }

  public async delete(args: {
    identifier: TDocumentIdentifier;
  }): Promise<void> {
    const { identifier } = args;
    const path = this.getDocumentPath(identifier);
    await this.db.deleteDocument(path);
  }
}
