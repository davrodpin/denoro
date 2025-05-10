import { Command } from 'cliffy/command/mod.ts';
import { JSONFormatter, TableFormatter } from '../lib/formatters/mod.ts';
import { KVManager } from '../lib/kv/mod.ts';

interface ListOptions {
  dbPath?: string;
  prefix?: string;
  start?: string;
  end?: string;
  reverse?: boolean;
  limit?: number;
  format?: 'table' | 'json';
}

export const listCommand = new Command()
  .name('list')
  .description('List KV records')
  .option('-p, --prefix <prefix:string>', 'Filter by key prefix')
  .option('-s, --start <start:string>', 'Start key')
  .option('-e, --end <end:string>', 'End key')
  .option('-r, --reverse', 'Reverse order')
  .option('-l, --limit <limit:number>', 'Maximum number of results')
  .option('-f, --format <format:string>', 'Output format (table/json)', {
    default: 'table',
  })
  .option('--db-path <path:string>', 'Path to the KV database file')
  .env('DENORO_DB_PATH=<path:string>', 'Path to the KV database file')
  .action(async (options) => {
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
        const records = await kvManager.list(options as ListOptions);

        const formatter = options.format === 'json'
          ? new JSONFormatter()
          : new TableFormatter();

        console.log(formatter.format(records));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        console.error(`Error listing records: ${errorMessage}`);
        Deno.exit(1);
      } finally {
        kvManager.close();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error listing records: ${errorMessage}`);
      Deno.exit(1);
    }
  });
