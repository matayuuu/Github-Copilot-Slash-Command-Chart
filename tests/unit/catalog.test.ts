import { describe, expect, it } from 'vitest';
import { filterCommands } from '../../src/catalog/search';
import { environmentIds } from '../../src/catalog/types';
import { initialState } from '../../src/catalog/url-state';
import { validateCatalog } from '../../src/catalog/validate';
import { commands, environments, sources } from '../../src/data';

describe('the complete shipped catalog', () => {
  it('scans every command, environment and source after the broken-fixture validation checks', () => {
    const errors = validateCatalog({ commands, environments, sources });
    const byKind = {
      command: commands.filter((command) => command.kind === 'command').length,
      builtinSkill: commands.filter((command) => command.kind === 'builtin-skill').length,
    };
    const coverage = {
      documented: environments.filter((environment) => environment.coverage === 'documented')
        .length,
      unverified: environments.filter((environment) => environment.coverage === 'unverified')
        .length,
    };
    console.info(
      `Full catalog scan: ${commands.length} commands ` +
        `(command=${byKind.command}, builtin-skill=${byKind.builtinSkill}), ` +
        `${environments.length} environments ` +
        `(documented=${coverage.documented}, unverified=${coverage.unverified}), ` +
        `${sources.length} official source records; ${errors.length} validation errors.`,
    );
    expect(commands.length).toBeGreaterThan(0);
    expect(environments.map((environment) => environment.id).sort()).toEqual(
      [...environmentIds].sort(),
    );
    expect(sources.length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    expect(filterCommands(commands, initialState)).toHaveLength(commands.length);
    expect(byKind.command + byKind.builtinSkill).toBe(commands.length);
  });
});
