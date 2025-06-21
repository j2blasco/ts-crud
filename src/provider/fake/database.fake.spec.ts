import { setEnvironment } from 'src/environment/environment';
import { testNoSqlDbWrite } from '../../core/no-sql-db-spec/no-sql-db-write-document.spec';
import { describeTest } from 'src/testing/utils/describe-tests.spec';

describeTest('unit', 'NoSqlDatabaseTesting', () => {
  testNoSqlDbWrite(async () => await setEnvironment('test'));
});
