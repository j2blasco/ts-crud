import { testNoSqlDb } from "../../no-sql-db-spec/no-sql-db-spec";
import { createNoSqlDatabaseTesting } from "./database.fake";

testNoSqlDb(createNoSqlDatabaseTesting());
