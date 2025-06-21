import { Result, ErrorWithCode } from 'src/common/utils/result';
import { DocumentId } from '../documents/db-documents.interface';
import { NoSqlDbQueryConstraint } from '../../no-sql-db-constraints';

export interface IDatabaseCollection<TIdentifier, TData> {
  // TODO: all of these might fail, so we should return a Result
  add(args: { identifier: TIdentifier; data: TData }): Promise<{
    id: string;
  }>;
  read(args: {
    identifier: TIdentifier;
    id: DocumentId;
  }): Promise<Result<TData, ErrorWithCode<'not-found'>>>;
  readAll(args: {
    identifier: TIdentifier;
    constraints?: Array<NoSqlDbQueryConstraint<TData>>;
  }): Promise<Array<{ data: TData; id: DocumentId }>>;
  write(args: {
    identifier: TIdentifier;
    id: DocumentId;
    data: Partial<TData>;
  }): Promise<void>;
  delete(args: { identifier: TIdentifier; id: DocumentId }): Promise<void>;
  deleteAll(args: { identifier: TIdentifier }): Promise<void>;
}
