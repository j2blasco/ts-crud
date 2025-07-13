# @j2blasco/ts-crud

CRUD abstraction library for TypeScript. Provides a generic interface for NoSQL-like document databases, with a fake in-memory implementation for testing and development.

## Installation

```bash
npm install @j2blasco/ts-crud
```

## Features

- TypeScript-first CRUD abstraction for NoSQL document databases
- Generic interfaces for collections and documents
- Query constraints (where, array-contains, limit)
- Observable events for write and delete operations
- Fake in-memory database for testing
- **Full Result-based error handling** - All operations return `Result<T, ErrorType>` for robust error handling

## Usage

### Basic Example

```ts
import { createNoSqlDatabaseTesting } from '@j2blasco/ts-crud';

// Create a fake in-memory database instance
const db = createNoSqlDatabaseTesting();

// Write a document
const writeResult = await db.writeDocument(['users', 'user1'], { name: 'Alice', age: 30 });
writeResult.unwrapOrThrow(); // Throws if write failed

// Read a document
const result = await db.readDocument(['users', 'user1']);
if (result.success) {
  console.log(result.value); // { name: 'Alice', age: 30 }
}

// Add to a collection
const addResult = await db.addToCollection(['users'], { name: 'Bob', age: 25 });
const newDocId = addResult.unwrapOrThrow().id; // Get the new document ID or throw if failed

// Query a collection with constraints
const usersResult = await db.readCollection({
  path: ['users'],
  constraints: [
    { type: 'where', field: 'age', operator: '>=', value: 18 },
    { type: 'limit', value: 10 },
  ],
});
const users = usersResult.unwrapOrThrow(); // Get the users array or throw if failed
console.log(users);
```

### Observable Events

```ts
// Listen for write events
const sub = db.onWrite$.subscribe(({ path, before, after }) => {
  console.log('Document written:', path, before, after);
});

// Listen for delete events
const sub2 = db.onDelete$.subscribe(({ path, before }) => {
  console.log('Document deleted:', path, before);
});
```