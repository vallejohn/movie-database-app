import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export let db: SQLite.SQLiteDatabase;

export async function initDb() {
  db = await SQLite.openDatabase({ name: 'favorites.db', location: 'default' });

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY NOT NULL,
      movie TEXT NOT NULL
    );
  `);
}

export async function addFavorite(id: string, movie: object) {
  await db.executeSql(
    'INSERT OR REPLACE INTO favorites (id, movie) VALUES (?, ?)',
    [id, JSON.stringify(movie)]
  );
}

export async function removeFavorite(id: string) {
  await db.executeSql('DELETE FROM favorites WHERE id = ?', [id]);
}

export async function getFavorites(): Promise<any[]> {
  const [results] = await db.executeSql('SELECT * FROM favorites');
  const rows = results.rows;
  const favorites: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const item = rows.item(i);
    favorites.push(JSON.parse(item.movie));
  }

  return favorites;
}

export async function isMarkedFavorite(id: string): Promise<boolean> {
  const [results] = await db.executeSql(
    'SELECT id FROM favorites WHERE id = ?',
    [id]
  );

  return results.rows.length > 0;
}