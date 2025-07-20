import { resultSuccessVoid } from '@j2blasco/ts-result';

import {
  DocumentPath,
  CollectionPath,
  INoSqlDatabase,
} from '../no-sql-db.interface';

import { testNoSqlDbWrite } from './no-sql-db-write-document.utils.test';
import { testNoSqlDbTriggers } from './no-sql-db-triggers.utils.test';

export type TestDocumentData = {
  stringField?: string;
  numberField?: number;
  arrayField?: Array<string>;
};

export const dbTestRootPath = 'test';

export const pathTestDocument: DocumentPath = [dbTestRootPath, 'test-document'];
export const pathTestCollection: CollectionPath = [
  dbTestRootPath,
  'test-document',
  'test-collection',
];

export function testNoSqlDb(db: INoSqlDatabase) {
  describe('NoSqlDatabase', () => {
    beforeEach(async () => {
      (await db.deleteDocument(pathTestDocument)).unwrapOrThrow();
      (await db.deleteCollection(pathTestCollection)).unwrapOrThrow();
    });

    describe('readDocument', () => {
      it('returns the document when it exists at the given path', async () => {
        const path: DocumentPath = [dbTestRootPath, 'existing-document'];
        const data: TestDocumentData = { stringField: 'existing data' };
        // Write data to the specified path
        const writeResult = await db.writeDocument<TestDocumentData>(
          path,
          data,
        );
        writeResult.unwrapOrThrow(); // Should not throw if successful
        // Read the document at the given path
        const result = await db.readDocument<TestDocumentData>(path);
        // Unwrap the result and assert it matches the data written
        const docData = result.unwrapOrThrow();
        expect(docData).toEqual(data);
      });

      it('returns an error when the document does not exist at the given path', async () => {
        const path: DocumentPath = [dbTestRootPath, 'nonexistent-document'];
        // Attempt to read a non-existing document
        const result = await db.readDocument<TestDocumentData>(path);
        // Unwrap the error result and assert it has the correct error code
        let errorCode = '';
        result.catchError((error) => {
          errorCode = error.code;
          return resultSuccessVoid();
        });
        expect(errorCode).toBe('not-found');
      });
    });

    describe('deleteDocument', () => {
      it('deletes the document when it exists at the given path', async () => {
        const data: TestDocumentData = { stringField: 'data to delete' };
        // Write a document to the specified path
        const writeResult = await db.writeDocument<TestDocumentData>(
          pathTestDocument,
          data,
        );
        writeResult.unwrapOrThrow(); // Should not throw if successful
        // Verify the document exists before deletion
        let result = await db.readDocument<TestDocumentData>(pathTestDocument);
        const docData = result.unwrapOrThrow();
        expect(docData).toEqual(data);
        // Delete the document at the given path
        const deleteResult = await db.deleteDocument(pathTestDocument);
        deleteResult.unwrapOrThrow(); // Should not throw if successful
        // Attempt to read the deleted document
        let errorCode = '';
        result = (
          await db.readDocument<TestDocumentData>(pathTestDocument)
        ).catchError((error) => {
          errorCode = error.code;
          return resultSuccessVoid();
        });
        // Verify that reading the deleted document returns a "not-found" error
        expect(errorCode).toBe('not-found');
      });

      it('does nothing if the document does not exist at the given path', async () => {
        const path: DocumentPath = [dbTestRootPath, 'nonexistent-document'];
        // Attempt to delete a non-existing document
        const deleteResult = await db.deleteDocument(path);
        deleteResult.unwrapOrThrow(); // Should not throw even if document doesn't exist
        // Attempt to read the non-existent document to verify it still returns "not-found"
        let errorCode = '';
        (await db.readDocument<TestDocumentData>(path)).catchError((error) => {
          errorCode = error.code;
          return resultSuccessVoid();
        });
        // Verify that reading the document returns a "not-found" error
        expect(errorCode).toBe('not-found');
      });
    });

    describe('readCollection', () => {
      it('returns a not-found error when the collection does not exist', async () => {
        const nonExistentCollectionPath: CollectionPath = [
          dbTestRootPath,
          'test-document',
          'nonexistent-collection',
        ];
        // Attempt to read a non-existing collection
        const result = await db.readCollection<TestDocumentData>({
          path: nonExistentCollectionPath,
          constraints: [],
        });
        // Unwrap the error result and assert it has the correct error code
        let errorCode = '';
        result.catchError((error) => {
          errorCode = error.code || 'unknown';
          return resultSuccessVoid();
        });
        expect(errorCode).toBe('not-found');
      });

      it("returns documents that match a 'where' constraint", async () => {
        // Add test documents to the collection
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc1'],
            {
              stringField: 'value1',
              numberField: 10,
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc2'],
            {
              stringField: 'value2',
              numberField: 20,
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc3'],
            {
              stringField: 'value1',
              numberField: 30,
            },
          )
        ).unwrapOrThrow();
        // Read collection with 'where' constraint
        const result = (
          await db.readCollection<TestDocumentData>({
            path: pathTestCollection,
            constraints: [
              {
                type: 'where',
                field: 'stringField',
                operator: '==',
                value: 'value1',
              },
            ],
          })
        ).unwrapOrThrow();
        // Expect only documents with field equal to 'value1'
        const expetedResult = [
          { id: 'doc1', data: { stringField: 'value1', numberField: 10 } },
          { id: 'doc3', data: { stringField: 'value1', numberField: 30 } },
        ] as Array<{ id: string; data: TestDocumentData }>;
        expect(result).toEqual(expetedResult);
      });
      it("returns documents that match an 'array-contains' constraint", async () => {
        // Add test documents to the collection
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc1'],
            {
              arrayField: ['value1', 'value2'],
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc2'],
            {
              arrayField: ['value3'],
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc3'],
            {
              arrayField: ['value1', 'value4'],
            },
          )
        ).unwrapOrThrow();
        // Read collection with 'array-contains' constraint
        const result = (
          await db.readCollection<TestDocumentData>({
            path: pathTestCollection,
            constraints: [
              { type: 'array-contains', field: 'arrayField', value: 'value1' },
            ],
          })
        ).unwrapOrThrow();
        // Expect only documents where arrayField contains 'value1'
        expect(result).toEqual([
          { id: 'doc1', data: { arrayField: ['value1', 'value2'] } },
          { id: 'doc3', data: { arrayField: ['value1', 'value4'] } },
        ]);
      });
      it("limits the number of returned documents with a 'limit' constraint", async () => {
        // Add test documents to the collection
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc1'],
            {
              stringField: 'data1',
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc2'],
            {
              stringField: 'data2',
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc3'],
            {
              stringField: 'data3',
            },
          )
        ).unwrapOrThrow();
        // Read collection with 'limit' constraint
        const result = (
          await db.readCollection({
            path: pathTestCollection,
            constraints: [{ type: 'limit', value: 2 }],
          })
        ).unwrapOrThrow();
        // Expect only the first two documents to be returned
        expect(result).toEqual([
          { id: 'doc1', data: { stringField: 'data1' } },
          { id: 'doc2', data: { stringField: 'data2' } },
        ]);
      });
      it('combines multiple constraints', async () => {
        // Add test documents to the collection
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc1'],
            {
              stringField: 'value1',
              numberField: 10,
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc2'],
            {
              stringField: 'value1',
              numberField: 20,
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...pathTestCollection, 'doc3'],
            {
              stringField: 'value2',
              numberField: 10,
            },
          )
        ).unwrapOrThrow();
        // Read collection with combined constraints
        const result = (
          await db.readCollection<TestDocumentData>({
            path: pathTestCollection,
            constraints: [
              {
                type: 'where',
                field: 'stringField',
                operator: '==',
                value: 'value1',
              },
              { type: 'where', field: 'numberField', operator: '<', value: 20 },
              { type: 'limit', value: 1 },
            ],
          })
        ).unwrapOrThrow();
        // Expect only the document that matches both 'where' constraints and limit constraint
        expect(result).toEqual([
          { id: 'doc1', data: { stringField: 'value1', numberField: 10 } },
        ]);
      });
    });

    describe('deleteCollection', () => {
      const collectionPath: CollectionPath = [
        dbTestRootPath,
        'test-document',
        'test-collection',
      ];

      it('deletes all documents in a collection if it exists', async () => {
        // Add test documents to the collection
        (
          await db.writeDocument<TestDocumentData>(
            [...collectionPath, 'doc1'],
            {
              stringField: 'data1',
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...collectionPath, 'doc2'],
            {
              stringField: 'data2',
            },
          )
        ).unwrapOrThrow();
        (
          await db.writeDocument<TestDocumentData>(
            [...collectionPath, 'doc3'],
            {
              stringField: 'data3',
            },
          )
        ).unwrapOrThrow();
        // Verify that documents are in the collection
        let result = (
          await db.readCollection({
            path: collectionPath,
            constraints: [],
          })
        ).unwrapOrThrow();
        expect(result).toEqual([
          { id: 'doc1', data: { stringField: 'data1' } },
          { id: 'doc2', data: { stringField: 'data2' } },
          { id: 'doc3', data: { stringField: 'data3' } },
        ]);
        // Delete the entire collection
        (await db.deleteCollection(collectionPath)).unwrapOrThrow();
        // Verify that the collection is now deleted (returns not-found error)
        const deleteResult = await db.readCollection({
          path: collectionPath,
          constraints: [],
        });
        let errorCode = '';
        deleteResult.catchError((error) => {
          errorCode = error.code || 'unknown';
          return resultSuccessVoid();
        });
        expect(errorCode).toBe('not-found');
      });

      it('does nothing if the collection does not exist', async () => {
        const nonExistentCollectionPath: CollectionPath = [
          dbTestRootPath,
          'test-document',
          'nonexistent-collection',
        ];
        // Attempt to delete a non-existing collection
        (await db.deleteCollection(nonExistentCollectionPath)).unwrapOrThrow();
        // Verify that reading the collection returns a "not-found" error
        const result = await db.readCollection({
          path: nonExistentCollectionPath,
          constraints: [],
        });
        let errorCode = '';
        result.catchError((error) => {
          errorCode = error.code || 'unknown';
          return resultSuccessVoid();
        });
        expect(errorCode).toBe('not-found');
      });
    });
  });
  testNoSqlDbWrite(db);
  testNoSqlDbTriggers(db);
}
