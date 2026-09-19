import type { CommandRecord, EnvironmentRecord, SourceRecord } from '../catalog/types';
import { element, externalLink } from './dom';

export function renderSources(
  container: HTMLElement,
  environments: readonly EnvironmentRecord[],
  sources: readonly SourceRecord[],
  commands: readonly CommandRecord[],
): void {
  const introduction = element(
    'p',
    'dialog-intro',
    '公式資料に掲載されたコマンドを日本語で要約しています。全機能の実機検証や、すべての環境・版の網羅を保証するものではありません。確認日はリリース日ではなく、資料を確認した日です。',
  );
  const coverage = element('div', 'coverage-list');
  for (const environment of environments) {
    const count = commands.filter((command) => command.environmentId === environment.id).length;
    const item = element('section', 'coverage-item');
    const heading = element('div', 'section-label');
    heading.append(
      element('h3', '', environment.name),
      element(
        'span',
        environment.coverage === 'documented' ? 'coverage-yes' : 'coverage-pending',
        count ? `${count} 項目` : '一覧未確認',
      ),
    );
    item.append(heading, element('p', '', environment.note));
    for (const source of sources.filter((source) => environment.sourceIds.includes(source.id))) {
      item.append(externalLink(`${source.title} ↗`, source.url));
    }
    coverage.append(item);
  }
  const references = element('section', 'reference-list');
  references.append(element('h3', '', '参照資料と確認日'));
  for (const source of sources) {
    const item = element('div', 'reference-item');
    item.append(
      externalLink(`${source.title} ↗`, source.url),
      element('p', '', `${source.section} · ${source.checkedAt}`),
    );
    references.append(item);
  }
  container.replaceChildren(
    introduction,
    coverage,
    references,
    element(
      'p',
      'catalog-disclaimer',
      '個人・組織のカスタムコマンド、任意のスキル名、@参加者、#コンテキスト参照は掲載項目数に含めません。aliasとサブコマンドは親コマンドにまとめています。更新は手動で行います。GitHubまたはMicrosoftが運営・承認するサービスではありません。',
    ),
  );
}
