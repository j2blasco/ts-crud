import { DatabaseCollections } from './db-collections';
import { IDatabaseCollection } from './db-collections.interface';
import {
  PortalCollectionsSchema,
  PortalCollectionsSchemaName,
  portalColletionsSchemaPaths,
} from './portal-collections-schema';

export function getPortalCollection<
  TCollectionType extends keyof PortalCollectionsSchemaName,
>(
  repositoryType: TCollectionType,
): IDatabaseCollection<
  PortalCollectionsSchema[TCollectionType]['identifier'],
  PortalCollectionsSchema[TCollectionType]['data']
> {
  const dbCollections = new DatabaseCollections<
    PortalCollectionsSchema[TCollectionType]['identifier'],
    PortalCollectionsSchema[TCollectionType]['data']
  >({
    getCollectionPath: portalColletionsSchemaPaths[repositoryType].getPath,
  });
  return dbCollections;
}
