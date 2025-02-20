import { getDatabase } from './utils/database.ts';
import path from 'node:path';
import { readdirSync } from 'node:fs';
import { asyncLoop } from './utils/asyncTools.ts';


(async () => {
  const db = getDatabase();

  const migrationsDir = path.join(__dirname, './migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts'))
    .sort();
  const migrations = db
    .query<{ file: string }, []>('SELECT file FROM migrations')
    .all()
    .map(row => row.file);
  const appliedMigrations = new Set(migrations);

  await asyncLoop(migrationFiles, async migrationFile => {
    if (appliedMigrations.has(migrationFile)) return;
    const migrationPath = path.join(migrationsDir, migrationFile);
    const migrationModule = await import(migrationPath);

    try {
      await migrationModule.up(db);
      db.prepare('INSERT INTO migrations (file, applied) VALUES ($file, $applied)').run({
        file: migrationFile,
        applied: new Date().toISOString(),
      });

      console.info(`[${'Migration'.padEnd(16)}] - ${migrationFile} - Applied`);
    } catch (error) {
      console.error(error);
    }
  });

  console.info(`[${'Migration'.padEnd(16)}] - Done`);
})();