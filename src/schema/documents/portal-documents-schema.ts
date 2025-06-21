import {
  UserProfilePrivate,
  UserProfilePublic,
} from 'src/common/types/user/user-profile.type';
import {
  PortalPageDetailsDocumentData,
  PortalPageDetailsDocumentIdentifier,
} from '../collections/schema/portal-page-details.db-collections-schema';
import {
  PortalPageVrInstanceDocumentData,
  PortalPageVrInstanceDocumentIdentifier,
} from '../collections/schema/portal-page-vr-instance.db-collections-schema';
import { UserDocumentIdentifier } from '../collections/schema/user-document.db-collections-schema';
import { UserRole } from 'src/common/types/user/user-role.type';
import {
  ResetPasswordDbTokenData,
  ResetPasswordDbTokenIdentifier,
} from 'src/api/graphql/functions-api/user/resolvers/reset-password/reset-password-db.type';
import { DocumentPath } from '../../no-sql-db.interface';

export type PortalDocumentSchemaName = {
  [key in keyof PortalDocumentsSchema]: key;
};

export const PortalDocumentSchemaName: PortalDocumentSchemaName = {
  portalPageDetails: 'portalPageDetails',
  portalPageVrInstance: 'portalPageVrInstance',
  userRole: 'userRole',
  userPrivateProfile: 'userPrivateProfile',
  userPublicProfile: 'userPublicProfile',
  resetPasswordToken: 'resetPasswordToken',
};

export type PortalDocumentsSchema = {
  portalPageDetails: {
    identifier: PortalPageDetailsDocumentIdentifier;
    data: PortalPageDetailsDocumentData;
  };

  portalPageVrInstance: {
    identifier: PortalPageVrInstanceDocumentIdentifier;
    data: PortalPageVrInstanceDocumentData;
  };

  userRole: {
    identifier: UserDocumentIdentifier;
    data: UserRole;
  };

  userPublicProfile: {
    identifier: UserDocumentIdentifier;
    data: UserProfilePublic;
  };

  userPrivateProfile: {
    identifier: UserDocumentIdentifier;
    data: UserProfilePrivate;
  };

  resetPasswordToken: {
    identifier: ResetPasswordDbTokenIdentifier;
    data: ResetPasswordDbTokenData;
  };

  // portalPageListing: {
  //   identifier: PortalPageListingDocumentIdentifier;
  //   data: PortalPageListing;
  // };
  // portalPageMedia: {
  //   identifier: PortalPageMediaDocumentIdentifier;
  //   data: any;
  // }
};

// export type PortalPageListingDocumentIdentifier = {
//   portalPageId: string;
// };

// export type PortalPageMediaDocumentIdentifier = {
//   portalPageId: string;
//   mediaId: string;
// };

type PortalDocumentsSchemaPaths = {
  [TRepositoryType in keyof PortalDocumentsSchema]: {
    getPath: (
      identifier: PortalDocumentsSchema[TRepositoryType]['identifier'],
    ) => DocumentPath;
  };
};

export const portalDocumentsSchemaPaths: PortalDocumentsSchemaPaths = {
  portalPageDetails: {
    getPath: (identifier: PortalPageDetailsDocumentIdentifier) => {
      return [
        'portalPages',
        identifier.portalPageId,
        'language',
        identifier.languageCode,
      ];
    },
  },
  portalPageVrInstance: {
    getPath: (identifier: PortalPageVrInstanceDocumentIdentifier) => {
      return [
        'portalPages',
        identifier.portalPageId,
        'instances',
        identifier.vrInstanceId,
      ];
    },
  },
  userRole: {
    getPath: (identifier: { uid: string }) => {
      return ['users', identifier.uid, 'role', 'data'];
    },
  },
  userPublicProfile: {
    getPath: (identifier: UserDocumentIdentifier) => {
      return ['users', identifier.uid, 'profile', 'public'];
    },
  },
  userPrivateProfile: {
    getPath: (identifier: UserDocumentIdentifier) => {
      return ['users', identifier.uid, 'profile', 'private'];
    },
  },
  resetPasswordToken: {
    getPath: (identifier: ResetPasswordDbTokenIdentifier) => {
      return ['passwordResetToken', identifier.passwordToken];
    },
  },
};
