import type { CatalogState, CommandRecord } from './types';

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .trim()
    .split(/\s+/u)
    .map((word) => word.replace(/^\/+/u, ''))
    .join(' ');
}

function searchableText(command: CommandRecord): string {
  return normalizeSearch(
    [
      command.command,
      command.syntax,
      ...command.aliases,
      ...command.subcommands.flatMap((item) => [item.syntax, item.description]),
      command.summary,
      command.environmentId,
      command.sessionKind,
      ...command.conditions,
      ...command.examples.flatMap((item) => [item.prompt, item.description]),
    ].join(' '),
  );
}

export function filterCommands(
  commands: readonly CommandRecord[],
  state: Pick<CatalogState, 'query' | 'environment' | 'category'>,
): CommandRecord[] {
  const query = normalizeSearch(state.query);
  const terms = query.split(' ').filter(Boolean);
  const rank = (command: CommandRecord): number => {
    const names = [command.command, ...command.aliases].map(normalizeSearch);
    if (names.includes(query)) return 0;
    if (names.some((name) => name.startsWith(query))) return 1;
    return 2;
  };

  return commands
    .filter(
      (command) =>
        (state.environment === 'all' || command.environmentId === state.environment) &&
        (state.category === 'all' || command.categoryId === state.category) &&
        terms.every((term) => searchableText(command).includes(term)),
    )
    .sort(
      (a, b) =>
        (query ? rank(a) - rank(b) : 0) ||
        a.command.localeCompare(b.command, 'en') ||
        a.environmentId.localeCompare(b.environmentId, 'en') ||
        a.id.localeCompare(b.id, 'en'),
    );
}
