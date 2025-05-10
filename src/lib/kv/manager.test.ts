import {
  assertEquals,
  assertExists,
} from 'https://deno.land/std@0.220.1/assert/mod.ts';
import { KVManager } from './manager.ts';

Deno.test('KVManager', async (t) => {
  // Store the original Deno.openKv function
  const originalOpenKv = Deno.openKv;
  let kv: Deno.Kv;

  // Setup: Create KV instance
  await t.step('setup', async () => {
    kv = await Deno.openKv(':memory:');
    Deno.openKv = () => new Promise((resolve) => resolve(kv));
  });

  await t.step('should create instance with default options', () => {
    const manager = new KVManager();
    assertExists(manager);
  });

  await t.step('should set and get a value', async () => {
    const manager = new KVManager();
    const key = 'test:key';
    const value = { name: 'test' };

    await manager.set(key, value);
    const result = await manager.get(key);

    assertEquals(result?.value, value);
    assertEquals(result?.key, key);
    assertExists(result?.versionstamp);
  });

  await t.step('should return null for non-existent key', async () => {
    const manager = new KVManager();
    const result = await manager.get('non:existent');
    assertEquals(result, null);
  });

  await t.step('should delete a value', async () => {
    const manager = new KVManager();
    const key = 'test:delete';
    const value = { name: 'test' };

    await manager.set(key, value);
    await manager.delete(key);
    const result = await manager.get(key);

    assertEquals(result, null);
  });

  await t.step('should list values with prefix', async () => {
    const manager = new KVManager();
    const prefix = 'test:list';
    const values = [
      { key: `${prefix}:1`, value: 'value1' },
      { key: `${prefix}:2`, value: 'value2' },
      { key: 'other:key', value: 'value3' },
    ];

    for (const { key, value } of values) {
      await manager.set(key, value);
    }

    const results = await manager.list({ prefix });
    assertEquals(results.length, 2);
    assertEquals(
      results.map((r) => r.key).sort(),
      [`${prefix}:1`, `${prefix}:2`].sort(),
    );
  });

  await t.step('should list values with limit', async () => {
    const manager = new KVManager();
    const prefix = 'test:limit';
    const values = [
      { key: `${prefix}:1`, value: 'value1' },
      { key: `${prefix}:2`, value: 'value2' },
      { key: `${prefix}:3`, value: 'value3' },
    ];

    for (const { key, value } of values) {
      await manager.set(key, value);
    }

    const results = await manager.list({ prefix, limit: 2 });
    assertEquals(results.length, 2);
  });

  await t.step('should handle complex key paths', async () => {
    const manager = new KVManager();
    const key = 'user:123:profile:settings';
    const value = { theme: 'dark', notifications: true };

    await manager.set(key, value);
    const result = await manager.get(key);

    assertEquals(result?.value, value);
    assertEquals(result?.key, key);
  });

  await t.step('should get multiple values', async () => {
    const manager = new KVManager();
    const testData = [
      { key: 'test:many:1', value: 'value1' },
      { key: 'test:many:2', value: 'value2' },
      { key: 'test:many:3', value: 'value3' },
    ];

    // Set up test data
    for (const { key, value } of testData) {
      await manager.set(key, value);
    }

    // Test getting all existing keys
    const results = await manager.getMany(testData.map(d => d.key));
    assertEquals(results.length, testData.length);
    
    // Verify all values are present and correct
    for (let i = 0; i < testData.length; i++) {
      const result = results[i];
      assertExists(result);
      assertEquals(result.key, testData[i].key);
      assertEquals(result.value, testData[i].value);
      assertExists(result.versionstamp);
    }
  });

  await t.step('should handle non-existent keys in getMany', async () => {
    const manager = new KVManager();
    const existingKey = 'test:existing';
    const nonExistentKey = 'test:non:existent';
    const value = 'test value';

    await manager.set(existingKey, value);
    const results = await manager.getMany([existingKey, nonExistentKey]);

    assertEquals(results.length, 2);
    assertExists(results[0]);
    assertEquals(results[0]?.key, existingKey);
    assertEquals(results[0]?.value, value);
    assertEquals(results[1], null);
  });

  // Cleanup: Close KV instance and restore original Deno.openKv
  await t.step('cleanup', () => {
    kv.close();
    Deno.openKv = originalOpenKv;
  });
});
