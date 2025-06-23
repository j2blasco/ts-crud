import { testNoSqlDb } from "../../core/tests/no-sql-db-spec";
import { createNoSqlDatabaseTesting } from "./database.fake";

testNoSqlDb(createNoSqlDatabaseTesting());
