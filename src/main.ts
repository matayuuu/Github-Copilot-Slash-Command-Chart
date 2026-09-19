import './styles.css';
import { filterCommands } from './catalog/search';
import { categories } from './catalog/types';
import type { CatalogState, CommandRecord } from './catalog/types';
import { createStateUrl, initialState, parseUrlState } from './catalog/url-state';
import { validateCatalog } from './catalog/validate';
import { commands, environments, sources } from './data';
import { renderDetail } from './ui/detail';
import { button, element, requireElement } from './ui/dom';
import { renderSources } from './ui/sources';

const problems = validateCatalog({ commands, environments, sources });
if (problems.length) {
  const app = requireElement('#app');
  const message = element('section', 'fatal-error');
  message.append(
    element('h1', '', 'カタログを読み込めませんでした'),
    element(
      'p',
      '',
      'データの整合性に問題があります。時間をおいて再読み込みするか、リポジトリへお知らせください。',
    ),
  );
  app.replaceChildren(message);
  throw new Error(`Catalog validation failed:\n${problems.join('\n')}`);
}

const search = requireElement<HTMLInputElement>('#search');
const categoryFilter = requireElement<HTMLSelectElement>('#category-filter');
const environmentFilters = requireElement('#environment-filters');
const commandList = requireElement('#command-list');
const emptyState = requireElement('#empty-state');
const resultCount = requireElement('#result-count');
const resetFilters = requireElement<HTMLButtonElement>('#reset-filters');
const detail = requireElement('#detail-pane');
const urlNotice = requireElement('#url-notice');
const sourcesDialog = requireElement<HTMLDialogElement>('#sources-dialog');
const copyDialog = requireElement<HTMLDialogElement>('#copy-dialog');
const copyText = requireElement<HTMLTextAreaElement>('#copy-text');
const toast = requireElement('#toast');
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let state: CatalogState = { ...initialState };

function notify(message: string): void {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

async function copy(text: string, label: string): Promise<void> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    notify(`${label}をコピーしました`);
  } catch {
    notify(`${label}の自動コピーができませんでした`);
    copyText.value = text;
    if (!copyDialog.open) copyDialog.showModal();
    copyText.focus();
    copyText.select();
  }
}

function saveUrl(mode: 'push' | 'replace'): void {
  const next = createStateUrl(new URL(location.href), state);
  if (next.href === location.href) return;
  if (mode === 'push') history.pushState(null, '', next);
  else history.replaceState(null, '', next);
}

