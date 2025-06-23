import { testNoSqlDb } from "../../no-sql-db-spec/no-sql-db.utils.test";
import { createNoSqlDatabaseTesting } from "./database.fake";

testNoSqlDb(createNoSqlDatabaseTesting());
