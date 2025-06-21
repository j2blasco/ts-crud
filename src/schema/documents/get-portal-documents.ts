import { IDatabaseDocuments } from './db-documents.interface';
import {
  PortalDocumentsSchema,
  PortalDocumentSchemaName,
  portalDocumentsSchemaPaths,
} from './portal-documents-schema';
import { DatabaseDocuments } from './db-documents';

export function getPortalDocuments<
  TRepositoryType extends keyof PortalDocumentSchemaName,
>(
  repositoryType: TRepositoryType,
): IDatabaseDocuments<
  PortalDocumentsSchema[TRepositoryType]['identifier'],
  PortalDocumentsSchema[TRepositoryType]['data']
> {
  const dbDocuments = new DatabaseDocuments<
    PortalDocumentsSchema[TRepositoryType]['identifier'],
    PortalDocumentsSchema[TRepositoryType]['data']
  >({
    getDocumentPath: portalDocumentsSchemaPaths[repositoryType].getPath,
  });
  return dbDocuments;
}
