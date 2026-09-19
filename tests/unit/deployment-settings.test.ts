import { describe, expect, it } from 'vitest';
import { readDeploymentSettings } from '../deployment/settings';

const site = 'https://matayuuu.github.io/Github-Copilot-Slash-Command-Chart/';
const revision = 'a'.repeat(40);

describe('readDeploymentSettings', () => {
  it.each([
    undefined,
    '',
    'not-a-url',
    'http://127.0.0.1:4173/Github-Copilot-Slash-Command-Chart/',
    site.replace('https:', 'http:'),
    site.replace('matayuuu.github.io', 'example.com'),
    site.replace('https://', 'https://user:password@'),
    `${site}?preview=true`,
    `${site}#preview`,
    'https://matayuuu.github.io/',
  ])('rejects a missing or unexpected deployment target %j', (url) => {
    expect(() => readDeploymentSettings(url, revision)).toThrow('DEPLOYMENT_URL');
  });

  it.each([undefined, '', 'local', 'main', '511b2d2', 'x'.repeat(40)])(
    'rejects a missing or malformed expected revision %j',
    (value) => {
      expect(() => readDeploymentSettings(site, value)).toThrow('EXPECTED_REVISION');
    },
  );

  it('accepts only the public site and a full expected commit', () => {
    expect(readDeploymentSettings(site, revision.toUpperCase())).toEqual({
      baseURL: site,
      revision,
    });
  });
});
