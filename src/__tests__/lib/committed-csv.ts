import fs from 'fs';
import path from 'path';
import type { CsvTable } from '@/lib/csv';

const lf = (text: string) => text.replace(/\r\n/g, '\n');

/**
 * Read a committed export under `public/my-data/` through its table and write
 * it straight back out, exactly as the refresh script does.
 *
 * Git stores the refreshable exports with LF row endings, and that is what the
 * serializer writes, so on an LF checkout (CI) `output` is compared to the file
 * byte for byte. A Windows checkout with `core.autocrlf` turns every LF into
 * CRLF on disk; only then are both sides compared with CRLF folded to LF.
 */
export function roundTripCommitted<F extends string>(file: string, table: CsvTable<F>) {
  const raw = fs.readFileSync(path.join(process.cwd(), 'public/my-data', file), 'utf-8');
  const records = table.parse(raw, { strict: true });
  const serialized = table.serialize(records);
  const headerEndsCrlf = raw.indexOf('\r\n') !== -1 && raw.indexOf('\r\n') === raw.indexOf('\n') - 1;

  return {
    count: records.length,
    input: headerEndsCrlf ? lf(raw) : raw,
    output: headerEndsCrlf ? lf(serialized) : serialized,
  };
}
