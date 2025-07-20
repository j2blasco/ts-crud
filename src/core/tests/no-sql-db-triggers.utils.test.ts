import { firstValueFrom, take } from 'rxjs';

import { INoSqlDatabase, DocumentPath } from '../no-sql-db.interface';

import {
  dbTestRootPath,
  pathTestDocument,
  TestDocumentData,
} from './no-sql-db.utils.test';

export function testNoSqlDbTriggers(db: INoSqlDatabase) {
  describe('NoSqlDatabase - Triggers', () => {
    beforeEach(async () => {
      (await db.deleteDocument(pathTestDocument)).unwrapOrThrow();
    });

    describe('onWrite$', () => {
      it('emits an event when a document is written', async () => {
        const data: TestDocumentData = { stringField: 'test data' };

        // Subscribe to onWrite$ and expect a single emission
        const onWritePromise = firstValueFrom(db.onWrite$.pipe(take(1)));

        // Write data to trigger onWrite$ emission
        (await db.writeDocument(pathTestDocument, data)).unwrapOrThrow();

        const writeEvent = await onWritePromise;

        // Verify the emitted write event matches the written data
        expect(writeEvent).toEqual({
          path: pathTestDocument,
          before: null, // No existing document before the write
          after: data,
        });
      });

      it("emits the correct 'before' data when updating an existing document", async () => {
        const initialData: TestDocumentData = { stringField: 'initial data' };
        const updatedData: TestDocumentData = { stringField: 'updated data' };

        // Write initial data
        (await db.writeDocument(pathTestDocument, initialData)).unwrapOrThrow();

        const data = (await db.readDocument(pathTestDocument)).unwrapOrThrow();
        expect(data).toEqual(initialData);

        // Subscribe to onWrite$ and expect a single emission
        const onWritePromise = firstValueFrom(db.onWrite$.pipe(take(1)));

        // Write updated data to the same path
        (await db.writeDocument(pathTestDocument, updatedData)).unwrapOrThrow();

        const writeEvent = await onWritePromise;

        // Verify the emitted write event has the correct 'before' and 'after' data
        expect(writeEvent).toEqual({
          path: pathTestDocument,
          before: initialData,
          after: updatedData,
        });
      });
    });

    describe('onDelete$', () => {
      it('emits an event when a document is deleted', async () => {
        const data: TestDocumentData = { stringField: 'data to delete' };

        // Write data to ensure a document exists before deletion
        (await db.writeDocument(pathTestDocument, data)).unwrapOrThrow();

        // Subscribe to onDelete$ and expect a single emission
        const onDeletePromise = firstValueFrom(db.onDelete$.pipe(take(1)));

        // Delete the document to trigger onDelete$ emission
        (await db.deleteDocument(pathTestDocument)).unwrapOrThrow();

        const deleteEvent = await onDeletePromise;

        // Verify the emitted delete event matches the deleted document data
        expect(deleteEvent).toEqual({
          path: pathTestDocument,
          before: data,
        });
      });

      it('does not emit an event when attempting to delete a non-existing document', async () => {
        const path: DocumentPath = [dbTestRootPath, 'nonexistent-document'];

        // Listen to onDelete$ and ensure no emission
        let emitted = false;
        const subscription = db.onDelete$.subscribe(() => {
          emitted = true;
        });

        // Attempt to delete a non-existing document
        (await db.deleteDocument(path)).unwrapOrThrow();

        // Unsubscribe to clean up
        subscription.unsubscribe();

        // Verify that no onDelete$ event was emitted
        expect(emitted).toBe(false);
      });
    });
  });
}
