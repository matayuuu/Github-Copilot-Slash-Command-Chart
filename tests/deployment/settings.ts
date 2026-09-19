const publicSite = 'https://matayuuu.github.io/Github-Copilot-Slash-Command-Chart/';

export function readDeploymentSettings(
  url: string | undefined,
  revision: string | undefined,
): { baseURL: string; revision: string } {
  if (!url || !URL.canParse(url) || new URL(url).href !== publicSite) {
    throw new Error('DEPLOYMENT_URL must be the canonical public HTTPS Pages URL.');
  }
  if (!revision || !/^[a-f\d]{40}$/iu.test(revision)) {
    throw new Error('EXPECTED_REVISION must be the full commit SHA being deployed.');
  }
  return { baseURL: publicSite, revision: revision.toLowerCase() };
}
