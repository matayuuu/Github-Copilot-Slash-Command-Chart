import { describe, expect, it } from 'vitest';
import { filterCommands, normalizeSearch } from '../../src/catalog/search';
import type { CatalogState } from '../../src/catalog/types';
import { initialState } from '../../src/catalog/url-state';
import { makeCommand, searchCommands } from './fixtures';

describe('normalizeSearch', () => {
  it.each([
    { input: '', expected: '' },
    { input: ' \t\n　', expected: '' },
    { input: '/', expected: '' },
    { input: '///', expected: '' },
    { input: '  /EXPLAIN  ', expected: 'explain' },
    { input: '／ＥＸＰＬＡＩＮ', expected: 'explain' },
    { input: 'ｺｰﾄﾞ　説明', expected: 'コード 説明' },
    { input: '/MCP \t /ADD\n登録', expected: 'mcp add 登録' },
    { input: '説明 /コード', expected: '説明 コード' },
  ])('normalizes $input to $expected', ({ input, expected }) => {
    expect(normalizeSearch(input)).toBe(expected);
    expect(normalizeSearch(normalizeSearch(input))).toBe(expected);
  });
});

describe('filterCommands', () => {
  const commands = searchCommands();
  const ids = (query: string, filters: Partial<CatalogState> = {}) =>
    filterCommands(commands, { ...initialState, query, ...filters }).map((command) => command.id);

  it.each(['explain', '/explain', 'EXPLAIN', '／ＥＸＰＬＡＩＮ'])(
    'matches names independently of slash, case and NFKC: %s',
    (query) => {
      expect(ids(query)).toEqual(['cli-explain', 'vscode-explain']);
    },
  );

  it('matches Japanese summaries and compatibility-normalized text', () => {
    expect(ids('動作 説明')).toEqual(['vscode-explain']);
    expect(ids('ｺｰﾄﾞ 修正')).toEqual(['vscode-fix']);
  });

  it('finds the canonical record through an alias', () => {
    expect(ids('/REPAIR')).toEqual(['vscode-fix']);
    expect(ids('/new')).toEqual(['cli-clear']);
  });

  it('finds parent records through subcommand syntax and description', () => {
    expect(ids('/mcp /add')).toEqual(['cli-mcp']);
    expect(ids('MCP 登録')).toEqual(['cli-mcp']);
  });

  it('finds a canonical parent through a subcommand written with its declared alias', () => {
    const parent = makeCommand({
      id: 'cli-autopilot',
      environmentId: 'cli',
      command: '/autopilot',
      syntax: '/autopilot',
      aliases: ['/goal'],
      subcommands: [{ syntax: '/goal on', description: '目標を有効化する' }],
    });
    expect(
      filterCommands([parent], { ...initialState, query: '/GOAL on' }).map((command) => command.id),
    ).toEqual(['cli-autopilot']);
  });

  it.each([
    { query: '引数 戻り値', expected: ['vscode-explain'] },
    { query: 'エディター 選択', expected: ['vscode-explain'] },
    { query: 'Terminal clear', expected: ['cli-clear'] },
    { query: 'vscode explain', expected: ['vscode-explain'] },
    { query: 'build ビルド', expected: ['cli-explain'] },
  ])('searches examples, conditions and execution context: $query', ({ query, expected }) => {
    expect(ids(query)).toEqual(expected);
  });

  it('requires every term, even when terms match different searchable fields', () => {
    expect(ids('explain 選択 戻り値')).toEqual(['vscode-explain']);
    expect(ids('explain 修正')).toEqual([]);
    expect(ids('explain 存在しない語')).toEqual([]);
  });

  it('combines text, environment and category with AND', () => {
    expect(ids('explain', { environment: 'vscode', category: 'documentation' })).toEqual([
      'vscode-explain',
    ]);
    expect(ids('explain', { environment: 'vscode', category: 'coding' })).toEqual([]);
    expect(ids('', { environment: 'cli', category: 'session' })).toEqual(['cli-clear']);
  });

  it('preserves same-name commands as separate environment records', () => {
    expect(ids('/explain')).toEqual(['cli-explain', 'vscode-explain']);
    expect(ids('/explain', { environment: 'cli' })).toEqual(['cli-explain']);
    expect(ids('/explain', { environment: 'vscode' })).toEqual(['vscode-explain']);
  });

  it.each(['', ' \t　', '/', '///'])(
    'returns all records for an empty normalized query: %s',
    (query) => {
      expect(ids(query)).toEqual([
        'cli-clear',
        'cli-explain',
        'vscode-explain',
        'vscode-fix',
        'cli-mcp',
      ]);
    },
  );

  it('returns no matches without discarding the source catalog', () => {
    expect(ids('unmatched-unique-token')).toEqual([]);
    expect(ids('', { environment: 'mobile' })).toEqual([]);
    expect(filterCommands([], initialState)).toEqual([]);
    expect(filterCommands(commands, initialState)).toHaveLength(commands.length);
  });

  it('clears query and all filters through the initial state', () => {
    const selected: CatalogState = {
      query: 'repair',
      environment: 'vscode',
      category: 'coding',
      selectedId: 'vscode-fix',
    };
    expect(filterCommands(commands, selected).map((command) => command.id)).toEqual(['vscode-fix']);
    expect(filterCommands(commands, initialState)).toHaveLength(commands.length);
  });

  it('ranks exact canonical and alias matches before prefixes and descriptive matches', () => {
    const ranked = [
      makeCommand({ id: 'vscode-afix', command: '/afix', syntax: '/afix', summary: 'fixを説明' }),
      makeCommand({ id: 'vscode-fixall', command: '/fixall', syntax: '/fixall' }),
      makeCommand({
        id: 'vscode-repair',
        command: '/repair',
        syntax: '/repair',
        aliases: ['/fix'],
      }),
      makeCommand({ id: 'vscode-fix', command: '/fix', syntax: '/fix' }),
    ];
    const before = structuredClone(ranked);
    expect(
      filterCommands(ranked, { ...initialState, query: '/FIX' }).map((command) => command.id),
    ).toEqual(['vscode-fix', 'vscode-repair', 'vscode-fixall', 'vscode-afix']);
    expect(ranked).toEqual(before);
  });

  it('uses deterministic command, environment and ID tie-breaks regardless of input order', () => {
    const tied = [
      makeCommand({ id: 'vscode-explain-b', sessionKind: 'Inline chat' }),
      makeCommand({ id: 'vscode-explain-a' }),
      makeCommand({ id: 'cli-explain', environmentId: 'cli' }),
    ];
    const expected = ['cli-explain', 'vscode-explain-a', 'vscode-explain-b'];
    for (const query of ['', 'explain']) {
      const state = { ...initialState, query };
      expect(filterCommands(tied, state).map((command) => command.id)).toEqual(expected);
      expect(filterCommands([...tied].reverse(), state).map((command) => command.id)).toEqual(
        expected,
      );
    }
  });

  it('does not mutate the input records, input order or filter state', () => {
    const state = { ...initialState, query: 'explain' };
    const before = structuredClone({ commands, state });
    filterCommands(commands, state);
    expect({ commands, state }).toEqual(before);
  });
});
