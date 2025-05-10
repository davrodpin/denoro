import { Command } from 'cliffy/command/mod.ts';
import { KVManager } from '../lib/kv/mod.ts';

export const deleteCommand = new Command()
  .name('delete')
  .description('Delete a KV record')
  .arguments('<key:string>')
  .option('--db-path <path:string>', 'Path to the KV database file')
  .env('DENORO_DB_PATH=<path:string>', 'Path to the KV database file')
  .action(async (options, key: string) => {
    try {
      const dbPath = options.dbPath || Deno.env.get('DENORO_DB_PATH');
      if (!dbPath) {
        console.error(
          'Error: Database path must be specified using --db-path or DENORO_DB_PATH environment variable',
        );
        Deno.exit(1);
      }

      const kvManager = new KVManager({ path: dbPath });
      try {
        await kvManager.delete(key);
        console.log(`Successfully deleted record for key: ${key}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        console.error(`Error deleting record: ${errorMessage}`);
        Deno.exit(1);
      } finally {
        kvManager.close();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error deleting record: ${errorMessage}`);
      Deno.exit(1);
    }
  });
