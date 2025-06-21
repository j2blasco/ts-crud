export type DocumentId = string;

export interface IDatabaseDocuments<TIdentifier, TData> {
  create: (args: { identifier: TIdentifier; data: TData }) => Promise<void>;
  read: (args: { identifier: TIdentifier }) => Promise<TData>;
  update: (args: {
    identifier: TIdentifier;
    data: Partial<TData>;
  }) => Promise<void>;
  delete: (args: { identifier: TIdentifier }) => Promise<void>;
}
