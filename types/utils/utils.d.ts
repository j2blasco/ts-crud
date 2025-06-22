import { ErrorWithCode, Result } from "@j2blasco/ts-result";
import { CollectionPath } from "../no-sql-db.interface";
export declare function arrayToCollectionPath(array: string[]): Result<CollectionPath, ErrorWithCode<"invalid-collection-path">>;
//# sourceMappingURL=utils.d.ts.map