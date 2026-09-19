import { describe, expect, it } from 'vitest';
import type { CommandRecord } from '../../src/catalog/types';
import { validateCatalog } from '../../src/catalog/validate';
import { makeCatalog, makeCommand } from './fixtures';

describe('validateCatalog rejects intentionally broken fixtures', () => {
  it('rejects a catalog without commands', () => {
    expect(validateCatalog(makeCatalog([]))).toContain('コマンドが0件です。');
  });

  it('rejects duplicate command IDs', () => {
    const catalog = makeCatalog([makeCommand(), makeCommand()]);
    expect(validateCatalog(catalog)).toContain('vscode-explain: IDが重複しています。');
  });

  it('rejects the same canonical command in the same environment and session', () => {
    const catalog = makeCatalog([makeCommand(), makeCommand({ id: 'vscode-explain-duplicate' })]);
    expect(validateCatalog(catalog)).toContain(
      'vscode-explain-duplicate: 同一文脈のコマンドが重複しています。',
    );
  });

  it('rejects duplicate source and environment IDs', () => {
    const catalog = makeCatalog();
    catalog.sources.push(...structuredClone(catalog.sources));
    catalog.environments.push(...structuredClone(catalog.environments));
    const errors = validateCatalog(catalog);
    expect(errors).toContain('出典IDが重複しています。');
    expect(errors).toContain('環境IDが重複しています。');
  });

  it('rejects missing environment records, including command references', () => {
    const catalog = makeCatalog();
    catalog.environments = catalog.environments.filter(
      (environment) => environment.id !== 'vscode' && environment.id !== 'mobile',
    );
    const errors = validateCatalog(catalog);
    expect(errors).toContain('環境 vscode の調査状態がありません。');
    expect(errors).toContain('環境 mobile の調査状態がありません。');
    expect(errors).toContain('vscode-explain: 利用環境がありません。');
  });

  it.each([{ sourceIds: [] }, { sourceIds: ['missing-source'] }])(
    'rejects command source references $sourceIds',
    ({ sourceIds }) => {
      expect(validateCatalog(makeCatalog([makeCommand({ sourceIds })]))).toContain(
        'vscode-explain: 出典参照が不正です。',
      );
    },
  );

  it.each([{ sourceIds: [] }, { sourceIds: ['missing-source'] }])(
    'rejects environment source references $sourceIds',
    ({ sourceIds }) => {
      const catalog = makeCatalog();
      for (const environment of catalog.environments) environment.sourceIds = sourceIds;
      expect(validateCatalog(catalog)).toContain('環境 vscode: 出典参照が不正です。');
    },
  );

  it('rejects coverage that disagrees with command presence in either direction', () => {
    const catalog = makeCatalog();
    for (const environment of catalog.environments) {
      environment.coverage = environment.coverage === 'documented' ? 'unverified' : 'documented';
    }
    const errors = validateCatalog(catalog);
    expect(errors).toContain('環境 vscode: 調査状態と掲載件数が一致しません。');
    expect(errors).toContain('環境 mobile: 調査状態と掲載件数が一致しません。');
  });

  it.each([
    '',
    'not-a-date',
    '2026-9-19',
    '2026-09-19T00:00:00Z',
    '2026-02-29',
    '2026-02-30',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-09-00',
  ])('rejects invalid verification dates in commands and sources: %s', (date) => {
    const catalog = makeCatalog([makeCommand({ lastVerified: date })]);
    for (const source of catalog.sources) source.checkedAt = date;
    const errors = validateCatalog(catalog);
    expect(errors).toContain('vscode-explain: 確認日が不正です。');
    expect(errors).toContain('出典 official-reference: 確認日が不正です。');
  });

  it.each([
    'not-a-url',
    '/relative',
    'http://docs.github.com/en/copilot',
    'javascript:alert(1)',
    'https://example.com/copilot',
    'https://docs.github.com.example.com/copilot',
    'https://example.com/docs.github.com',
    'https://user@docs.github.com/en/copilot',
    'https://user:password@learn.microsoft.com/copilot',
    'https://github.com/unofficial/copilot',
    'https://github.com/github-lookalike/copilot',
    'https://github.com/github',
    'https://raw.githubusercontent.com/unofficial/copilot/main/README.md',
    'https://github.com/unofficial/../github/copilot/../../unofficial/copilot',
  ])('rejects nonofficial or unsafe source URL: %s', (url) => {
    const catalog = makeCatalog();
    for (const source of catalog.sources) source.url = url;
    expect(validateCatalog(catalog)).toContain(
      '出典 official-reference: 公式HTTPS URLではありません。',
    );
  });

  it.each([
    'explain',
    '/',
    '//explain',
    '@workspace',
    '#file',
    '--help',
    '/explain extra',
    '/explain_name',
    '/ｅｘｐｌａｉｎ',
  ])('rejects non-slash-command notation: %s', (command) => {
    const catalog = makeCatalog([makeCommand({ command, syntax: command })]);
    expect(validateCatalog(catalog)).toContain('vscode-explain: slash表記が不正です。');
  });

  it.each([
    { syntax: '/other add', description: '別コマンド' },
    { syntax: '/explain-other add', description: '接頭辞だけ一致' },
    { syntax: '/explain', description: '親だけ' },
    { syntax: '/explain add', description: ' ' },
    { syntax: '/describe-other add', description: '別名の接頭辞だけ一致' },
    { syntax: '/describe', description: '別名だけ' },
    { syntax: '/describe details', description: ' ' },
  ])('rejects a wrong subcommand: $syntax / $description', (subcommand) => {
    const catalog = makeCatalog([
      makeCommand({ aliases: ['/describe'], subcommands: [subcommand] }),
    ]);
    expect(validateCatalog(catalog)).toContain(
      'vscode-explain: サブコマンドの構文・説明が不正です。',
    );
  });

  const invalidCommands: {
    label: string;
    changes: Partial<CommandRecord>;
    error: string;
  }[] = [
    { label: 'unstable ID', changes: { id: 'Invalid_ID' }, error: 'IDの形式が不正です。' },
    {
      label: 'missing syntax',
      changes: { syntax: '/other' },
      error: '構文にコマンド名がありません。',
    },
    {
      label: 'blank summary',
      changes: { summary: ' ' },
      error: '用途・実行文脈が不足しています。',
    },
    {
      label: 'blank session',
      changes: { sessionKind: '' },
      error: '用途・実行文脈が不足しています。',
    },
    { label: 'missing examples', changes: { examples: [] }, error: '使用例が不足しています。' },
    {
      label: 'blank example prompt',
      changes: { examples: [{ prompt: ' ', description: '説明' }] },
      error: '使用例が不足しています。',
    },
    {
      label: 'blank example description',
      changes: { examples: [{ prompt: '/explain', description: '' }] },
      error: '使用例が不足しています。',
    },
    {
      label: 'duplicate alias',
      changes: { aliases: ['/help', '/help'] },
      error: 'aliasが重複しています。',
    },
    { label: 'canonical alias', changes: { aliases: ['/explain'] }, error: 'aliasが不正です。' },
    { label: 'non-slash alias', changes: { aliases: ['help'] }, error: 'aliasが不正です。' },
  ];

  it.each(invalidCommands)('rejects $label', ({ changes, error }) => {
    const command = makeCommand(changes);
    expect(validateCatalog(makeCatalog([command]))).toContain(`${command.id}: ${error}`);
  });

  it('rejects missing descriptive source and environment fields', () => {
    const catalog = makeCatalog();
    for (const source of catalog.sources) source.section = '';
    for (const environment of catalog.environments) environment.note = '';
    const errors = validateCatalog(catalog);
    expect(errors).toContain('出典 official-reference: 必須情報不足。');
    expect(errors).toContain('環境 vscode: 説明が不足しています。');
  });
});

