import { testEnvironment } from 'src/environment/tests/test-environment.spec';
import {
  resultSuccessVoid,
  unwrapSuccessResult,
} from 'src/common/utils/result';
import {
  CollectionPath,
  DocumentPath,
  INoSqlDatabase,
} from '../no-sql-db.interface';
import { DependencyInjector } from 'src/services/injector/injector';
import { noSqlDatabaseInjectionToken } from '../no-sql-db.inject-token';
import { createNoSqlDatabaseTesting } from '../../provider/testing/database.testing';
import { describeTest } from 'src/testing/utils/describe-tests.spec';

export type TestDocumentData = {
  stringField?: string;
  numberField?: number;
  arrayField?: Array<string>;
};

export const pathTestDocument: DocumentPath = [
  testEnvironment.testNoSqlDatabaseRootPath,
  'test-document',
];
export const pathTestCollection: CollectionPath = [
  testEnvironment.testNoSqlDatabaseRootPath,
  'test-document',
  'test-collection',
];

describeTest('unit', 'NoSqlDatabase', () => {
  let db: INoSqlDatabase;

  beforeAll(() => {
    DependencyInjector.clear();
    DependencyInjector.register(
      noSqlDatabaseInjectionToken,
      createNoSqlDatabaseTesting(),
    );
  });

  beforeEach(async () => {
    db = DependencyInjector.inject(noSqlDatabaseInjectionToken);
    await db.deleteDocument(pathTestDocument);
    await db.deleteCollection(pathTestCollection);
  });

  describe('readDocument', () => {
    it('returns the document when it exists at the given path', async () => {
      const path: DocumentPath = [
        testEnvironment.testNoSqlDatabaseRootPath,
        'existing-document',
      ];
      const data: TestDocumentData = { stringField: 'existing data' };
      // Write data to the specified path
      await db.writeDocument<TestDocumentData>(path, data);
      // Read the document at the given path
      const result = (await db.readDocument<TestDocumentData>(path)).catchError(
        (error) => {
          throw `Error reading document: ${JSON.stringify(error)}`;
        },
      );
      // Unwrap the result and assert it matches the data written
      const docData = unwrapSuccessResult(result);
      expect(docData).toEqual(data);
    });

    it('returns an error when the document does not exist at the given path', async () => {
      const path: DocumentPath = [
        testEnvironment.testNoSqlDatabaseRootPath,
        'nonexistent-document',
      ];
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
      await db.writeDocument<TestDocumentData>(pathTestDocument, data);
      // Verify the document exists before deletion
      let result = (
        await db.readDocument<TestDocumentData>(pathTestDocument)
      ).catchError((error) => {
        throw `Error reading document: ${JSON.stringify(error)}`;
      });
      const docData = unwrapSuccessResult(result);
      expect(docData).toEqual(data);
      // Delete the document at the given path
      await db.deleteDocument(pathTestDocument);
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
      const path: DocumentPath = [
        testEnvironment.testNoSqlDatabaseRootPath,
        'nonexistent-document',
      ];
      // Attempt to delete a non-existing document
      await db.deleteDocument(path);
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
    it("returns documents that match a 'where' constraint", async () => {
      // Add test documents to the collection
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc1'],
        {
          stringField: 'value1',
          numberField: 10,
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc2'],
        {
          stringField: 'value2',
          numberField: 20,
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc3'],
        {
          stringField: 'value1',
          numberField: 30,
        },
      );
      // Read collection with 'where' constraint
      const result = await db.readCollection<TestDocumentData>({
        path: pathTestCollection,
        constraints: [
          {
            type: 'where',
            field: 'stringField',
            operator: '==',
            value: 'value1',
          },
        ],
      });
      // Expect only documents with field equal to 'value1'
      const expetedResult = [
        { id: 'doc1', data: { stringField: 'value1', numberField: 10 } },
        { id: 'doc3', data: { stringField: 'value1', numberField: 30 } },
      ] as Array<{ id: string; data: TestDocumentData }>;
      expect(result).toEqual(expetedResult);
    });
    it("returns documents that match an 'array-contains' constraint", async () => {
      // Add test documents to the collection
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc1'],
        {
          arrayField: ['value1', 'value2'],
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc2'],
        {
          arrayField: ['value3'],
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc3'],
        {
          arrayField: ['value1', 'value4'],
        },
      );
      // Read collection with 'array-contains' constraint
      const result = await db.readCollection<TestDocumentData>({
        path: pathTestCollection,
        constraints: [
          { type: 'array-contains', field: 'arrayField', value: 'value1' },
        ],
      });
      // Expect only documents where arrayField contains 'value1'
      expect(result).toEqual([
        { id: 'doc1', data: { arrayField: ['value1', 'value2'] } },
        { id: 'doc3', data: { arrayField: ['value1', 'value4'] } },
      ]);
    });
    it("limits the number of returned documents with a 'limit' constraint", async () => {
      // Add test documents to the collection
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc1'],
        {
          stringField: 'data1',
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc2'],
        {
          stringField: 'data2',
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc3'],
        {
          stringField: 'data3',
        },
      );
      // Read collection with 'limit' constraint
      const result = await db.readCollection({
        path: pathTestCollection,
        constraints: [{ type: 'limit', value: 2 }],
      });
      // Expect only the first two documents to be returned
      expect(result).toEqual([
        { id: 'doc1', data: { stringField: 'data1' } },
        { id: 'doc2', data: { stringField: 'data2' } },
      ]);
    });
    it('combines multiple constraints', async () => {
      // Add test documents to the collection
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc1'],
        {
          stringField: 'value1',
          numberField: 10,
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc2'],
        {
          stringField: 'value1',
          numberField: 20,
        },
      );
      await db.writeDocument<TestDocumentData>(
        [...pathTestCollection, 'doc3'],
        {
          stringField: 'value2',
          numberField: 10,
        },
      );
      // Read collection with combined constraints
      const result = await db.readCollection<TestDocumentData>({
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
      });
      // Expect only the document that matches both 'where' constraints and limit constraint
      expect(result).toEqual([
        { id: 'doc1', data: { stringField: 'value1', numberField: 10 } },
      ]);
    });
  });
  describe('deleteCollection', () => {
    const collectionPath: CollectionPath = [
      testEnvironment.testNoSqlDatabaseRootPath,
      'test-document',
      'test-collection',
    ];

    it('deletes all documents in a collection if it exists', async () => {
      // Add test documents to the collection
      await db.writeDocument<TestDocumentData>([...collectionPath, 'doc1'], {
        stringField: 'data1',
      });
      await db.writeDocument<TestDocumentData>([...collectionPath, 'doc2'], {
        stringField: 'data2',
      });
      await db.writeDocument<TestDocumentData>([...collectionPath, 'doc3'], {
        stringField: 'data3',
      });
      // Verify that documents are in the collection
      let result = await db.readCollection({
        path: collectionPath,
        constraints: [],
      });
      expect(result).toEqual([
        { id: 'doc1', data: { stringField: 'data1' } },
        { id: 'doc2', data: { stringField: 'data2' } },
        { id: 'doc3', data: { stringField: 'data3' } },
      ]);
      // Delete the entire collection
      await db.deleteCollection(collectionPath);
      // Verify that the collection is now empty
      result = await db.readCollection({
        path: collectionPath,
        constraints: [],
      });
      expect(result).toEqual([]);
    });

    it('does nothing if the collection does not exist', async () => {
      const nonExistentCollectionPath: CollectionPath = [
        testEnvironment.testNoSqlDatabaseRootPath,
        'test-document',
        'nonexistent-collection',
      ];
      // Attempt to delete a non-existing collection
      await db.deleteCollection(nonExistentCollectionPath);
      // Verify that no error occurs and the collection still returns an empty result
      const result = await db.readCollection({
        path: nonExistentCollectionPath,
        constraints: [],
      });
      expect(result).toEqual([]);
    });
  });
});
