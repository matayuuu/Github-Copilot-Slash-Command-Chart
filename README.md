# GitHub Copilot Slash Command Chart

GitHub Copilotのスラッシュコマンドを、日本語で検索できる非公式のWebカタログです。同じコマンド名でも、利用環境ごとに説明・構文・条件を分けて掲載します。

環境・用途での絞り込み、使用例と構文のコピー、公式資料へのリンク、検索URLの共有、ライト／ダーク表示に対応します。ブラウザーだけで利用でき、カタログの閲覧にGitHubへのログインやCopilot契約は必要ありません。Copilotやshellコマンドを実行する機能はありません。

公開サイト: <https://matayuuu.github.io/Github-Copilot-Slash-Command-Chart/>

## 掲載情報について

公式資料で確認できた項目を静的データとして同梱しています。閲覧時に最新情報を自動取得するものではなく、全環境・全バージョンの網羅も保証しません。「収録範囲・出典」から調査状態と公式資料を、各コマンドの詳細から利用条件と資料確認日を確認できます。日次の更新案作成は、後述のGitHub Actionsを設定・有効化した後に行います。

- VS Code、Visual Studio、JetBrains、Xcode、GitHub.com、Copilot CLI、GitHub Copilot appを環境別に扱います。
- EclipseやGitHub Mobileなど、一覧の根拠を確認できていない環境はその旨を表示します。「未確認」は「製品に機能がない」という意味ではありません。
- GitHub.comの通常Chatと、CLIのリモート操作は別です。公式資料は、リモートUIからのslash command利用を現在の制限として挙げています。
- 公式提供の組み込みスキルは種類を明示し、個人の任意のスキル名・prompt名、`@`参加者、`#`コンテキスト参照は掲載件数に含めません。aliasとサブコマンドは親項目にまとめます。
- 使用例は公式の構文に沿って本カタログで作成した例です。コピーして実際に使用する際は、対象製品の利用条件や副作用を確認してください。

