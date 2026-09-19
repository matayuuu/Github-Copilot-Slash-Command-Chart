export const environmentIds = [
  'vscode',
  'visual-studio',
  'jetbrains',
  'xcode',
  'github-web',
  'cli',
  'copilot-app',
  'eclipse',
  'mobile',
] as const;

export type EnvironmentId = (typeof environmentIds)[number];

export const categories = [
  { id: 'coding', label: 'コード作成・改善' },
  { id: 'testing', label: 'テスト・レビュー' },
  { id: 'documentation', label: '説明・ドキュメント' },
  { id: 'session', label: '会話・セッション' },
  { id: 'context', label: 'コンテキスト' },
  { id: 'agents', label: 'エージェント・スキル' },
  { id: 'settings', label: '設定・ツール' },
  { id: 'collaboration', label: '共有・連携' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export interface CommandExample {
  prompt: string;
  description: string;
}

export interface Subcommand {
  syntax: string;
  description: string;
}

export interface CommandRecord {
  id: string;
  environmentId: EnvironmentId;
  sessionKind: string;
  command: string;
  syntax: string;
  aliases: string[];
  subcommands: Subcommand[];
  summary: string;
  categoryId: CategoryId;
  examples: CommandExample[];
  conditions: string[];
  warnings: string[];
  kind: 'command' | 'builtin-skill';
  status?: 'experimental' | 'preview' | 'deprecated';
  sourceIds: string[];
  lastVerified: string;
}

export interface EnvironmentRecord {
  id: EnvironmentId;
  name: string;
  shortName: string;
  coverage: 'documented' | 'unverified';
  note: string;
  sourceIds: string[];
}

export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  section: string;
  checkedAt: string;
}

export interface CatalogState {
  query: string;
  environment: EnvironmentId | 'all';
  category: CategoryId | 'all';
  selectedId: string | null;
}
