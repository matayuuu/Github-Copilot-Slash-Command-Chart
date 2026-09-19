---
description: GitHub Actionsの検証とPages公開を分離し、最小権限と再現可能な品質ゲートを維持する。
applyTo: '.github/workflows/*.yml,.github/workflows/*.yaml'
---

# GitHub Actions

## 検証と公開の分離

- workflowの実体は`.github/workflows/`に置く。テスト本体は`tests/`、共通の実行入口は`package.json`のnpm scriptsに保ち、workflow内へテストロジックを複製しない。
- ローカルとCIで同じ検証入口を呼ぶ。Node.jsのバージョン、lockfile、作業ディレクトリ、ビルド成果物を既存構成と整合させ、依存復元には`npm ci`を使う。
- PRでは検証のみ行い、公開は`main`へのpushまたは`main`からの手動実行に限定する。デプロイjobは検証jobの成功を`needs`で要求する。
- 品質ゲートの失敗を`continue-on-error`や終了コードの握り潰しで隠さない。公開前に型検査・lint・format・単体テスト・ビルド・E2Eが実行されることを保つ。
- Pagesへ渡すのは`dist`だけとする。リポジトリ全体、依存、ログ、秘密を公開artifactに含めない。
- デプロイの後には、公開先を匿名で確認する`verify-deployment`を実行する。`build-info.json`とHTMLのrevisionが対象SHAに一致し、主要操作が通るまで公開完了にしない。HTTP 200だけで代用しない。

## 権限と運用

- workflow全体は`contents: read`を基本とし、`pages: write`と`id-token: write`はデプロイjobだけへ付与する。
- 外部PRのコードへsecretsや書き込み権限を渡さない。通常の検証には`pull_request_target`を使わない。
- checkoutの`persist-credentials: false`を維持する。静的サイト公開のために独自PATを導入しない。
- actionは公式の実在するreleaseを確認し、既存どおりコミットSHAに固定する。更新時は参照するreleaseのコメントと必要な権限・runtimeも確認する。
- `github-pages` environment、公開の同時実行制御、明示的なtimeoutを維持する。失敗や中断からの再実行で公開条件が緩まないようにする。
- 同じrefのworkflowを公開後の確認まで直列化する。別runのデプロイが確認途中のサイトを差し替え、公開SHAの判定が競合しないようにする。
- Pagesの自動有効化を有効にしない。コミット、push、`main`反映、リポジトリ設定変更、初回公開は別途の承認を必要とする。
- workflowファイルの検査、ローカルの同等チェック、GitHub上のCI実行、公開URLの動作確認を区別する。未実施のリモート処理を成功済みとして報告しない。

公開手順は[README](../../README.md#github-pagesへ公開する)、イベントごとの成功条件と失敗時の対応は[PR・公開方針](../pull-request-policy.md)を参照する。

参考: [GitHub Pagesのcustom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
