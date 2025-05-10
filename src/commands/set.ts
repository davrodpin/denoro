import { Command } from 'cliffy/command/mod.ts';
import { KVManager } from '../lib/kv/mod.ts';

export const setCommand = new Command()
  .name('set')
  .description('Set a KV record. The value must be a valid JSON string.')
  .arguments('<key:string> <value:string>')
  .option('-e, --expire <expire:number>', 'Expiration time in seconds')
  .option('-v, --versionstamp <versionstamp:string>', 'Version stamp')
  .option('--db-path <path:string>', 'Path to the KV database file')
  .env('DENORO_DB_PATH=<path:string>', 'Path to the KV database file')
  .example(
    'Set a user record',
    'denoro set users:fcd9ec13-b564-4f9a-bfa4-d4c4be89a5db \'{"email": "my@email.com"}\'',
  )
  .action(async (options, key: string, value: string) => {
    try {
      const dbPath = options.dbPath || Deno.env.get('DENORO_DB_PATH');
      if (!dbPath) {
        console.error(
          'Error: Database path must be specified using --db-path or DENORO_DB_PATH environment variable',
        );
        Deno.exit(1);
      }

      const parsedValue = JSON.parse(value);
      const kvManager = new KVManager({ path: dbPath });
      try {
        await kvManager.set(key, parsedValue, {
          expire: options.expire,
          versionstamp: options.versionstamp,
        });
        console.log(`Successfully set record for key: ${key}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error
          ? error.message
          : String(error);
        console.error(`Error setting record: ${errorMessage}`);
        Deno.exit(1);
      } finally {
        kvManager.close();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      console.error(`Error setting record: ${errorMessage}`);
      Deno.exit(1);
    }
  });
