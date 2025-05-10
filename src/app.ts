import { Command } from 'cliffy/command/mod.ts';
import { listCommand } from './commands/list.ts';
import { getCommand } from './commands/get.ts';
import { setCommand } from './commands/set.ts';
import { deleteCommand } from './commands/delete.ts';
import { getManyCommand } from './commands/get-many.ts';

let version = 'dev';
try {
  version = Deno.readTextFileSync(import.meta.dirname + '/VERSION');
} catch {
  // If file doesn't exist or can't be read, version remains 'dev'
}

const program = new Command()
  .name('denoro')
  .version(version)
  .description('Deno KV CLI Explorer Tool')
  .action(() => {
    program.showHelp();
  });

program.command('list', listCommand);
program.command('get', getCommand);
program.command('get-many', getManyCommand);
program.command('set', setCommand);
program.command('delete', deleteCommand);

if (import.meta.main) {
  await program.parse(Deno.args);
}
