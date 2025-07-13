import {
  Result,
  ErrorWithCode,
  resultError,
  resultSuccess,
  ErrorUnknown,
  SuccessVoid,
  resultSuccessVoid,
} from "@j2blasco/ts-result";
import { Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { NoSqlDbQueryConstraint } from "../../core/no-sql-db-constraints";
import {
  INoSqlDatabase,
  NoSqlDbPath,
  DocumentPath,
  CollectionPath,
} from "../../core/no-sql-db.interface";

export function createNoSqlDatabaseTesting() {
  return new NoSqlDatabaseTesting();
}

function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object &&
      !(target[key] instanceof Array)
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

type DataStore = {
  [key: string]: any;
};

export class NoSqlDatabaseTesting implements INoSqlDatabase {
  private dataStore: DataStore = {};

  public onWrite$ = new Subject<{
    path: NoSqlDbPath;
    before: unknown | null;
    after: unknown;
  }>();

  private fakeCommunicationDelayMs = 0;

  private async simulateCommunicationDelay(): Promise<void> {
    return new Promise(async (resolve) => {
      // Note: we use performance to avoid the clock being mocked by the test framework
      const start = performance.now();
      while (performance.now() - start < this.fakeCommunicationDelayMs) {
        // Busy-wait loop to simulate computational delay
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      resolve();
    });
  }

  public onDelete$ = new Subject<{ path: NoSqlDbPath; before: unknown }>();

  public async readDocument(
    path: DocumentPath
  ): Promise<Result<any, ErrorWithCode<"not-found"> | ErrorUnknown>> {
    try {
      await this.simulateCommunicationDelay();
      const element = this.getElementAtPath(path);
      if (!element) {
        return resultError.withCode("not-found");
      }
      return resultSuccess(this.copyElement(element));
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  private copyElement(element: Record<string, any>): any {
    return JSON.parse(JSON.stringify(element));
  }

  public async readCollection<T>(args: {
    path: CollectionPath;
    constraints?: Array<NoSqlDbQueryConstraint<T>>;
  }): Promise<Result<Array<{ data: T; id: string }>, ErrorWithCode<"not-found"> | ErrorUnknown>> {
    try {
      await this.simulateCommunicationDelay();
      const collection = this.getElementAtPath(args.path);
      if (!collection) {
        return resultError.withCode("not-found");
      }
      if (typeof collection !== "object") {
        return resultError.withCode("not-found");
      }

      let documents = Object.entries(collection).map(([id, doc]) => ({
        id,
        data: doc as T,
      }));

      if (!args.constraints) return resultSuccess(documents);

      for (const constraint of args.constraints) {
        if (constraint.type === "where") {
          const constraintValue = constraint.value as any;
          documents = documents.filter((doc) => {
            const fieldValue = doc.data[constraint.field as keyof T];
            switch (constraint.operator) {
              case "<":
                return fieldValue < constraintValue;
              case "<=":
                return fieldValue <= constraintValue;
              case "==":
                return fieldValue === constraintValue;
              case ">=":
                return fieldValue >= constraintValue;
              case ">":
                return fieldValue > constraintValue;
              default:
                return false;
            }
          });
        } else if (constraint.type === "array-contains") {
          documents = documents.filter((doc) => {
            const fieldValue = doc.data[constraint.field as keyof T];
            return (
              Array.isArray(fieldValue) && fieldValue.includes(constraint.value)
            );
          });
        } else if (constraint.type === "limit") {
          documents = documents.slice(0, constraint.value);
        }
      }

      return resultSuccess(documents);
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  private getElementAtPath(path: NoSqlDbPath): any {
    return path.reduce((acc: any, key: string) => {
      return acc && acc[key];
    }, this.dataStore);
  }

  public async addToCollection<T>(
    path: CollectionPath,
    data: T
  ): Promise<Result<{ id: string }, ErrorUnknown>> {
    try {
      await this.simulateCommunicationDelay();
      let element: DataStore = this.dataStore;
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (!element[key]) {
          element[key] = {};
        }
        element = element[key] as DataStore;
      }

      const id = uuidv4();
      element[id] = data;
      this.onWrite$.next({
        path: [...path, id],
        before: null,
        after: this.copyElement(data as any),
      });
      return resultSuccess({ id });
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  public async writeDocument<T>(path: DocumentPath, data: T): Promise<Result<SuccessVoid, ErrorUnknown>> {
    try {
      await this.simulateCommunicationDelay();

      data = this.copyElement(data as any);

      // Traverse to the second-to-last element in the path, creating any missing levels
      const parentElement = path.slice(0, -1).reduce((acc: any, key: string) => {
        if (!acc[key]) acc[key] = {};
        return acc[key];
      }, this.dataStore);

      const lastKey = path[path.length - 1];

      // Capture the current state of the data before modification
      const before = parentElement[lastKey]
        ? this.copyElement(parentElement[lastKey])
        : null;

      // Merge existing data with new data if it's an object, otherwise overwrite
      if (parentElement[lastKey] && typeof parentElement[lastKey] === "object") {
        deepMerge(parentElement[lastKey], data);
      } else {
        parentElement[lastKey] = data;
      }

      // Emit the event after the data modification
      this.onWrite$.next({
        path,
        before: this.copyElement(before),
        after: this.copyElement(parentElement[lastKey]),
      });

      return resultSuccessVoid();
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  public async deleteDocument(path: DocumentPath): Promise<Result<SuccessVoid, ErrorUnknown>> {
    try {
      await this.simulateCommunicationDelay();

      const parentElement = path
        .slice(0, -1)
        .reduce((acc: any, key: string) => acc && acc[key], this.dataStore);
      const lastKey = path[path.length - 1];

      if (parentElement && lastKey in parentElement) {
        const before = this.copyElement(parentElement[lastKey]);
        delete parentElement[lastKey];
        this.onDelete$.next({ path, before: this.copyElement(before) });
      }

      return resultSuccessVoid();
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  public async deleteCollection(path: CollectionPath): Promise<Result<SuccessVoid, ErrorUnknown>> {
    try {
      const parentElement = path
        .slice(0, -1)
        .reduce((acc: any, key: string) => acc && acc[key], this.dataStore);
      const lastKey = path[path.length - 1];

      await this.simulateCommunicationDelay();

      if (parentElement && lastKey in parentElement) {
        const before = this.copyElement(parentElement[lastKey]);
        delete parentElement[lastKey];

        Object.keys(before).forEach((docId) => {
          this.onDelete$.next({
            path: [...path, docId],
            before: this.copyElement(before[docId]),
          });
        });
      }

      return resultSuccessVoid();
    } catch (error) {
      return resultError.unknown(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }
}
