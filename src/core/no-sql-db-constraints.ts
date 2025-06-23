type QueryConstraintWhere<T> = {
  type: 'where';
  field: keyof T;
  operator: '<' | '<=' | '==' | '>=' | '>';
  value: unknown;
};

type QueryConstraintArrayContains<T> = {
  type: 'array-contains';
  field: keyof T;
  value: unknown;
};

type QueryConstraintLimit = {
  type: 'limit';
  value: number;
};

export type NoSqlDbQueryConstraint<T> =
  | QueryConstraintWhere<T>
  | QueryConstraintLimit
  | QueryConstraintArrayContains<T>;
