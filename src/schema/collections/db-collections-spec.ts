import { unwrapSuccessResult, ErrorWithCode, resultSuccessVoid } from "@j2blasco/ts-result";
import { dbTestRootPath } from "../../no-sql-db-spec/no-sql-db-spec";
import { CollectionPath, INoSqlDatabase } from "../../no-sql-db.interface";
import { DatabaseCollections } from "./db-collections";
import { IDatabaseCollections } from "./db-collections.interface";

type TestCollectionIdentifier = {
  id: string;
};

type TestCollectionData = {
  value: number;
  name: string;
};

const getTestCollectionPath = (identifier: TestCollectionIdentifier) =>
  [dbTestRootPath, "collections", identifier.id] as CollectionPath;

export function testDbCollections(db: INoSqlDatabase) {
  describe("DbCollections", () => {
    const testIdentifier = { id: "test" };
    let collection: IDatabaseCollections<
      TestCollectionIdentifier,
      TestCollectionData
    >;

    beforeEach(async () => {
      // Clear the data store before each test
      collection = new DatabaseCollections<
        TestCollectionIdentifier,
        TestCollectionData
      >({ db, getCollectionPath: getTestCollectionPath });
      await collection.deleteAll({ identifier: testIdentifier });
    });

    describe("add", () => {
      it("adds a document to the collection", async () => {
        const addResult = await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "test" },
        });
        const readResult = (
          await collection.read({
            identifier: testIdentifier,
            id: addResult.id,
          })
        ).catchError((e) => {
          throw new Error(
            `Error reading data from collection: ${JSON.stringify(e)}`
          );
        });
        const data = unwrapSuccessResult(readResult);
        expect(data).toEqual({ value: 1 });
      });
    });

    describe("read", () => {
      it("reads a document from the collection", async () => {
        const addResult = await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "test" },
        });
        const readResult = (
          await collection.read({
            identifier: testIdentifier,
            id: addResult.id,
          })
        ).catchError((e) => {
          throw new Error(
            `Error reading data from collection: ${JSON.stringify(e)}`
          );
        });
        const data = unwrapSuccessResult(readResult);
        expect(data).toEqual({ value: 1 });
      });
    });

    describe("readAll", () => {
      it("reads all documents from the collection", async () => {
        await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "test1" },
        });
        await collection.add({
          identifier: testIdentifier,
          data: { value: 2, name: "test2" },
        });
        const readResult = await collection.readAll({
          identifier: testIdentifier,
        });
        const actualResult = readResult.catchError((error: ErrorWithCode<"not-found">) => {
          throw `Error reading collection: ${JSON.stringify(error)}`;
        });
        const data = unwrapSuccessResult(actualResult)
          .map((r) => r.data)
          .sort((a, b) => a.value - b.value);
        expect(data).toEqual([
          { value: 1, name: "test1" },
          { value: 2, name: "test2" },
        ]);
      });

      it("reads all documents from the collection that match a query", async () => {
        await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "a" },
        });
        await collection.add({
          identifier: testIdentifier,
          data: { value: 2, name: "b" },
        });
        await collection.add({
          identifier: testIdentifier,
          data: { value: 3, name: "a" },
        });
        const readResult = await collection.readAll({
          identifier: testIdentifier,
          constraints: [
            {
              type: "where",
              field: "name",
              operator: "==",
              value: "a",
            },
          ],
        });
        const actualResult = readResult.catchError((error: ErrorWithCode<"not-found">) => {
          throw `Error reading collection: ${JSON.stringify(error)}`;
        });
        const data = unwrapSuccessResult(actualResult)
          .map((r) => r.data)
          .sort((a, b) => a.value - b.value);
        expect(data).toEqual([
          { value: 1, name: "a" },
          { value: 3, name: "a" },
        ]);
      });
    });

    describe("write", () => {
      it("updates a document to the collection", async () => {
        const addResult = await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "initial" },
        });
        await collection.write({
          identifier: testIdentifier,
          id: addResult.id,
          data: { value: 2, name: "updated" },
        });
        const readResult = (
          await collection.read({
            identifier: testIdentifier,
            id: addResult.id,
          })
        ).catchError((e) => {
          throw new Error(
            `Error reading data from collection: ${JSON.stringify(e)}`
          );
        });
        const data = unwrapSuccessResult(readResult);
        expect(data).toEqual({ value: 2, name: "updated" });
      });

      it("creates a document of the collection if it does not exist", async () => {
        await collection.write({
          identifier: testIdentifier,
          id: "1",
          data: { value: 1, name: "new" },
        });
        const readResult = (
          await collection.read({
            identifier: testIdentifier,
            id: "1",
          })
        ).catchError((e) => {
          throw new Error(
            `Error reading data from collection: ${JSON.stringify(e)}`
          );
        });
        const data = unwrapSuccessResult(readResult);
        expect(data).toEqual({ value: 1, name: "new" });
      });
    });

    describe("delete", () => {
      it("deletes a document from the collection", async () => {
        const addResult = await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "to-delete" },
        });
        await collection.delete({
          identifier: testIdentifier,
          id: addResult.id,
        });
        const readResult = await collection.read({
          identifier: testIdentifier,
          id: addResult.id,
        });
        let errorCode = "";
        readResult.catchError((e) => {
          errorCode = e.code;
          return resultSuccessVoid();
        });
        expect(errorCode).toEqual("not-found");
      });
    });

    describe("deleteAll", () => {
      it("deletes all documents from the collection", async () => {
        await collection.add({
          identifier: testIdentifier,
          data: { value: 1, name: "item1" },
        });
        await collection.add({
          identifier: testIdentifier,
          data: { value: 2, name: "item2" },
        });
        await collection.deleteAll({
          identifier: testIdentifier,
        });
        const readResult = await collection.readAll({
          identifier: testIdentifier,
        });
        let errorCode = "";
        readResult.catchError((error) => {
          errorCode = error.code;
          return resultSuccessVoid();
        });
        expect(errorCode).toBe("not-found");
      });
    });
  });
}
