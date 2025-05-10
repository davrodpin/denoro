import type { KVRecord } from '../kv/mod.ts';
export interface Formatter {
  format(records: KVRecord[]): string;
}

export * from './json.ts';
export * from './table.ts';
