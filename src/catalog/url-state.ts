import { filterCommands } from './search';
import { categories, environmentIds } from './types';
import type { CatalogState, CommandRecord } from './types';

export const initialState: CatalogState = {
  query: '',
  environment: 'all',
  category: 'all',
  selectedId: null,
};

export function parseUrlState(
  url: URL,
  commands: readonly CommandRecord[],
): { state: CatalogState; warnings: string[] } {
  const params = url.searchParams;
  const warnings: string[] = [];
  const rawEnvironment = params.get('env');
  const rawCategory = params.get('category');
  const rawCommand = params.get('command');
  const environment = environmentIds.find((id) => id === rawEnvironment) ?? 'all';
  const category = categories.find((item) => item.id === rawCategory)?.id ?? 'all';

  if (rawEnvironment && rawEnvironment !== 'all' && environment === 'all') {
    warnings.push('URLの環境指定を確認できないため、すべての環境を表示しています。');
  }
  if (rawCategory && rawCategory !== 'all' && category === 'all') {
    warnings.push('URLの用途指定を確認できないため、すべての用途を表示しています。');
  }
  for (const key of ['q', 'env', 'category', 'command']) {
    if (params.getAll(key).length > 1) {
      warnings.push(`URLの「${key}」が重複しているため、最初の値を使用しています。`);
    }
  }

  const state: CatalogState = {
    query: params.get('q') ?? '',
    environment,
    category,
    selectedId: rawCommand,
  };
  if (rawCommand && !filterCommands(commands, state).some((command) => command.id === rawCommand)) {
    warnings.push('指定されたコマンドが現在の検索結果にないため、選択を解除しました。');
    state.selectedId = null;
  }

  return { state, warnings };
}

export function createStateUrl(base: URL, state: CatalogState): URL {
  const url = new URL(base);
  for (const key of ['q', 'env', 'category', 'command']) url.searchParams.delete(key);
  if (state.query) url.searchParams.set('q', state.query);
  if (state.environment !== 'all') url.searchParams.set('env', state.environment);
  if (state.category !== 'all') url.searchParams.set('category', state.category);
  if (state.selectedId) url.searchParams.set('command', state.selectedId);
  return url;
}
