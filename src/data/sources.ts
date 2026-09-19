import type { SourceRecord } from '../catalog/types';
import { checkedAt } from './builders';

const cheatSheet = 'https://docs.github.com/en/copilot/reference/chat-cheat-sheet';

export const sources: SourceRecord[] = [
  {
    id: 'vscode-ai-reference',
    title: 'VS Code — AI features cheat sheet',
    url: 'https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet',
    section: 'Slash commands',
    checkedAt,
  },
  {
    id: 'github-chat-vscode',
    title: 'GitHub Copilot Chat cheat sheet — Visual Studio Code',
    url: cheatSheet,
    section: 'Visual Studio Code タブ / Slash commands',
    checkedAt,
  },
  {
    id: 'github-chat-visual-studio',
    title: 'GitHub Copilot Chat cheat sheet — Visual Studio',
    url: cheatSheet,
    section: 'Visual Studio タブ / Slash commands',
    checkedAt,
  },
  {
    id: 'github-chat-jetbrains',
    title: 'GitHub Copilot Chat cheat sheet — JetBrains',
    url: cheatSheet,
    section: 'JetBrains タブ / Slash commands（CLIセッションの注記を含む）',
    checkedAt,
  },
  {
    id: 'github-chat-xcode',
    title: 'GitHub Copilot Chat cheat sheet — Xcode',
    url: cheatSheet,
    section: 'Xcode タブ / Slash commands',
    checkedAt,
  },
  {
    id: 'github-chat-web',
    title: 'GitHub Copilot Chat cheat sheet — GitHub website',
    url: cheatSheet,
    section: 'GitHub website タブ / Slash commands',
    checkedAt,
  },
  {
    id: 'cli-command-reference',
    title: 'GitHub Copilot CLI command reference',
    url: 'https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference',
    section: 'Slash commands in the interactive interface（公式ソースの同節で表の内容を照合）',
    checkedAt,
  },
  {
    id: 'cli-command-source',
    title: 'GitHub Copilot CLI command reference（公式文書のソース）',
    url: 'https://raw.githubusercontent.com/github/docs/main/content/copilot/reference/copilot-cli-reference/cli-command-reference.md',
    section: 'Slash commands in the interactive interface（表全体と直後の注記）',
    checkedAt,
  },
  {
    id: 'cli-chronicle-guide',
    title: 'Using GitHub Copilot CLI session data',
    url: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle',
    section: 'Sharing a session / Using the /chronicle slash command',
    checkedAt,
  },
  {
    id: 'app-slash-reference',
    title: 'Slash commands for the GitHub Copilot app',
    url: 'https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands',
    section: 'Available slash commands',
    checkedAt,
  },
  {
    id: 'eclipse-readme',
    title: 'Microsoft — GitHub Copilot for Eclipse',
    url: 'https://github.com/microsoft/copilot-for-eclipse',
    section: 'README / Ask Mode・Agent Mode・Advanced Agentic Capabilities',
    checkedAt,
  },
  {
    id: 'eclipse-changelog',
    title: 'GitHub Copilot for Eclipse — CHANGELOG',
    url: 'https://github.com/microsoft/copilot-for-eclipse/blob/main/CHANGELOG.md',
    section: '0.3.0 / Added（slash commandsへの言及。個別の名前は未記載）',
    checkedAt,
  },
  {
    id: 'eclipse-feature-matrix',
    title: 'Copilot feature matrix — Eclipse',
    url: 'https://docs.github.com/en/copilot/reference/copilot-feature-matrix?tool=eclipse',
    section: 'Features by Eclipse version（個別のスラッシュコマンド表は未確認）',
    checkedAt,
  },
  {
    id: 'mobile-chat',
    title: 'Asking GitHub Copilot questions in GitHub Mobile',
    url: 'https://docs.github.com/en/copilot/how-tos/copilot-on-github/chat-with-copilot/chat-in-mobile',
    section: '通常の質問・リポジトリ・コードについての質問 / Extending Copilot Chat',
    checkedAt,
  },
  {
    id: 'cli-remote-control',
    title: 'About remote control of GitHub Copilot CLI sessions',
    url: 'https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-remote-control',
    section: 'Prerequisites / What you can do remotely / Security and privacy',
    checkedAt,
  },
  {
    id: 'gist-visibility',
    title: 'Creating gists',
    url: 'https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists',
    section: 'About gists / secret gistの閲覧範囲',
    checkedAt,
  },
];
