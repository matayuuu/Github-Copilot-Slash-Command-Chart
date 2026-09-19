import { environmentIds } from '../../src/catalog/types';
import type { CommandRecord, EnvironmentRecord, SourceRecord } from '../../src/catalog/types';

export interface CatalogFixture {
  commands: CommandRecord[];
  environments: EnvironmentRecord[];
  sources: SourceRecord[];
}

export function makeCommand(overrides: Partial<CommandRecord> = {}): CommandRecord {
  return {
    id: 'vscode-explain',
    environmentId: 'vscode',
    sessionKind: 'Chat view',
    command: '/explain',
    syntax: '/explain [質問]',
    aliases: [],
    subcommands: [],
    summary: '選択したコードの動作を説明する',
    categoryId: 'documentation',
    examples: [{ prompt: '/explain 関数の引数', description: '引数と戻り値を確認する' }],
    conditions: ['エディターでコードを選択'],
    warnings: [],
    kind: 'command',
    sourceIds: ['official-reference'],
    lastVerified: '2026-09-19',
    ...overrides,
  };
}

export function makeCatalog(commands: CommandRecord[] = [makeCommand()]): CatalogFixture {
  return {
    commands,
    environments: environmentIds.map((id) => ({
      id,
      name: id,
      shortName: id,
      coverage: commands.some((command) => command.environmentId === id)
        ? 'documented'
        : 'unverified',
      note: '公式資料で確認した範囲を記録する。',
      sourceIds: ['official-reference'],
    })),
    sources: [
      {
        id: 'official-reference',
        title: 'Copilot reference',
        url: 'https://docs.github.com/en/copilot/reference/chat-cheat-sheet',
        section: 'Slash commands',
        checkedAt: '2026-09-19',
      },
    ],
  };
}

export function searchCommands(): CommandRecord[] {
  return [
    makeCommand(),
    makeCommand({
      id: 'cli-explain',
      environmentId: 'cli',
      sessionKind: 'Terminal session',
      summary: 'CLIの処理を説明する',
      conditions: [],
      examples: [{ prompt: '/explain build', description: 'ビルドの流れを確認する' }],
    }),
    makeCommand({
      id: 'vscode-fix',
      command: '/fix',
      syntax: '/fix [修正内容]',
      aliases: ['/repair'],
      summary: 'コードの問題を修正する',
      categoryId: 'coding',
      conditions: [],
      examples: [{ prompt: '/fix 型エラー', description: '型の問題を解消する' }],
    }),
    makeCommand({
      id: 'cli-mcp',
      environmentId: 'cli',
      sessionKind: 'Terminal session',
      command: '/mcp',
      syntax: '/mcp [サブコマンド]',
      subcommands: [{ syntax: '/mcp add', description: 'MCPサーバーを登録する' }],
      summary: '外部ツール接続を管理する',
      categoryId: 'settings',
      conditions: ['MCPサーバーを接続'],
      examples: [{ prompt: '/mcp add', description: 'サーバーの登録を始める' }],
    }),
    makeCommand({
      id: 'cli-clear',
      environmentId: 'cli',
      sessionKind: 'Terminal session',
      command: '/clear',
      syntax: '/clear',
      aliases: ['/new'],
      summary: '会話履歴をクリアする',
      categoryId: 'session',
      conditions: [],
      examples: [{ prompt: '/clear', description: '新しい会話を始める' }],
    }),
  ];
}
