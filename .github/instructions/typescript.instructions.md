---
description: TypeScriptの型安全性、モジュール境界、ブラウザー処理を既存の設定に合わせて保つ。
applyTo: '**/*.ts'
---

# TypeScript

## 型とコードスタイル

- [tsconfig.json](../../tsconfig.json)の`strict`、`noUncheckedIndexedAccess`、`verbatimModuleSyntax`を維持する。エラーを消すために設定を緩めない。
- 書式と静的解析の正本は[Prettier設定](../../.prettierrc.json)と[ESLint設定](../../eslint.config.js)。規約文書へ設定値を複製せず、既存のformatter・lintを使う。
- 型だけの依存は`import type`にする。通常のロジックは既存どおりnamed exportとし、ツール設定のdefault exportはそのツールの形式に従う。
- 変数・関数はcamelCase、型・interfaceはPascalCaseとする。新しい通常のソースファイルは既存のkebab-caseに合わせ、無関係な改名はしない。
- 未検証の外部入力は`unknown`として型ガードで絞り込む。`any`、二重の型アサーション、根拠のない非nullアサーションで検査を迂回しない。
- 配列の添字参照、`find`、DOM要素の取得では、存在しない場合を処理する。必須条件の破損と、正常な検索結果0件を区別する。
- 有限の選択肢には既存のリテラルunionや`as const`を使い、同じ選択肢やデータ契約を別の型で重複定義しない。

## 処理の境界

- `src/catalog/`の検索・URL状態・整合性検査はDOM、Clipboard、ブラウザーのグローバル状態に依存させない。副作用は`src/main.ts`や`src/ui/`で扱う。
- 受け取ったカタログを破壊的に並べ替えない。読み取りだけの引数には`readonly`を使い、検索結果は元データと分ける。
- コマンド・環境・出典の契約は`src/catalog/types.ts`を再利用する。別名、サブコマンド、環境別レコードをUIの都合で混同しない。
- 文字列の表示には安全なDOM APIを使う。検索語やカタログ文字列をHTMLとして解釈しない。
- Clipboardなどの非同期処理は拒否・未対応を扱い、利用者へ復旧手段を示す。`void`を付けるだけでPromiseの失敗を処理したことにしない。
- モジュール境界やエラー処理を変更した場合は、変更した契約を単体テストで確認する。新しい抽象化や依存は実際の必要性がある場合だけ追加する。

検証の入口は[READMEの開発と検証](../../README.md#開発と検証)を参照する。

参考: [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)。
