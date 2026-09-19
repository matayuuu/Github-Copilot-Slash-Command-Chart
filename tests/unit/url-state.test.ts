import { describe, expect, it } from 'vitest';
import { categories, environmentIds } from '../../src/catalog/types';
import type { CatalogState } from '../../src/catalog/types';
import { createStateUrl, initialState, parseUrlState } from '../../src/catalog/url-state';
import { searchCommands } from './fixtures';

const commands = searchCommands();
const base = 'https://example.com/Github-Copilot-Slash-Command-Chart/';

describe('parseUrlState', () => {
  it('uses a fresh initial state for a URL without app parameters', () => {
    const parsed = parseUrlState(new URL(base), commands);
    expect(parsed).toEqual({
      state: { query: '', environment: 'all', category: 'all', selectedId: null },
      warnings: [],
    });
    expect(parsed.state).not.toBe(initialState);
  });

  it('preserves Japanese, slashes, spaces and punctuation without normalizing the URL query', () => {
    const url = new URL(base);
    url.searchParams.set('q', '／ＥＸＰＬＡＩＮ 説明 + & # ?');
    expect(parseUrlState(url, commands).state.query).toBe('／ＥＸＰＬＡＩＮ 説明 + & # ?');
  });

  it.each(environmentIds)(
    'accepts known environment %s, including unverified ones',
    (environment) => {
      const parsed = parseUrlState(new URL(`?env=${environment}`, base), commands);
      expect(parsed.state.environment).toBe(environment);
      expect(parsed.warnings).toEqual([]);
    },
  );

  it.each(categories)('accepts known category $id', ({ id }) => {
    const parsed = parseUrlState(new URL(`?category=${id}`, base), commands);
    expect(parsed.state.category).toBe(id);
    expect(parsed.warnings).toEqual([]);
  });

  it('accepts explicit all filters without warning', () => {
    const parsed = parseUrlState(new URL('?env=all&category=all', base), commands);
    expect(parsed).toEqual({ state: initialState, warnings: [] });
  });

  it('corrects unknown environment and category independently and explains both', () => {
    const url = new URL('?q=説明&env=unknown&category=invalid&keep=yes', base);
    const parsed = parseUrlState(url, commands);
    expect(parsed.state).toEqual({ ...initialState, query: '説明' });
    expect(parsed.warnings).toHaveLength(2);
    expect(parsed.warnings.join(' ')).toContain('環境');
    expect(parsed.warnings.join(' ')).toContain('用途');
    expect(url.searchParams.get('env')).toBe('unknown');
    expect(url.searchParams.get('keep')).toBe('yes');
  });

  it('corrects an unknown selected command without losing valid filters', () => {
    const parsed = parseUrlState(new URL('?env=cli&command=missing-command', base), commands);
    expect(parsed.state).toEqual({ ...initialState, environment: 'cli' });
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toContain('選択を解除');
  });

  it('retains a selected command present in the filtered result', () => {
    const parsed = parseUrlState(
      new URL('?q=説明&env=vscode&category=documentation&command=vscode-explain', base),
      commands,
    );
    expect(parsed.state.selectedId).toBe('vscode-explain');
    expect(parsed.warnings).toEqual([]);
  });

  it.each(['q=修正', 'env=cli', 'category=coding'])(
    'clears a selected command excluded by %s',
    (filter) => {
      const parsed = parseUrlState(new URL(`?command=vscode-explain&${filter}`, base), commands);
      expect(parsed.state.selectedId).toBeNull();
      expect(parsed.warnings).toHaveLength(1);
      expect(parsed.warnings[0]).toContain('検索結果にない');
    },
  );

  it('uses the first duplicate app parameter and warns separately for each key', () => {
    const url = new URL(
      '?q=説明&q=修正&env=vscode&env=cli&category=documentation&category=coding' +
        '&command=vscode-explain&command=cli-clear&keep=a&keep=b',
      base,
    );
    const parsed = parseUrlState(url, commands);
    expect(parsed.state).toEqual({
      query: '説明',
      environment: 'vscode',
      category: 'documentation',
      selectedId: 'vscode-explain',
    });
    expect(parsed.warnings).toHaveLength(4);
    for (const key of ['q', 'env', 'category', 'command']) {
      expect(parsed.warnings.some((warning) => warning.includes(`「${key}」`))).toBe(true);
    }
    expect(url.searchParams.getAll('keep')).toEqual(['a', 'b']);
  });

  it('does not let later duplicates override invalid or empty first values', () => {
    const parsed = parseUrlState(
      new URL('?q=&q=説明&env=unknown&env=cli&command=missing&command=cli-clear', base),
      commands,
    );
    expect(parsed.state).toEqual(initialState);
    expect(parsed.warnings).toHaveLength(5);
  });

  it('handles a selected command against an empty catalog', () => {
    const parsed = parseUrlState(new URL('?command=vscode-explain', base), []);
    expect(parsed.state.selectedId).toBeNull();
    expect(parsed.warnings).toHaveLength(1);
  });
});

describe('createStateUrl', () => {
  it('round-trips Japanese query and selected state under a project base path', () => {
    const state: CatalogState = {
      query: '説明 コード',
      environment: 'vscode',
      category: 'documentation',
      selectedId: 'vscode-explain',
    };
    const input = new URL(`${base}?keep=値#details`);
    const before = input.href;
    const result = createStateUrl(input, state);
    expect(result.pathname).toBe('/Github-Copilot-Slash-Command-Chart/');
    expect(result.hash).toBe('#details');
    expect(result.searchParams.get('keep')).toBe('値');
    expect(result.searchParams.get('q')).toBe(state.query);
    expect(parseUrlState(result, commands)).toEqual({ state, warnings: [] });
    expect(input.href).toBe(before);
    expect(result).not.toBe(input);
  });

  it('removes stale and duplicate app parameters, retaining unrelated repeated parameters', () => {
    const input = new URL(
      '?q=old&q=stale&env=cli&env=vscode&category=session&category=coding' +
        '&command=cli-clear&command=vscode-fix&tag=one&tag=two&lang=ja#catalog',
      base,
    );
    const state = { ...initialState, query: '説明', environment: 'vscode' as const };
    const result = createStateUrl(input, state);
    expect(result.searchParams.getAll('q')).toEqual(['説明']);
    expect(result.searchParams.getAll('env')).toEqual(['vscode']);
    expect(result.searchParams.has('category')).toBe(false);
    expect(result.searchParams.has('command')).toBe(false);
    expect(result.searchParams.getAll('tag')).toEqual(['one', 'two']);
    expect(result.searchParams.get('lang')).toBe('ja');
    expect(result.hash).toBe('#catalog');
  });

  it('clears all app state without losing the origin, path, hash or unrelated query', () => {
    const input = new URL(
      'https://example.com:8443/nested/site/?q=fix&env=cli&category=coding&command=cli-fix&keep=1#top',
    );
    const result = createStateUrl(input, initialState);
    expect(result.href).toBe('https://example.com:8443/nested/site/?keep=1#top');
    expect(parseUrlState(result, commands)).toEqual({ state: initialState, warnings: [] });
  });

  it('round-trips HTML-looking input as data rather than URL structure', () => {
    const query = '<img src=x onerror="alert(1)"> & q=override #fragment';
    const result = createStateUrl(new URL(base), { ...initialState, query });
    expect(result.hash).toBe('');
    expect(result.searchParams.getAll('q')).toEqual([query]);
    expect(parseUrlState(result, commands).state.query).toBe(query);
    expect(result.href).not.toContain('<img');
  });
});
