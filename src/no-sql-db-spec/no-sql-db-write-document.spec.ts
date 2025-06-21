import { pathTestDocument, TestDocumentData } from "./no-sql-db.spec";
import { INoSqlDatabase } from "../no-sql-db.interface";

export function testNoSqlDbWrite(db: INoSqlDatabase) {
  describe("NoSqlDb writeDocument", () => {
    beforeEach(async () => {
      await db.deleteDocument(pathTestDocument);
    });

    it("creates a document at the given path if it doesn't exist", async () => {
      const data: TestDocumentData = { stringField: "data" };
      await db.writeDocument<TestDocumentData>(pathTestDocument, data);
      const result = await db.readDocument<TestDocumentData>(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual(data);
    });

    it("updates a document at the given path if it exists", async () => {
      const initialData: TestDocumentData = { stringField: "initial data" };
      await db.writeDocument<TestDocumentData>(pathTestDocument, initialData);
      let result = await db.readDocument<TestDocumentData>(pathTestDocument);
      let docData = result.unwrapOrThrow();
      expect(docData).toEqual(initialData);
      const updatedData: TestDocumentData = { stringField: "updated data" };
      await db.writeDocument<TestDocumentData>(pathTestDocument, updatedData);
      result = await db.readDocument<TestDocumentData>(pathTestDocument);
      docData = result.unwrapOrThrow();
      expect(docData).toEqual(updatedData);
    });

    it("merges nested fields without overwriting unrelated fields", async () => {
      const initialData = { nested: { field1: "initial" } };
      await db.writeDocument(pathTestDocument, initialData);
      const updateData = { nested: { field2: "new data" } };
      await db.writeDocument(pathTestDocument, updateData);
      const result = await db.readDocument(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual({
        nested: {
          field1: "initial",
          field2: "new data",
        },
      });
    });

    it("overwrites non-object fields with new nested data", async () => {
      const initialData = { field: "initial value" };
      await db.writeDocument(pathTestDocument, initialData);
      const updatedData = { field: { nestedField: "new data" } };
      await db.writeDocument(pathTestDocument, updatedData);
      const result = await db.readDocument(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual({
        field: {
          nestedField: "new data",
        },
      });
    });

    it("overwrites non-object fields with new data", async () => {
      const initialData = { field: ["initialValue"] };
      await db.writeDocument(pathTestDocument, initialData);
      const updatedData = { field: [] };
      await db.writeDocument(pathTestDocument, updatedData);
      const result = await db.readDocument(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual({
        field: [],
      });
    });

    it("merges data at multiple levels of nesting", async () => {
      const initialData = {
        level1: {
          level2: {
            level3: {
              field: "initial value",
            },
          },
        },
      };
      await db.writeDocument(pathTestDocument, initialData);
      const updateData = {
        level1: {
          level2: {
            level3: {
              newField: "new value",
            },
          },
        },
      };
      await db.writeDocument(pathTestDocument, updateData);
      const result = await db.readDocument(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual({
        level1: {
          level2: {
            level3: {
              field: "initial value",
              newField: "new value",
            },
          },
        },
      });
    });

    it("preserves unrelated top-level fields when updating nested fields", async () => {
      const initialData = {
        topField: "keep this",
        nestedField: { subField: "original" },
      };
      await db.writeDocument(pathTestDocument, initialData);
      const updateData = { nestedField: { subField: "updated" } };
      await db.writeDocument(pathTestDocument, updateData);
      const result = await db.readDocument(pathTestDocument);
      const docData = result.unwrapOrThrow();
      expect(docData).toEqual({
        topField: "keep this",
        nestedField: { subField: "updated" },
      });
    });
  });
}