describe('validateCatalog accepts valid fixtures after rejection checks', () => {
  it('accepts a minimal complete catalog without mutating it', () => {
    const catalog = makeCatalog();
    const before = structuredClone(catalog);
    expect(validateCatalog(catalog)).toEqual([]);
    expect(catalog).toEqual(before);
  });

  it.each([
    'https://docs.github.com/en/copilot',
    'https://code.visualstudio.com/docs/copilot/overview',
    'https://learn.microsoft.com/en-us/visualstudio/ide/',
    'https://github.com/github/copilot-cli',
    'https://github.com/microsoft/vscode',
    'https://github.com/MicrosoftDocs/visualstudio-docs',
    'https://raw.githubusercontent.com/github/copilot-cli/main/README.md',
    'https://raw.githubusercontent.com/microsoft/vscode/main/README.md',
    'https://raw.githubusercontent.com/MicrosoftDocs/visualstudio-docs/main/README.md',
  ])('accepts official source URL: %s', (url) => {
    const catalog = makeCatalog();
    for (const source of catalog.sources) source.url = url;
    expect(validateCatalog(catalog)).toEqual([]);
  });

  it('accepts real leap dates and subcommands belonging to their parent', () => {
    const catalog = makeCatalog([
      makeCommand({
        lastVerified: '2024-02-29',
        aliases: ['/describe'],
        subcommands: [{ syntax: '/explain details', description: '詳細を説明する' }],
      }),
    ]);
    for (const source of catalog.sources) source.checkedAt = '2024-02-29';
    expect(validateCatalog(catalog)).toEqual([]);
  });

  it.each([
    { command: '/autopilot', alias: '/goal', argument: 'on' },
    { command: '/autopilot', alias: '/goal', argument: 'off' },
    { command: '/cwd', alias: '/cd', argument: '[PATH]' },
    { command: '/permissions', alias: '/allow-all', argument: '[off|auto|show]' },
    { command: '/permissions', alias: '/yolo', argument: '[off|auto|show]' },
    { command: '/session', alias: '/rename', argument: '[NAME]' },
  ])(
    'accepts subcommands of declared alias $alias under $command',
    ({ command, alias, argument }) => {
      const catalog = makeCatalog([
        makeCommand({
          id: 'cli-alias-parent',
          environmentId: 'cli',
          command,
          syntax: command,
          aliases: [alias],
          subcommands: [
            { syntax: `${command} ${argument}`, description: '親コマンドの操作' },
            { syntax: `${alias} ${argument}`, description: '宣言済みの別名による操作' },
          ],
        }),
      ]);
      expect(validateCatalog(catalog)).toEqual([]);
    },
  );

  it('keeps same-name commands in different environments or sessions distinct', () => {
    const catalog = makeCatalog([
      makeCommand(),
      makeCommand({ id: 'cli-explain', environmentId: 'cli' }),
      makeCommand({ id: 'vscode-inline-explain', sessionKind: 'Inline chat' }),
    ]);
    expect(validateCatalog(catalog)).toEqual([]);
  });
});