function updateDetail(focus = false): void {
  const selected = commands.find((command) => command.id === state.selectedId) ?? null;
  renderDetail(detail, selected, environments, sources, {
    copy: (text, label) => {
      void copy(text, label);
    },
    close: () => {
      const previous = state.selectedId;
      state = { ...state, selectedId: null };
      saveUrl('push');
      updateDetail();
      if (previous) {
        commandList
          .querySelector<HTMLButtonElement>(`[data-command-id="${CSS.escape(previous)}"]`)
          ?.focus();
      }
    },
    explore: (query) => {
      changeFilters({ query, environment: 'all', category: 'all' });
      search.focus();
    },
    share: () => {
      void copy(createStateUrl(new URL(location.href), state).href, '検索URL');
    },
  });
  commandList.querySelectorAll<HTMLButtonElement>('.command-row').forEach((row) => {
    row.setAttribute('aria-pressed', String(row.dataset.commandId === state.selectedId));
  });
  if (focus && selected) {
    requireElement('#detail-title').focus({ preventScroll: true });
    if (matchMedia('(max-width: 1100px)').matches) {
      detail.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
}

function selectCommand(command: CommandRecord): void {
  state = { ...state, selectedId: command.id };
  saveUrl('push');
  updateDetail(true);
}

function renderResults(): void {
  const filtered = filterCommands(commands, state);
  search.value = state.query;
  categoryFilter.value = state.category;
  const environment = environments.find((item) => item.id === state.environment);
  requireElement('#results-title').textContent = environment?.name ?? 'すべてのコマンド';
  resultCount.textContent = `${filtered.length} 件`;
  resetFilters.hidden = !state.query && state.environment === 'all' && state.category === 'all';
  environmentFilters.querySelectorAll<HTMLButtonElement>('[data-environment]').forEach((item) => {
    item.setAttribute('aria-pressed', String(item.dataset.environment === state.environment));
  });

  const fragment = document.createDocumentFragment();
  for (const command of filtered) {
    const environment = environments.find((item) => item.id === command.environmentId);
    if (!environment) throw new Error(`Unknown environment: ${command.environmentId}`);
    const row = button('', 'command-row', () => selectCommand(command));
    row.dataset.commandId = command.id;
    row.setAttribute('aria-pressed', String(command.id === state.selectedId));
    row.setAttribute('aria-controls', 'detail-pane');
    const content = element('span', 'command-content');
    const commandTitle = element('span', 'command-title');
    commandTitle.append(element('code', '', command.command));
    if (command.kind === 'builtin-skill')
      commandTitle.append(element('span', 'kind-marker', 'skill'));
    if (command.status) commandTitle.append(element('span', 'preview-marker', command.status));
    content.append(commandTitle, element('span', 'command-summary', command.summary));
    const end = element('span', 'command-end');
    const badge = element('span', 'environment-badge', environment.shortName);
    badge.dataset.environment = environment.id;
    end.append(badge, element('span', 'row-arrow', '↗'));
    end.lastElementChild?.setAttribute('aria-hidden', 'true');
    row.append(content, end);
    const item = element('li');
    item.append(row);
    fragment.append(item);
  }
  commandList.replaceChildren(fragment);
  emptyState.hidden = filtered.length !== 0;
  if (!filtered.length) {
    emptyState.replaceChildren(
      element('span', 'empty-symbol', '/?'),
      element(
        'h3',
        '',
        environment?.coverage === 'unverified'
          ? 'この環境の一覧は確認中です'
          : '一致するコマンドがありません',
      ),
      element(
        'p',
        '',
        environment?.coverage === 'unverified'
          ? environment.note
          : '別のキーワードを試すか、環境や用途の絞り込みを解除してください。',
      ),
      button('すべてのコマンドを見る', 'primary-button', clearFilters),
    );
  }
  updateDetail();
}

function changeFilters(
  patch: Partial<Pick<CatalogState, 'query' | 'environment' | 'category'>>,
  mode: 'push' | 'replace' = 'push',
): void {
  state = { ...state, ...patch, selectedId: null };
  urlNotice.hidden = true;
  saveUrl(mode);
  renderResults();
  requireElement('#results-scroll').scrollTop = 0;
}

function clearFilters(): void {
  changeFilters({ query: '', environment: 'all', category: 'all' });
  search.focus();
}

function readLocation(): void {
  const parsed = parseUrlState(new URL(location.href), commands);
  state = parsed.state;
  urlNotice.textContent = parsed.warnings.join(' ');
  urlNotice.hidden = parsed.warnings.length === 0;
  if (parsed.warnings.length) saveUrl('replace');
  renderResults();
}

const all = button('', 'filter-button', () => changeFilters({ environment: 'all' }));
all.dataset.environment = 'all';
all.append(
  element('span', 'environment-icon', '⊞'),
  element('span', 'filter-name', 'すべての環境'),
  element('span', 'filter-count', String(commands.length)),
);
environmentFilters.append(all, element('div', 'filter-divider'));
for (const environment of environments) {
  const count = commands.filter((command) => command.environmentId === environment.id).length;
  const filter = button('', 'filter-button', () => changeFilters({ environment: environment.id }));
  filter.dataset.environment = environment.id;
  const glyphs = {
    vscode: 'V',
    'visual-studio': 'VS',
    jetbrains: 'JB',
    xcode: 'X',
    'github-web': 'GH',
    cli: '>_',
    'copilot-app': '/_',
    eclipse: 'E',
    mobile: 'M',
  };
  const icon = element('span', 'environment-icon', glyphs[environment.id]);
  icon.setAttribute('aria-hidden', 'true');
  filter.append(
    icon,
    element('span', 'filter-name', environment.name),
    element('span', 'filter-count', count ? String(count) : '未確認'),
  );
  environmentFilters.append(filter);
}
for (const category of categories) {
  const option = element('option', '', category.label);
  option.value = category.id;
  categoryFilter.append(option);
}

const documentedCount = environments.filter(
  (environment) => environment.coverage === 'documented',
).length;
requireElement('#environment-total').textContent =
  `${documentedCount} + ${environments.length - documentedCount}`;
requireElement('#environment-total').setAttribute(
  'aria-label',
  `${documentedCount}環境の一覧を確認、${environments.length - documentedCount}環境は未確認`,
);
requireElement('#catalog-total').textContent =
  `${commands.length} 環境別掲載項目 · ${documentedCount} 環境`;
const dates = [...new Set(commands.map((command) => command.lastVerified))].sort();
requireElement('#verified-date').textContent =
  dates.length === 1 ? (dates[0] ?? '') : `${dates[0]} – ${dates.at(-1)}`;

search.addEventListener('input', (event) => {
  if (event instanceof InputEvent && event.isComposing) return;
  changeFilters({ query: search.value }, 'replace');
});
search.addEventListener('compositionend', () => changeFilters({ query: search.value }, 'replace'));
categoryFilter.addEventListener('change', () => {
  const category = categories.find((item) => item.id === categoryFilter.value)?.id ?? 'all';
  changeFilters({ category });
});
resetFilters.addEventListener('click', clearFilters);
document.querySelectorAll<HTMLButtonElement>('[data-query]').forEach((item) => {
  item.addEventListener('click', () => {
    changeFilters({ query: item.dataset.query ?? '', environment: 'all', category: 'all' });
    search.focus();
  });
});
window.addEventListener('popstate', readLocation);
document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (
    event.key === '/' &&
    !event.isComposing &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !sourcesDialog.open &&
    !copyDialog.open &&
    !(
      target instanceof HTMLElement &&
      (target.matches('input, textarea, select') || target.isContentEditable)
    )
  ) {
    event.preventDefault();
    search.focus();
  }
});

renderSources(requireElement('#sources-content'), environments, sources, commands);
requireElement('#sources-open').addEventListener('click', () => sourcesDialog.showModal());
requireElement('#sources-close').addEventListener('click', () => sourcesDialog.close());
requireElement('#copy-close').addEventListener('click', () => copyDialog.close());

const darkPreference = matchMedia('(prefers-color-scheme: dark)');
let themeChanged = false;
function applyTheme(dark: boolean): void {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  requireElement('#theme-label').textContent = dark ? 'ダーク' : 'ライト';
  requireElement('#theme-toggle').setAttribute(
    'aria-label',
    `${dark ? 'ライト' : 'ダーク'}テーマに切り替える`,
  );
}
applyTheme(darkPreference.matches);
requireElement('#theme-toggle').addEventListener('click', () => {
  themeChanged = true;
  applyTheme(document.documentElement.dataset.theme !== 'dark');
});
darkPreference.addEventListener('change', (event) => {
  if (!themeChanged) applyTheme(event.matches);
});
readLocation();
