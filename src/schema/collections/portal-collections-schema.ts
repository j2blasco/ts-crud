import { VrInstanceData } from 'src/common/types/vr/vr-instance.type';
import { IdentifierNotRequired } from '../../identifier-not-required';
import {
  RequestRateLimitCollectionIdentifier,
  RequestRateLimitCollectionData,
} from './schema/request-rate-limit.db-collections-schema';
import { VrInstanceCollectionIdentifier } from 'src/services/vr/instances/core/vr-instances.db-collection';
import {
  VrConnectionCollectionIdentifier,
  VrConnectionData,
} from 'src/services/vr/connections/vr-connection.db-collection';
import {
  TestCollectionData,
  TestCollectionIdentifier,
} from './schema/testing.db-collections-schema';
import { PortalPageListingDbData } from 'src/common/types/portal-page/listing/portal-page-listing-db.type';
import { CollectionPath } from '../../no-sql-db.interface';
import { ResetPasswordDbTokenData } from 'src/api/graphql/functions-api/user/resolvers/reset-password/reset-password-db.type';

export type PortalCollectionsSchemaName = {
  [key in keyof PortalCollectionsSchema]: key;
};

export const PortalCollectionsSchemaName: PortalCollectionsSchemaName = {
  portalPageListing: 'portalPageListing',
  portalPageVrInstance: 'portalPageVrInstance',
  portalPageVrConnection: 'portalPageVrConnection',
  rateLimit: 'rateLimit',
  testing: 'testing',
  passwordResetToken: 'passwordResetToken',
  // user = "user",
};

export type PortalCollectionsSchema = {
  portalPageListing: {
    identifier: IdentifierNotRequired;
    data: PortalPageListingDbData;
  };
  // user: {
  //   identifier: CollectionIdentifierNotRequired;
  //   data: { id: string };
  // };
  portalPageVrInstance: {
    identifier: VrInstanceCollectionIdentifier;
    data: VrInstanceData;
  };
  rateLimit: {
    identifier: RequestRateLimitCollectionIdentifier;
    data: RequestRateLimitCollectionData;
  };
  portalPageVrConnection: {
    identifier: VrConnectionCollectionIdentifier;
    data: VrConnectionData;
  };
  testing: {
    identifier: TestCollectionIdentifier;
    data: TestCollectionData;
  };
  passwordResetToken: {
    identifier: IdentifierNotRequired;
    data: ResetPasswordDbTokenData;
  };
};

type PortalCollectionsSchemaPaths = {
  [TRepositoryType in keyof PortalCollectionsSchema]: {
    getPath: (
      identifier: PortalCollectionsSchema[TRepositoryType]['identifier'],
    ) => CollectionPath;
  };
};

export const portalColletionsSchemaPaths: PortalCollectionsSchemaPaths = {
  portalPageListing: {
    getPath: (_identifier: IdentifierNotRequired) => ['portalPages'],
  },
  // user: {
  //   getPath: (_identifier: {}) => "users",
  // },
  portalPageVrInstance: {
    getPath: (identifier: VrInstanceCollectionIdentifier) => {
      return ['portalPages', identifier.portalPageId, 'instances'];
    },
  },
  portalPageVrConnection: {
    getPath: (identifier: VrConnectionCollectionIdentifier) => {
      return [
        'portalPages',
        identifier.portalPageId,
        'instances',
        identifier.vrInstanceId,
        'connections',
      ];
    },
  },
  rateLimit: {
    getPath: (identifier: RequestRateLimitCollectionIdentifier) => {
      return ['rateLimit', identifier.id, 'requests'];
    },
  },
  testing: {
    getPath: (identfier: TestCollectionIdentifier) => {
      return ['testing', 'test-collection', identfier.id];
    },
  },

  passwordResetToken: {
    getPath: (_identifier: IdentifierNotRequired) => ['passwordResetToken'],
  },
};
