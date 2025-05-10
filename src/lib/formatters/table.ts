import { bold } from 'std/fmt/colors.ts';
import type { Formatter } from './mod.ts';
import type { KVRecord } from '../kv/mod.ts';

export class TableFormatter implements Formatter {
  format(records: KVRecord[]): string {
    if (records.length === 0) {
      return 'No records found.';
    }

    // Get all unique property names from object values
    const allProperties = new Set<string>();
    records.forEach((record) => {
      if (
        record.value && typeof record.value === 'object' &&
        !Array.isArray(record.value)
      ) {
        Object.keys(record.value as Record<string, unknown>).forEach((key) =>
          allProperties.add(key)
        );
      }
    });

    // Create headers array with Key, all object properties, and Versionstamp
    const headers = ['key', ...Array.from(allProperties), 'versionstamp'];

    // Create rows with proper value mapping
    const rows = records.map((record) => {
      const row = [record.key ?? ''];

      // Add all object properties
      allProperties.forEach((prop) => {
        if (
          record.value && typeof record.value === 'object' &&
          !Array.isArray(record.value)
        ) {
          const value = (record.value as Record<string, unknown>)[prop];
          row.push(JSON.stringify(value ?? ''));
        } else {
          row.push('');
        }
      });

      // Add versionstamp
      row.push(record.versionstamp ?? '');
      return row;
    });

    // Calculate column widths
    const colWidths = headers.map((_, i) => {
      const maxContentLength = Math.max(
        headers[i].length,
        ...rows.map((row) => String(row[i]).length),
      );
      return maxContentLength + 2; // Add padding
    });

    // Create header
    const header = headers
      .map((h, i) => bold(h.padEnd(colWidths[i])))
      .join(' | ');

    // Create separator
    const separator = colWidths
      .map((width) => '-'.repeat(width))
      .join('-+-');

    // Create rows
    const formattedRows = rows.map((row) =>
      row
        .map((cell, i) => String(cell).padEnd(colWidths[i]))
        .join(' | ')
    );

    return [header, separator, ...formattedRows].join('\n');
  }
}
