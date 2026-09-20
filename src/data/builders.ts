import type { CategoryId, CommandRecord, EnvironmentId, Subcommand } from '../catalog/types';

export const checkedAt = '2026-09-19';

type CommandDetails = Partial<
  Pick<
    CommandRecord,
    | 'sessionKind'
    | 'syntax'
    | 'aliases'
    | 'subcommands'
    | 'examples'
    | 'conditions'
    | 'warnings'
    | 'kind'
    | 'status'
    | 'sourceIds'
    | 'lastVerified'
  >
>;

export function commandBuilder(
  environmentId: EnvironmentId,
  sessionKind: string,
  sourceIds: string[],
) {
  return (
    command: string,
    summary: string,
    categoryId: CategoryId,
    prompt: string,
    description: string,
    details: CommandDetails = {},
  ): CommandRecord => ({
    id: `${environmentId}-${command.slice(1).toLowerCase()}`,
    environmentId,
    sessionKind,
    command,
    syntax: command,
    aliases: [],
    subcommands: [],
    summary,
    categoryId,
    examples: [{ prompt, description }],
    conditions: [],
    warnings: [],
    kind: 'command',
    sourceIds,
    lastVerified: checkedAt,
    ...details,
  });
}

export function subcommands(entries: [syntax: string, description: string][]): Subcommand[] {
  return entries.map(([syntax, description]) => ({ syntax, description }));
}
