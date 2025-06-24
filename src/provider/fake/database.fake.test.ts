import { testNoSqlDb } from "../../core/tests/no-sql-db.utils.test";
import { createNoSqlDatabaseTesting } from "./database.fake";

testNoSqlDb(createNoSqlDatabaseTesting());
