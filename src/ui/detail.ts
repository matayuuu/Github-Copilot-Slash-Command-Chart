import { categories } from '../catalog/types';
import type { CommandRecord, EnvironmentRecord, SourceRecord } from '../catalog/types';
import { button, element, externalLink } from './dom';

interface DetailActions {
  copy: (text: string, label: string) => void;
  close: () => void;
  explore: (query: string) => void;
  share: () => void;
}

function textList(title: string, values: readonly string[], className = ''): HTMLElement | null {
  if (!values.length) return null;
  const section = element('section', `detail-section ${className}`);
  section.append(element('h3', '', title));
  const list = element('ul');
  for (const value of values) list.append(element('li', '', value));
  section.append(list);
  return section;
}

export function renderDetail(
  container: HTMLElement,
  command: CommandRecord | null,
  environments: readonly EnvironmentRecord[],
  sources: readonly SourceRecord[],
  actions: DetailActions,
): void {
  container.replaceChildren();
  if (!command) {
    const welcome = element('div', 'detail-welcome');
    welcome.append(
      element('div', 'welcome-graphic', '/'),
      element('span', 'eyebrow', 'SMALL COMMAND. BIG POSSIBILITIES.'),
      element('h2', '', 'できることを、\nひとつずつ。'),
      element('p', '', '気になるコマンドを選ぶと、使い方や環境ごとの条件をここで確認できます。'),
    );
    const suggestions = element('div', 'welcome-suggestions');
    for (const [name, description] of [
      ['explain', 'コードの意味を知りたい'],
      ['tests', 'テストを書きたい'],
      ['plan', '実装の前に整理したい'],
    ]) {
      if (!name || !description) continue;
      const suggestion = button('', 'suggestion-button', () => actions.explore(name));
      suggestion.append(element('span', '', description), element('code', '', `/${name} ↗`));
      suggestions.append(suggestion);
    }
    welcome.append(
      suggestions,
      element('p', 'welcome-footnote', '調べる場所です。コマンドは実行されません。'),
    );
    container.append(welcome);
    return;
  }

  const environment = environments.find((item) => item.id === command.environmentId);
  if (!environment) throw new Error(`Unknown environment: ${command.environmentId}`);
  const header = element('div', 'detail-header');
  header.append(
    element('span', 'eyebrow', 'COMMAND REFERENCE'),
    button('✕', 'icon-button close-detail', actions.close),
  );
  header.querySelector('button')?.setAttribute('aria-label', '詳細を閉じる');
  const title = element('h2', 'detail-title', command.command);
  title.id = 'detail-title';
  title.tabIndex = -1;
  const badges = element('div', 'detail-badges');
  const environmentBadge = element('span', 'environment-badge', environment.name);
  environmentBadge.dataset.environment = environment.id;
  badges.append(
    environmentBadge,
    element(
      'span',
      'subtle-badge',
      categories.find((item) => item.id === command.categoryId)?.label,
    ),
  );
  if (command.kind === 'builtin-skill')
    badges.append(element('span', 'subtle-badge', '公式組み込みスキル'));
  if (command.status) {
    badges.append(
      element(
        'span',
        'status-badge',
        { experimental: 'Experimental', preview: 'Preview', deprecated: '非推奨' }[command.status],
      ),
    );
  }
  container.append(header, title, badges, element('p', 'detail-summary', command.summary));

  const syntax = element('section', 'syntax-block');
  const syntaxHeader = element('div', 'code-header');
  syntaxHeader.append(
    element('span', '', 'SYNTAX'),
    button('コピー', 'copy-button', () => actions.copy(command.syntax, 'コマンド')),
  );
  syntaxHeader.querySelector('button')?.setAttribute('aria-label', 'コマンドをコピー');
  syntax.append(syntaxHeader, element('code', '', command.syntax));
  container.append(syntax);

  if (command.aliases.length) {
    const aliases = element('div', 'aliases');
    aliases.append(element('span', '', '別名'));
    for (const alias of command.aliases) aliases.append(element('code', '', alias));
    container.append(aliases);
  }

  const context = element('div', 'context-caption');
  context.append(element('span', 'context-dot', '●'), element('span', '', command.sessionKind));
  container.append(context);
  const conditions = textList('利用条件', command.conditions);
  const warnings = textList('使う前に確認', command.warnings, 'warning-section');
  if (conditions) container.append(conditions);
  if (warnings) container.append(warnings);

  const examples = element('section', 'detail-section');
  const examplesTitle = element('div', 'section-label');
  examplesTitle.append(element('h3', '', '使い方の例'), element('span', 'muted', '本カタログ作成'));
  examples.append(examplesTitle);
  for (const example of command.examples) {
    const exampleBox = element('div', 'example-box');
    const exampleHeader = element('div', 'code-header');
    const copy = button('コピー', 'copy-button', () => actions.copy(example.prompt, '使用例'));
    copy.setAttribute('aria-label', '使用例をコピー');
    exampleHeader.append(element('span', '', example.description), copy);
    exampleBox.append(exampleHeader, element('code', '', example.prompt));
    examples.append(exampleBox);
  }
  container.append(examples);

  if (command.subcommands.length) {
    const section = element('section', 'detail-section');
    section.append(element('h3', '', 'サブコマンド'));
    const list = element('dl', 'subcommand-list');
    for (const subcommand of command.subcommands) {
      const term = element('dt');
      term.append(element('code', '', subcommand.syntax));
      list.append(term, element('dd', '', subcommand.description));
    }
    section.append(list);
    container.append(section);
  }

  const provenance = element('section', 'detail-section provenance');
  provenance.append(element('h3', '', '公式資料'));
  for (const source of sources.filter((item) => command.sourceIds.includes(item.id))) {
    provenance.append(
      externalLink(`${source.title} ↗`, source.url),
      element('span', 'source-section', source.section),
    );
  }
  const date = element('time', '', command.lastVerified);
  date.dateTime = command.lastVerified;
  const checked = element('p', 'checked-date', '資料確認日 ');
  checked.append(date);
  provenance.append(
    checked,
    element('p', 'source-caveat', '利用できる候補は製品の版・設定・会話の状況によって変わります。'),
  );
  container.append(provenance, button('検索URLをコピー', 'share-button', actions.share));
}
