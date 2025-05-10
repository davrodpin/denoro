import { Command } from 'cliffy/command/mod.ts';
import { KVManager } from '../lib/kv/mod.ts';
import { JSONFormatter, TableFormatter } from '../lib/formatters/mod.ts';

export const getCommand = new Command()
  .name('get')
  .description('Get a KV record')
  .arguments('<key:string>')
  .option('-f, --format <format:string>', 'Output format (table/json)', {
    default: 'table',
  })
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
        const record = await kvManager.get(key);

        if (!record) {
          console.error(`No record found for key: ${key}`);
          Deno.exit(1);
        }

        const formatter = options.format === 'json'
          ? new JSONFormatter()
          : new TableFormatter();

        console.log(formatter.format([record]));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        console.error(`Error getting record: ${errorMessage}`);
        Deno.exit(1);
      } finally {
        kvManager.close();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error getting record: ${errorMessage}`);
      Deno.exit(1);
    }
  });
