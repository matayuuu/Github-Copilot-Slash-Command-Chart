import { describe, expect, it } from 'vitest';
import { readBuildRevision } from '../../vite.config';

describe('readBuildRevision', () => {
  it.each(['', 'main', '511b2d2', 'g'.repeat(40), `${'a'.repeat(40)}\n`])(
    'rejects malformed revision %j instead of claiming a valid build',
    (value) => {
      expect(() => readBuildRevision(value)).toThrow('GITHUB_SHA');
    },
  );

  it('marks a local build explicitly without inventing a GitHub commit', () => {
    expect(readBuildRevision(undefined)).toBe('local');
  });

  it('keeps a full commit SHA and normalizes its hex casing', () => {
    expect(readBuildRevision('Ab'.repeat(20))).toBe('ab'.repeat(20));
  });
});
