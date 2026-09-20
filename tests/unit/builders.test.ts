import { describe, expect, it } from 'vitest';
import { checkedAt, commandBuilder } from '../../src/data/builders';

describe('per-command verification dates', () => {
  const build = commandBuilder('cli', 'local', ['cli-command-reference']);

  it('preserves the shared date for records not reverified', () => {
    const record = build('/help', 'ヘルプ', 'documentation', '/help', 'ヘルプを開く');
    expect(record.lastVerified).toBe(checkedAt);
  });

  it('updates a verified record without advancing other records or the shared date', () => {
    const updated = build('/help', 'ヘルプ', 'documentation', '/help', 'ヘルプを開く', {
      lastVerified: '2026-09-20',
    });
    const unchanged = build('/clear', '会話を消去', 'session', '/clear', '会話を消去する');
    expect(updated.lastVerified).toBe('2026-09-20');
    expect(unchanged.lastVerified).toBe(checkedAt);
    expect(checkedAt).toBe('2026-09-19');
  });
});
