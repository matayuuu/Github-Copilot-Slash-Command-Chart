import type { CommandRecord } from '../catalog/types';
import { appCommands } from './app';
import { cliCommands } from './cli';
import { ideCommands } from './ide';

export { environments } from './environments';
export { sources } from './sources';

export const commands: CommandRecord[] = [...ideCommands, ...cliCommands, ...appCommands];
