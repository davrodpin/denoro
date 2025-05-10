import { Command } from 'cliffy/command/mod.ts';
import { KVManager } from '../lib/kv/mod.ts';
import { JSONFormatter, TableFormatter } from '../lib/formatters/mod.ts';

export const getManyCommand = new Command()
  .name('get-many')
  .description('Get multiple KV records')
  .arguments('<keys...:string>')
  .option('-f, --format <format:string>', 'Output format (table/json)', {
    default: 'table',
  })
  .option('--db-path <path:string>', 'Path to the KV database file')
  .env('DENORO_DB_PATH=<path:string>', 'Path to the KV database file')
  .action(async (options, ...keys: string[]) => {
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
        const records = await kvManager.getMany(keys);

        if (records.length === 0) {
          console.error('No records found');
          Deno.exit(1);
        }

        const formatter = options.format === 'json'
          ? new JSONFormatter()
          : new TableFormatter();

        console.log(formatter.format(records.filter((r): r is NonNullable<typeof r> => r !== null)));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        console.error(`Error getting records: ${errorMessage}`);
        Deno.exit(1);
      } finally {
        kvManager.close();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error getting records: ${errorMessage}`);
      Deno.exit(1);
    }
  }); 