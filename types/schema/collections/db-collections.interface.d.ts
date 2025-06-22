import { DocumentId } from '../documents/db-documents.interface';
import { NoSqlDbQueryConstraint } from '../../no-sql-db-constraints';
import { ErrorWithCode, Result } from '@j2blasco/ts-result';
export interface IDatabaseCollections<TIdentifier, TData> {
    add(args: {
        identifier: TIdentifier;
        data: TData;
    }): Promise<{
        id: string;
    }>;
    read(args: {
        identifier: TIdentifier;
        id: DocumentId;
    }): Promise<Result<TData, ErrorWithCode<'not-found'>>>;
    readAll(args: {
        identifier: TIdentifier;
        constraints?: Array<NoSqlDbQueryConstraint<TData>>;
    }): Promise<Array<{
        data: TData;
        id: DocumentId;
    }>>;
    write(args: {
        identifier: TIdentifier;
        id: DocumentId;
        data: Partial<TData>;
    }): Promise<void>;
    delete(args: {
        identifier: TIdentifier;
        id: DocumentId;
    }): Promise<void>;
    deleteAll(args: {
        identifier: TIdentifier;
    }): Promise<void>;
}
//# sourceMappingURL=db-collections.interface.d.ts.map