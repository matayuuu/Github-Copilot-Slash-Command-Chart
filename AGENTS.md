# Repository guide

## 目的

GitHub Copilotの公式資料で確認したスラッシュコマンドを、日本語で検索できる非公式カタログです。
HTML/CSS、TypeScript、Viteで静的サイトを構築し、GitHub Pagesへ公開します。
Copilot、shell、外部APIをブラウザーから実行するアプリではありません。

## 構成

- `src/data/`: コマンド、利用環境、公式出典の正本。
- `src/catalog/`: データ契約、検索、URL状態、整合性検査。DOMに依存しません。
- `src/ui/`、`src/main.ts`、`src/styles.css`: 表示とブラウザー操作。
- `tests/unit/`、`tests/e2e/`: データ・検索と実際のブラウザー操作の検証。
- `.github/instructions/`: TypeScript・テスト・GitHub Actionsのパス別規約。テストの実体や実行設定とは分けます。
- `.github/workflows/ci-pages.yml`: 検証とPages公開。デプロイの権限は専用jobに限定します。
- `dist/`: ビルド生成物。編集・コミットしません。

## 作業の入口

開発環境、実行・検証コマンド、データ更新手順は`README.md`を参照してください。
コマンドはリポジトリルートで実行します。依存はnpmと`package-lock.json`で管理します。
共通の変更規則は`.github/copilot-instructions.md`、対象別の規約は`.github/instructions/`を参照してください。
規約の案内とツールが実行する設定の役割は、READMEの「開発規約と配置」で区別しています。

## 特有の注意

同名のコマンドを異なる環境間で統合しません。aliasとサブコマンドは親レコードに保持します。
資料で未確認の機能を「未対応」と断定せず、確認日をリリース日として表示しません。
Pagesのproject site用サブパスを維持し、共有URLはqueryを使います。
コミット、push、main反映、GitHubの設定変更、初回公開は実装承認とは分けて確認します。
