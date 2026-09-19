import { defineConfig } from 'vite';

export function readBuildRevision(value: string | undefined): string {
  if (value === undefined) return 'local';
  if (!/^[a-f\d]{40}$/iu.test(value)) {
    throw new Error('GITHUB_SHA must be a full 40-character commit SHA.');
  }
  return value.toLowerCase();
}

const revision = readBuildRevision(process.env.GITHUB_SHA);

export default defineConfig({
  base: '/Github-Copilot-Slash-Command-Chart/',
  plugins: [
    {
      name: 'build-revision',
      transformIndexHtml() {
        return [
          {
            tag: 'meta',
            attrs: { name: 'build-revision', content: revision },
            injectTo: 'head',
          },
        ];
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'build-info.json',
          source: `${JSON.stringify({ revision })}\n`,
        });
      },
    },
  ],
});
