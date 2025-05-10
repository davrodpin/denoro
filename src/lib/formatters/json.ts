import type { Formatter } from './mod.ts';
import type { KVRecord } from '../kv/mod.ts';

export class JSONFormatter implements Formatter {
  format(records: KVRecord[]): string {
    return JSON.stringify(records, null, 2);
  }
}
