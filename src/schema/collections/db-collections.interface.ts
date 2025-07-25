import { ErrorWithCode, Result, ErrorUnknown } from '@j2blasco/ts-result';

import { NoSqlDbQueryConstraint } from '../../core/no-sql-db-constraints';
import { DocumentId } from '../documents/db-documents.interface';

export interface IDatabaseCollections<TIdentifier, TData> {
  // TODO: all of these might fail, so we should return a Result
  add(args: { identifier: TIdentifier; data: TData }): Promise<{
    id: string;
  }>;
  read(args: {
    identifier: TIdentifier;
    id: DocumentId;
  }): Promise<Result<TData, ErrorWithCode<'not-found'> | ErrorUnknown>>;
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
