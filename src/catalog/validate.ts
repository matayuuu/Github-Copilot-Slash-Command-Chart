import { categories, environmentIds } from './types';
import type { CommandRecord, EnvironmentRecord, SourceRecord } from './types';

interface Catalog {
  commands: readonly CommandRecord[];
  environments: readonly EnvironmentRecord[];
  sources: readonly SourceRecord[];
}

function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function isOfficialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (
      ['docs.github.com', 'code.visualstudio.com', 'learn.microsoft.com'].includes(url.hostname)
    ) {
      return true;
    }
    if (['github.com', 'raw.githubusercontent.com'].includes(url.hostname)) {
      return /^\/(github|microsoft|microsoftdocs)\//iu.test(url.pathname);
    }
    return false;
  } catch {
    return false;
  }
}

export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = [];
  const sourceIds = new Set(catalog.sources.map((source) => source.id));
  const environments = new Map(
    catalog.environments.map((environment) => [environment.id, environment]),
  );
  const seen = new Set<string>();

  if (!catalog.commands.length) errors.push('コマンドが0件です。');
  if (sourceIds.size !== catalog.sources.length) errors.push('出典IDが重複しています。');
  if (environments.size !== catalog.environments.length) errors.push('環境IDが重複しています。');
  for (const id of environmentIds) {
    if (!environments.has(id)) errors.push(`環境 ${id} の調査状態がありません。`);
  }
  for (const source of catalog.sources) {
    if (!source.id || !source.title || !source.section)
      errors.push(`出典 ${source.id}: 必須情報不足。`);
    if (!isOfficialUrl(source.url)) errors.push(`出典 ${source.id}: 公式HTTPS URLではありません。`);
    if (!validDate(source.checkedAt)) errors.push(`出典 ${source.id}: 確認日が不正です。`);
  }
  for (const environment of catalog.environments) {
    if (!environment.note || !environment.name || !environment.shortName) {
      errors.push(`環境 ${environment.id}: 説明が不足しています。`);
    }
    if (!environment.sourceIds.length || environment.sourceIds.some((id) => !sourceIds.has(id))) {
      errors.push(`環境 ${environment.id}: 出典参照が不正です。`);
    }
    const hasCommands = catalog.commands.some(
      (command) => command.environmentId === environment.id,
    );
    if ((environment.coverage === 'documented') !== hasCommands) {
      errors.push(`環境 ${environment.id}: 調査状態と掲載件数が一致しません。`);
    }
  }
  const canonical = new Set<string>();
  for (const command of catalog.commands) {
    const report = (message: string) => errors.push(`${command.id}: ${message}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(command.id)) report('IDの形式が不正です。');
    if (seen.has(command.id)) report('IDが重複しています。');
    seen.add(command.id);
    if (!environments.has(command.environmentId)) report('利用環境がありません。');
    if (!categories.some((category) => category.id === command.categoryId))
      report('用途が不正です。');
    if (!/^\/[a-zA-Z][a-zA-Z0-9-]*$/u.test(command.command)) report('slash表記が不正です。');
    if (!command.syntax.includes(command.command)) report('構文にコマンド名がありません。');
    if (!command.summary.trim() || !command.sessionKind.trim())
      report('用途・実行文脈が不足しています。');
    if (!command.sourceIds.length || command.sourceIds.some((id) => !sourceIds.has(id))) {
      report('出典参照が不正です。');
    }
    if (!validDate(command.lastVerified)) report('確認日が不正です。');
    if (
      !command.examples.length ||
      command.examples.some((example) => !example.prompt.trim() || !example.description.trim())
    ) {
      report('使用例が不足しています。');
    }
    if (new Set(command.aliases).size !== command.aliases.length) report('aliasが重複しています。');
    for (const alias of command.aliases) {
      if (!/^\/[a-zA-Z][a-zA-Z0-9-]*$/u.test(alias) || alias === command.command) {
        report('aliasが不正です。');
      }
    }
    const key = `${command.environmentId}:${command.sessionKind}:${command.command}`;
    if (canonical.has(key)) report('同一文脈のコマンドが重複しています。');
    canonical.add(key);
    for (const child of command.subcommands) {
      const hasKnownPrefix = [command.command, ...command.aliases].some((name) =>
        child.syntax.startsWith(`${name} `),
      );
      if (!hasKnownPrefix || !child.description.trim()) {
        report('サブコマンドの構文・説明が不正です。');
      }
    }
  }
  return errors;
}
