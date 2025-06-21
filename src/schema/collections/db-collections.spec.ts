import {
  resultSuccessVoid,
  unwrapSuccessResult,
} from 'src/common/utils/result';
import { getPortalCollection } from './get-portal-collection';
import { IDatabaseCollection } from './db-collections.interface';
import {
  TestCollectionIdentifier,
  TestCollectionData,
} from './schema/testing.db-collections-schema';
import { DependencyInjector } from 'src/services/injector/injector';
import { createNoSqlDatabaseTesting } from '../../../provider/testing/database.testing';
import { noSqlDatabaseInjectionToken } from '../../no-sql-db.inject-token';
import { describeTest } from 'src/testing/utils/describe-tests.spec';

describeTest('unit', 'DbCollection', () => {
  const testIdentifier = { id: 'test' };
  let collection: IDatabaseCollection<
    TestCollectionIdentifier,
    TestCollectionData
  >;

  beforeAll(() => {
    DependencyInjector.clear();
    DependencyInjector.register(
      noSqlDatabaseInjectionToken,
      createNoSqlDatabaseTesting(),
    );
  });

  beforeEach(async () => {
    // Clear the data store before each test
    collection = getPortalCollection('testing');
    await collection.deleteAll({ identifier: testIdentifier });
  });

  describe('add', () => {
    it('adds a document to the collection', async () => {
      const addResult = await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      const readResult = (
        await collection.read({
          identifier: testIdentifier,
          id: addResult.id,
        })
      ).catchError((e) => {
        throw new Error(
          `Error reading data from collection: ${JSON.stringify(e)}`,
        );
      });
      const data = unwrapSuccessResult(readResult);
      expect(data).toEqual({ value: 1 });
    });
  });

  describe('read', () => {
    it('reads a document from the collection', async () => {
      const addResult = await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      const readResult = (
        await collection.read({
          identifier: testIdentifier,
          id: addResult.id,
        })
      ).catchError((e) => {
        throw new Error(
          `Error reading data from collection: ${JSON.stringify(e)}`,
        );
      });
      const data = unwrapSuccessResult(readResult);
      expect(data).toEqual({ value: 1 });
    });
  });

  describe('readAll', () => {
    it('reads all documents from the collection', async () => {
      await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      await collection.add({
        identifier: testIdentifier,
        data: { value: 2 },
      });
      const readResult = await collection.readAll({
        identifier: testIdentifier,
      });
      const data = readResult
        .map((r) => r.data)
        .sort((a, b) => a.value - b.value);
      expect(data).toEqual([{ value: 1 }, { value: 2 }]);
    });

    it('reads all documents from the collection that match a query', async () => {
      await collection.add({
        identifier: testIdentifier,
        data: { value: 1, name: 'a' },
      });
      await collection.add({
        identifier: testIdentifier,
        data: { value: 2, name: 'b' },
      });
      await collection.add({
        identifier: testIdentifier,
        data: { value: 3, name: 'a' },
      });
      const readResult = await collection.readAll({
        identifier: testIdentifier,
        constraints: [
          {
            type: 'where',
            field: 'name',
            operator: '==',
            value: 'a',
          },
        ],
      });
      const data = readResult
        .map((r) => r.data)
        .sort((a, b) => a.value - b.value);
      expect(data).toEqual([
        { value: 1, name: 'a' },
        { value: 3, name: 'a' },
      ]);
    });
  });

  describe('write', () => {
    it('updates a document to the collection', async () => {
      const addResult = await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      await collection.write({
        identifier: testIdentifier,
        id: addResult.id,
        data: { value: 2 },
      });
      const readResult = (
        await collection.read({
          identifier: testIdentifier,
          id: addResult.id,
        })
      ).catchError((e) => {
        throw new Error(
          `Error reading data from collection: ${JSON.stringify(e)}`,
        );
      });
      const data = unwrapSuccessResult(readResult);
      expect(data).toEqual({ value: 2 });
    });

    it('creates a document of the collection if it does not exist', async () => {
      await collection.write({
        identifier: testIdentifier,
        id: '1',
        data: { value: 1 },
      });
      const readResult = (
        await collection.read({
          identifier: testIdentifier,
          id: '1',
        })
      ).catchError((e) => {
        throw new Error(
          `Error reading data from collection: ${JSON.stringify(e)}`,
        );
      });
      const data = unwrapSuccessResult(readResult);
      expect(data).toEqual({ value: 1 });
    });
  });

  describe('delete', () => {
    it('deletes a document from the collection', async () => {
      const addResult = await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      await collection.delete({
        identifier: testIdentifier,
        id: addResult.id,
      });
      const readResult = await collection.read({
        identifier: testIdentifier,
        id: addResult.id,
      });
      let errorCode = '';
      readResult.catchError((e) => {
        errorCode = e.code;
        return resultSuccessVoid();
      });
      expect(errorCode).toEqual('not-found');
    });
  });

  describe('deleteAll', () => {
    it('deletes all documents from the collection', async () => {
      await collection.add({
        identifier: testIdentifier,
        data: { value: 1 },
      });
      await collection.add({
        identifier: testIdentifier,
        data: { value: 2 },
      });
      await collection.deleteAll({
        identifier: testIdentifier,
      });
      const readResult = await collection.readAll({
        identifier: testIdentifier,
      });
      expect(readResult).toEqual([]);
    });
  });
});
