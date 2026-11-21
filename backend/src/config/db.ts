import Database from "better-sqlite3";

const db = new Database("database.sqlite");

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL
  )
`);

// Seed some data if database is empty
const count = db.prepare(
  "SELECT COUNT(*) as count FROM products"
).get() as { count: number };

if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, price, category)
    VALUES (?, ?, ?)
  `);

  const categories = ["Electronics", "Books", "Clothing", "Food"];

  const seed = db.transaction(() => {
    for (let i = 1; i <= 5000; i++) {
      insert.run(
        `Product ${i}`,
        Math.round(Math.random() * 1000 * 100) / 100,
        categories[i % categories.length]
      );
    }
  });

  seed();
  console.log("5000 products inserted!");
}

export default db;