参考: [GitHub Copilot Chat cheat sheet](https://docs.github.com/en/copilot/reference/chat-cheat-sheet)、[CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)、[CLI remote control](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-remote-control)。

## ローカルで実行する

Node.js 22系（22.12以上）とnpmを使用します。CIもNode.js 22系です。ほかの対応バージョンは`package.json`の`engines`を確認してください。以下は、このリポジトリを取得済みの状態で、リポジトリルートから実行するコマンドです。Windows PowerShellでも同じコマンドを使用できます。

```powershell
npm ci
npm run dev
```

起動したViteが表示するURLを開いてください。通常は `http://127.0.0.1:5173/Github-Copilot-Slash-Command-Chart/` です。ポートが使用中の場合は表示されたポートを使用します。

ビルド済みの静的サイトを確認する場合:

```powershell
npm run build
npm run preview
```

通常は `http://127.0.0.1:4173/Github-Copilot-Slash-Command-Chart/` を開きます。`vite preview`はローカル確認用です。本番では生成された`dist`をGitHub Pagesで配信します。`index.html`を`file://`で直接開く利用方法は対象外です。

参考: [Viteの静的サイト配信ガイド](https://vite.dev/guide/static-deploy)。

## 開発と検証

| コマンド                  | 内容                                                    |
| ------------------------- | ------------------------------------------------------- |
| `npm run typecheck`       | TypeScriptの型検査                                      |
| `npm run lint`            | ESLint                                                  |
| `npm run format:check`    | Prettierの書式検査                                      |
| `npm run format`          | 書式の更新                                              |
| `npm test`                | データ整合性、検索、URL状態の単体テスト                 |
| `npm run build`           | 型検査と本番用のビルド                                  |
| `npm run check`           | 型検査、lint、書式、単体テスト、ビルドを順に実行        |
| `npm run test:e2e`        | ビルド済みサイトを使うPlaywrightテスト                  |
| `npm run test:deployment` | 公開先のSHA・画面操作を確認するsmoke test（CDから実行） |

初回のブラウザーテスト前に、宣言済みPlaywrightのブラウザーを導入します。LinuxでOSライブラリも必要な場合は`--with-deps`を付けます。

```powershell
npx playwright install chromium firefox
npm run check
npm run test:e2e
```

E2Eは専用のpreviewプロセスをポート4173で起動します。別のpreviewが同じポートを使っている場合は、そのプロセスを終了してから実行してください。ChromiumとFirefox、モバイル相当のviewportで検証します。モバイル相当のブラウザーテストは実機検証ではありません。

公開後の検証は`playwright.deployment.config.ts`と`tests/deployment/`に分離しています。CDが`DEPLOYMENT_URL`と`EXPECTED_REVISION`を渡し、公開先のrevisionと主要操作を匿名で確認します。ローカルサーバーや認証付きURL、未指定のSHAへ成功した結果で公開確認を代用しない構成です。

## 開発規約と配置

AI向けの規約は`.github/instructions/`で対象ごとに管理します。`applyTo`は適用するファイルを絞るための指定です。規約を書くだけでコードが自動的に強制・検査されるわけではないため、型検査・ESLint・Prettier・テスト・CIも併用します。

Copilot CLIの既存セッションへ新しいInstructionsを反映する場合は、セッションの再開または新しいセッションの開始が必要です。ファイルが一覧に発見されることと、実行中のセッションへ反映されることは区別してください。

| 対象                             | 規約・実装の場所                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 全体に共通する変更方針           | [.github/copilot-instructions.md](.github/copilot-instructions.md)                                                     |
| TypeScriptの型安全性・コード規約 | [typescript.instructions.md](.github/instructions/typescript.instructions.md)                                          |
| テストの設計・実行方針           | [testing.instructions.md](.github/instructions/testing.instructions.md)                                                |
| CI/CDの権限・公開方針            | [github-actions.instructions.md](.github/instructions/github-actions.instructions.md)                                  |
| PR運用・公開の完了条件           | [pull-request-policy.md](.github/pull-request-policy.md)、[PRテンプレート](.github/PULL_REQUEST_TEMPLATE.md)           |
| テスト本体                       | `tests/unit/`、`tests/e2e/`                                                                                            |
| CI/CDの実行定義                  | `.github/workflows/ci-pages.yml`                                                                                       |
| 型・lint・書式・runnerの設定     | リポジトリルートの`tsconfig.json`、`eslint.config.js`、`.prettierrc.json`、`vitest.config.ts`、`playwright*.config.ts` |

テスト本体はGitHub Actionsだけでなくローカルからも実行するため、`tests/`を維持します。CIからはnpm scriptsを呼び、実行方法や検証ロジックの重複を避けます。Pythonなど未使用の言語用の規約は先に作らず、導入時に実際の依存管理・lint・テスト構成に合わせて追加します。

参考: [Copilot CLIのcustom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)。

## カタログを更新する

1. `src/data/`内の出典URLから公式資料の本文を開き、コマンドの表記、対象環境、実行文脈、alias、利用条件を確認します。
2. `src/catalog/types.ts`の型に合わせてデータを更新します。同名でも環境や文脈が異なる項目は統合しません。
3. コマンドの`sourceIds`・`lastVerified`と、資料の`checkedAt`を更新します。資料の確認日を製品のリリース日として扱わないでください。
4. 新しい環境や調査結果は環境データの`coverage`・`note`にも反映します。GA、Preview、Experimental等の状態は出典に明示された場合だけ設定します。
5. `npm run check`と関連するE2Eを実行し、画面上の表示・出典・件数を確認します。

整合性検査は全データを走査しますが、公式資料と説明文の意味が一致するかまでは自動判定しません。データ変更時の一次情報との照合は必要です。

## 日次更新と人による承認

`.github/workflows/daily-catalog-update.md`を正本とし、GitHub Agentic Workflows
**v0.88.7**で生成した`daily-catalog-update.lock.yml`をActionsから実行します。
GitHub Agentic WorkflowsはPublic Previewです。Copilot CLIは**1.0.86**に固定しています。
この日次workflow自体は公開せず、マージ後の公開には既存の`ci-pages.yml`を使います。

| 段階     | 動作                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 起動     | 毎日06:37 JST（21:37 UTC）と`workflow_dispatch`。`main`以外では更新しない                   |
| 承認待ち | このworkflowが作成した未完了PRがある間は調査も一時停止。既存PRを上書きしない                |
| 調査     | `src/data/sources.ts`の全出典をCopilotが読み、環境別の掲載内容と比較                        |
| 更新なし | 調査日・対象件数・出典を実行結果に記録。確認日だけのPRは作らない                            |
| 更新あり | 指定5ファイル内で更新し、`npm run check`と`npm run test:e2e`の成功後にDraft PRを最大1件要求 |
| 人の確認 | 公式本文との一致、変更範囲、日付、CI結果を確認し、Draft解除・レビュー・手動マージ           |
| 公開     | マージ後の`check` → `deploy` → `verify-deployment`と配信SHA一致まで確認                     |

**AIの指示に従った調査・テストと、機械的に強制する制約は別です。**
全資料の意味の照合とPR作成前のテスト実行はCopilotへの指示であり、正確性を保証しません。
Draft固定、最大1件、`main`宛て、変更可能な5ファイルの制限はsafe outputsで強制します。
AIにマージ・レビュー承認・workflow承認の出力権限は与えていません。
PR上のCIは独立して再実行し、AIが書いた「成功」の説明だけでマージしないでください。

変更可能なのは`src/data/`の`app.ts`、`cli.ts`、`ide.ts`、`environments.ts`、`sources.ts`です。
型・ロジック・テスト・依存・workflowの変更が必要な更新は自動処理の対象外です。
コマンドごとの確認日は`commandBuilder`のdetailsの`lastVerified`で更新し、
`builders.ts`の共通日付を進めて未確認の項目まで確認済みにしない構成です。
内容に差分がない日の調査はActionsの実行結果に残り、サイトの確認日は変わりません。

取得できない資料や矛盾・検証失敗は「更新なし」とせず、`missing_data`で理由を報告するよう指示しています。
失敗時のIssue自動作成やPR失敗時のIssueへの代替は無効です。Actionsのrun・summary・ログを確認してください。
実行時間は25分、agentのターン上限は120です。加えてgh-aw既定のAI Creditsガードレールを使います。
これは請求額の上限を保証しません。Copilotの利用枠・予算とActionsの使用量を管理者が確認してください。

### 導入時に必要な操作

以下のリポジトリ設定変更と初回実行は、workflowファイルの追加とは別に管理者が行います。
**Secretの値をチャット・ソース・ログへ貼らないでください。**

1. 利用する個人アカウントにCopilotの有効な契約があることを確認します。
   fine-grained PATのResource ownerを自分にし、
   Account permissionsの **Copilot Requests: Read** を付与します。
   この推論用トークンにPR作成・Contents書き込み権限を追加する必要はありません。
2. **Settings → Secrets and variables → Actions** に
   `COPILOT_GITHUB_TOKEN`として登録します。
   個人所有リポジトリのため、組織課金用の`copilot-requests: write`には依存しません。
3. **Settings → Actions → General → Workflow permissions** で
   **Allow GitHub Actions to create and approve pull requests**を有効にします。
   設定名にはapproveも含まれますが、このworkflowはPR作成しか行いません。
   リポジトリ既定のトークン権限はreadのままにし、ブランチ・PR作成は生成されたsafe outputs jobに限定します。
4. この変更を通常のPRでレビューして`main`へ反映します。
   Actionsの **Daily catalog update → Run workflow** で`main`を指定して初回実行します。
   未承認の課金・Secret登録・リモート実行をローカル検証の一部として行わないでください。
5. 更新PRのCIが承認待ちなら、権限のある人が **Approve workflows to run** を押します。
   自動生成PRの現在のheadに対する`Check and publish`の`check`成功と本文の根拠を確認し、
   手動マージします。必要なbranch protectionやレビュー要件は別途設定するもので、
   workflowの追加だけでは有効になりません。

PR作成には組み込みの`GITHUB_TOKEN`を明示的に使い、推論用PATや別の書き込み用PATを流用しません。
公式コンパイラーが生成するPR作成専用checkoutのみ、短命トークンをGit設定へ一時保存します。
生成された`safe_outputs`と`conclusion`には補助処理用のContents・Issues・Pull requests書き込み権限が付きます。
これらは承認済みの限定例外であり、調査AIや通常CIへ書き込み権限を渡すものではありません。
契約テストで例外のjobと権限を固定し、生成ファイルを手編集してフレームワークの実装を置き換えません。
この構成ではGitHubの仕様により、bot作成PRのCIが人の起動承認を要求する場合があります。
人がマージした`main`へのpushを起点に既存CDが動くため、自動マージや追加のデプロイトークンは不要です。

日次スケジュールは定刻保証ではありません。混雑による遅延・欠落や、公開リポジトリで
60日間活動がない場合の自動無効化があります。長期間PRが出ないことを「更新がない証拠」とせず、
Actionsの実行履歴も確認してください。停止する場合はActionsからこのworkflowを無効化します。

### 定義の変更と検証

`.lock.yml`を手編集せず、`.md`を整形してから同じバージョンで再生成します。
gh-awはアプリの実行依存ではありません。開発者用CLI拡張として利用する場合のコマンドは次のとおりです。

```powershell
gh extension install github/gh-aw --pin v0.88.7
gh aw compile daily-catalog-update --gh-aw-ref v0.88.7 --no-check-update
npm run check
npm run test:e2e
```

既に別バージョンの拡張がある場合は無断で置き換えず、公式リリースの同バージョンの実行ファイルでも
同じ`compile`引数を利用できます。生成されたlockと`.github/aw/`のpin情報も変更と一緒にレビューします。
通常の`npm run check`には、権限・トリガー・変更範囲・承認境界を検査する単体テストを含めています。
コンパイルとローカル検査は、Secret付きのGitHub実行、AIの実際の調査、PR作成・CI・公開の成功とは別です。
**初回のリモート実行と公開経路は、導入後に確認する必要があります。**

参考（2026-09-19確認）:
[GitHub Agentic Workflows](https://docs.github.com/en/copilot/how-tos/github-agentic-workflows/creating-github-agentic-workflows)、
[認証](https://github.github.com/gh-aw/reference/auth/)、
[PRの制約](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/)、
[workflow起動とトークン](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)、
[scheduleの制約](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

## GitHub Pagesへ公開する

`.github/workflows/ci-pages.yml`が検証と公開を担当します。PRでは検証のみ実行し、`main`へのpushまたは`main`を指定した手動実行では、検証成功後に`dist`だけを公開します。Viteの`base`は、このリポジトリ名のproject site用サブパスに設定しています。

通常の変更は作業ブランチからPRで反映します。PRの`check`成功と必要なレビュー・マージ許可を確認し、マージ後は対象SHAの`check` → `deploy` → `verify-deployment`を最後まで追跡します。手順と報告項目は[PR・公開方針](.github/pull-request-policy.md)を参照してください。

初回公開には、リポジトリ管理者による **Settings → Pages → Build and deployment → Source: GitHub Actions** の設定が必要です。コミット・push・`main`への反映・Pages設定変更・初回公開は、それぞれ対象と影響を確認してから行ってください。

検証jobと公開後の確認jobは読み取り権限を使い、デプロイjobにのみ`pages: write`と`id-token: write`を付与します。独自のPATやAPIキーは不要です。GitHub側の権限・ポリシー・environment保護によっては、管理者の追加操作が必要です。

GitHub Actionsでのビルドは、対象の`GITHUB_SHA`を`build-info.json`とHTMLの`build-revision` metaに記録します。ローカルビルドは`local`と記録し、公開版のSHAを推測しません。`verify-deployment`は公開先のJSON・HTMLに記録されたSHA、検索・絞り込み・共有URL、assetとモバイル相当の表示を確認します。配信反映待ちは最大2分で打ち切り、不一致のまま成功扱いにしません。

公開後は、Actionsのデプロイ結果に表示されるURLを認証なしで開き、必要な主要操作を確認してください。**対象SHAの3つのjobとworkflow全体が成功し、公開先の確認が済むまで完了ではありません。** `queued`・`in_progress`・失敗・必要なjobのskipは未完了です。権限や承認で進められない場合も、未完了の理由とrun URLを残します。

参考: [GitHub Pagesの概要](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 構成

`src/catalog/`にDOMに依存しない検索・URL状態・整合性検査、`src/data/`にカタログ、`src/ui/`に表示処理を置いています。画面の入口は`index.html`と`src/main.ts`、スタイルは`src/styles.css`です。Agent向けの案内は[AGENTS.md](AGENTS.md)を参照してください。

アプリ側でログイン、アクセス解析、検索内容の外部送信は実装していません。公式資料へのリンクは外部サイトを開きます。GitHub Pagesなど配信基盤でのアクセス情報の扱いは、各サービスのポリシーに従います。

## 非公式表記と権利

本サイトは非公式・個人運営のカタログです。ヘッダーには非公式・個人運営の表示と、掲載コマンドの公式資料確認日を掲載しています。確認日は資料の公開日や製品のリリース日ではなく、コマンドごとに異なる場合は日付の範囲を表示します。

フッターにはサイトの著作権表示（© 2026 matayuuu）と、GitHub・Microsoftとは提携しておらず両社の承認・後援を受けていない旨の案内を掲載しています。

製品名は対象を説明するために使用しています。サイトの著作権表示は、製品名・商標や参照する公式資料の権利を主張するものではありません。それらの権利は各権利者に帰属します。

[GitHub Trademark Policy](https://docs.github.com/en/site-policy/content-removal-policies/github-trademark-policy)（2026-09-19確認）は、ブランドや提携関係を誤認させる商標の使用を問題としています。本サイトの案内は、公式サービスとの混同を避けるための独自の表記であり、GitHub指定の定型文や名称使用の承認ではありません。
