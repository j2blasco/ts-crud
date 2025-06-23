import {
  ErrorWithCode,
  Result,
  resultError,
  resultSuccess,
} from "@j2blasco/ts-result";
import { CollectionPath } from "../core/no-sql-db.interface";

export function arrayToCollectionPath(
  array: string[]
): Result<CollectionPath, ErrorWithCode<"invalid-collection-path">> {
  if (array.length % 2 === 0) {
    return resultError.withCode("invalid-collection-path");
  }
  return resultSuccess(array as CollectionPath);
}
