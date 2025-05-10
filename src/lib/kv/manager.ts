export interface KVManagerOptions {
  path?: string;
}

export interface KVRecord {
  key: string | null;
  value: unknown;
  versionstamp: string | null;
}

export interface SetOptions {
  expire?: number;
  versionstamp?: string;
}

export interface ListOptions {
  prefix?: string;
  limit?: number;
  reverse?: boolean;
  start?: string;
  end?: string;
}

export class KVManager {
  private kv: Deno.Kv | null = null;
  private options: KVManagerOptions;

  constructor(options: KVManagerOptions = {}) {
    this.options = options;
  }

  private async getKV(): Promise<Deno.Kv> {
    if (!this.kv) {
      this.kv = await Deno.openKv(this.options.path);
    }
    return this.kv;
  }

  async get<T = unknown>(key: string): Promise<KVRecord | null> {
    const kv = await this.getKV();
    const entry = await kv.get<T>(key.split(':'));
    if (!entry.value) return null;

    return {
      key: Array.isArray(entry.key) ? entry.key.join(':').toLowerCase() : String(entry.key).toLowerCase(),
      value: entry.value,
      versionstamp: entry.versionstamp,
    };
  }

  async set<T = unknown>(
    key: string,
    value: T,
    options: SetOptions = {},
  ): Promise<void> {
    const kv = await this.getKV();
    await kv.set(key.split(':'), value, {
      expireIn: options.expire ? options.expire * 1000 : undefined,
    });
  }

  async delete(key: string): Promise<void> {
    const kv = await this.getKV();
    await kv.delete(key.split(':'));
  }

  async list<T = unknown>(
    options: ListOptions = {},
  ): Promise<KVRecord[]> {
    const kv = await this.getKV();
    const entries = kv.list<T>({
      prefix: options.prefix ? options.prefix.split(':') : undefined,
      start: options.start ? options.start.split(':') : undefined,
      end: options.end ? options.end.split(':') : undefined,
    } as Deno.KvListSelector, {
      limit: options.limit,
      reverse: options.reverse,
    });
    const records: KVRecord[] = [];

    for await (const entry of entries) {
      records.push({
        key: Array.isArray(entry.key) ? entry.key.join(':').toLowerCase() : String(entry.key).toLowerCase(),
        value: entry.value,
        versionstamp: entry.versionstamp,
      });
    }

    return records;
  }

  async getMany<T = unknown>(keys: string[]): Promise<(KVRecord | null)[]> {
    const kv = await this.getKV();
    const entries = await kv.getMany(keys.map(key => key.split(':')));
    
    return entries.map((entry: Deno.KvEntryMaybe<unknown>) => {
      if (!entry.value) return null;
      return {
        key: Array.isArray(entry.key) ? entry.key.join(':') : String(entry.key),
        value: entry.value,
        versionstamp: entry.versionstamp,
      };
    });
  }

  close(): void {
    if (this.kv) {
      this.kv.close();
      this.kv = null;
    }
  }
}
