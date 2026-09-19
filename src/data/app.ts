import type { CommandRecord } from '../catalog/types';
import { commandBuilder, subcommands } from './builders';

const app = commandBuilder('copilot-app', 'Copilot appの入力欄', ['app-slash-reference']);
const activeSession = {
  sessionKind: 'Copilot appのアクティブなセッション',
  conditions: ['アクティブなセッションが必要です。'],
};

export const appCommands: CommandRecord[] = [
  app(
    '/af',
    'Agent Finderを検索し、導入可能なMCPサーバー、ツール、スキル、エージェントを探します。',
    'agents',
    '/af',
    '作業に役立つ追加機能を探す組み込みスキルを開きます。',
    {
      kind: 'builtin-skill',
      warnings: ['見つかった機能を導入する場合は、配布元、権限、実行内容を別途確認してください。'],
    },
  ),
  app(
    '/agent',
    'セッションで使うカスタムエージェントを選択します。',
    'agents',
    '/agent',
    '目的に合ったエージェントを選びます。',
  ),
  app(
    '/allow-all-tools',
    'ツールの自動承認を有効にするか、現在の状態を表示します。',
    'settings',
    '/allow-all-tools',
    '自動承認の状態を確認・変更する操作を開始します。',
    {
      ...activeSession,
      aliases: ['/yolo'],
      warnings: [
        'ツール操作の承認が省略されます。ファイル変更やコマンド実行などの副作用を理解したうえで使用してください。',
      ],
    },
  ),
  app(
    '/attach-files',
    'ファイル選択画面を開き、メッセージにファイルを添付します。',
    'context',
    '/attach-files',
    '説明に必要なファイルを選んで添付します。',
    {
      warnings: ['機密情報や個人情報を含むファイルを不用意に添付しないでください。'],
    },
  ),
  app(
    '/attach-folder',
    'フォルダー選択画面を開き、メッセージにフォルダーを添付します。',
    'context',
    '/attach-folder',
    '作業に必要なフォルダーを選んで添付します。',
    {
      warnings: [
        '添付範囲が広くなるため、秘密情報や無関係なファイルが含まれないか確認してください。',
      ],
    },
  ),
  app(
    '/autopilot',
    'Autopilotモードへ切り替え、必要ならプロンプトを指定して実行を開始します。',
    'agents',
    '/autopilot 入力検証のテストを追加して',
    '自律的に進めるタスクを指定します。',
    {
      syntax: '/autopilot [PROMPT]',
      warnings: [
        '自律的に処理が続きます。作業範囲、ツールの副作用、追加の利用量を確認してください。',
      ],
    },
  ),
  app(
    '/chronicle',
    'セッション履歴の検索、振り返り、利用改善のための機能を開きます。',
    'session',
    '/chronicle standup',
    '直近1日の作業をまとめます。',
    {
      subcommands: subcommands([
        ['/chronicle cost-tips', 'トークン使用量やコストを減らす助言を得ます。'],
        ['/chronicle improve', '指示ファイルの改善案を得ます。'],
        ['/chronicle reindex', 'セッション履歴の索引を再構築します。'],
        ['/chronicle search', 'キーワードや話題から履歴を検索します。'],
        ['/chronicle standup', '直近1日の作業を要約します。'],
        ['/chronicle tips', '個別の利用状況に合う作業上の助言を得ます。'],
      ]),
      warnings: [
        '履歴に含まれるコードや会話の取り扱いを確認してください。指示の改善案は適用前にレビューしてください。',
      ],
    },
  ),
  app(
    '/clear',
    '現在の会話記録をクリアし、新しいセッションを開始します。',
    'session',
    '/clear',
    '新しい話題に切り替えてセッションを始めます。',
    {
      ...activeSession,
      aliases: ['/reset'],
      warnings: ['継続に必要な情報は、会話記録をクリアする前に保存してください。'],
    },
  ),
  app(
    '/collect-debug-logs',
    'デバッグログのアーカイブを作成するか、secret gistへアップロードします。',
    'collaboration',
    '/collect-debug-logs',
    '不具合調査用のログをまとめます。',
    {
      ...activeSession,
      sourceIds: ['app-slash-reference', 'gist-visibility'],
      warnings: [
        'ログには機密情報が含まれる可能性があります。アップロード前に内容を確認してください。secret gistはURLを知る人から閲覧できます。',
      ],
    },
  ),
  app(
    '/compact',
    '会話の前半を要約し、セッションのトークン使用量を抑えます。',
    'context',
    '/compact',
    '長くなったセッションのコンテキストを整理します。',
    {
      ...activeSession,
      warnings: [
        '要約によって細部が省かれる可能性があります。重要な制約や決定事項を確認してください。',
      ],
    },
  ),
  app(
    '/context',
    '現在のセッションのコンテキスト使用状況を表示します。',
    'context',
    '/context',
    'コンテキストに何が含まれているか確認します。',
  ),
  app(
    '/create-canvas',
    'キャンバス作成用の組み込みスキルを呼び出します。',
    'agents',
    '/create-canvas 課題を整理するボードを作って',
    '作りたいキャンバスを説明します。',
    {
      syntax: '/create-canvas [PROMPT]',
      kind: 'builtin-skill',
      warnings: ['生成される拡張機能や実行コードの内容と権限を確認してください。'],
    },
  ),
  app(
    '/debug',
    'セッションのデバッグJSONをクリップボードへコピーします。',
    'settings',
    '/debug',
    '調査に必要なセッション情報をコピーします。',
    {
      ...activeSession,
      warnings: ['デバッグ情報の内容を確認し、認証情報や個人情報を共有先へ漏らさないでください。'],
    },
  ),
  app(
    '/export-gist',
    '会話記録をsecret gistへ書き出します。',
    'collaboration',
    '/export-gist',
    '共有してよい内容に整理してから会話記録を書き出します。',
    {
      ...activeSession,
      sourceIds: ['app-slash-reference', 'gist-visibility'],
      warnings: [
        '会話がGitHubへアップロードされます。secret gistはURLを知る人から閲覧できるため、機密情報の保管先にはしないでください。',
      ],
    },
  ),
  app(
    '/fleet',
    '1つのタスクを複数のエージェントで並列実行します。',
    'agents',
    '/fleet 独立した各モジュールのテストを追加して',
    '分離できる作業を複数のエージェントに分担させます。',
    {
      ...activeSession,
      syntax: '/fleet [PROMPT]',
      warnings: [
        '追加の利用量が発生し、同じファイルへの変更が競合する可能性があります。分担範囲を明確にしてください。',
      ],
    },
  ),
  app(
    '/fork',
    '直近のターンを起点に、現在のセッションを分岐します。',
    'session',
    '/fork',
    '別の解決案を検討するために分岐します。',
    activeSession,
  ),
  app(
    '/inbox',
    '作業項目のインタラクティブな受信トレイを表示します。',
    'collaboration',
    '/inbox',
    '対応する作業項目を確認します。',
    {
      conditions: ['利用可能な作業項目がない場合、ウィジェットは空になります。'],
    },
  ),
  app(
    '/init',
    'リポジトリ向けの指示を生成または改善します。',
    'agents',
    '/init',
    'プロジェクトに合わせたCopilot向け指示を整えます。',
    {
      sessionKind: 'リポジトリのセッション',
      conditions: ['リポジトリが必要です。'],
      warnings: ['生成・更新する指示を確認し、既存の規則やチームの方針を保持してください。'],
    },
  ),
  app(
    '/interactive',
    'Interactiveモードに切り替え、必要ならプロンプトから開始します。',
    'agents',
    '/interactive 次に確認するテストを相談したい',
    '対話しながら進めるモードに切り替えます。',
    {
      syntax: '/interactive [PROMPT]',
    },
  ),
  app(
    '/merge-to-parent',
    '分岐したセッションの作業を親セッションへ統合します。',
    'collaboration',
    '/merge-to-parent',
    '分岐先の作業を確認してから親へ戻します。',
    {
      sessionKind: '分岐したセッション',
      conditions: ['分岐したセッションが必要です。'],
      warnings: ['親の作業内容に変更が加わります。競合や意図しない変更がないか確認してください。'],
    },
  ),
  app(
    '/model',
    'モデル選択画面を開くか、名前・IDを指定してモデルを選択します。',
    'settings',
    '/model',
    '現在選択できるモデルを確認します。',
    {
      syntax: '/model [MODEL]',
      aliases: ['/models'],
      warnings: ['モデルにより利用量や適用条件が異なるため、選択時の案内を確認してください。'],
    },
  ),
  app(
    '/orchestrate',
    'セッションやリポジトリをまたぐ作業を調整する組み込みスキルを呼び出します。',
    'agents',
    '/orchestrate APIとクライアントの変更手順を調整して',
    '関連する複数の作業を説明します。',
    {
      syntax: '/orchestrate [PROMPT]',
      kind: 'builtin-skill',
      warnings: [
        '複数の作業環境へ変更が及ぶ可能性があります。対象、委任範囲、追加の利用量を確認してください。',
      ],
    },
  ),
  app(
    '/plan',
    'Planモードに切り替え、必要なら指定したタスクの計画を作ります。',
    'agents',
    '/plan 検索画面を追加する手順を考えて',
    '実装前に方針と作業手順を整理します。',
    {
      syntax: '/plan [PROMPT]',
    },
  ),
  app(
    '/pr-fix-checks',
    'プルリクエストの失敗しているチェックを修正するプロンプトを実行します。',
    'testing',
    '/pr-fix-checks',
    '失敗しているチェックへの対応を開始します。',
    {
      sessionKind: 'オープンなPRのあるセッション',
      conditions: ['チェックが失敗しているオープンなプルリクエストが必要です。'],
      warnings: [
        'コードやPRに変更が加わる可能性があります。修正内容とチェック結果を確認してください。',
      ],
    },
  ),
  app(
    '/pr-merge',
    '現在のプルリクエストをマージします。',
    'collaboration',
    '/pr-merge',
    'マージ条件と対象ブランチを確認してから統合します。',
    {
      sessionKind: 'マージ可能なPRのあるセッション',
      conditions: ['マージ可能なプルリクエストが必要です。'],
      warnings: [
        'リモートの対象ブランチに変更を統合する操作です。レビュー、検証結果、マージ先を確認してください。',
      ],
    },
  ),
  app(
    '/pr-open',
    '現在のセッションの変更からプルリクエストを作成します。',
    'collaboration',
    '/pr-open',
    '確認済みの変更をレビューに出します。',
    {
      ...activeSession,
      conditions: ['変更があるアクティブなセッションが必要です。'],
      warnings: [
        '変更内容がリモートのPRとして共有されます。機密情報と無関係な変更が含まれないか確認してください。',
      ],
    },
  ),
  app(
    '/pr-resolve-comments',
    'プルリクエストの未解決レビューコメントへの対応を実行します。',
    'testing',
    '/pr-resolve-comments',
    '未解決のレビュー指摘への対応を開始します。',
    {
      sessionKind: 'オープンなPRのあるセッション',
      conditions: ['未解決のレビューコメントがあるオープンなプルリクエストが必要です。'],
      warnings: [
        'コード変更やレビュー上の操作が行われる可能性があります。対応内容を確認してください。',
      ],
    },
  ),
  app(
    '/remote',
    '現在のセッションをGitHub.comやGitHub Mobileから操作するための接続を管理します。',
    'collaboration',
    '/remote',
    '現在のセッションのリモート操作を設定します。',
    {
      ...activeSession,
      sourceIds: ['app-slash-reference', 'cli-remote-control'],
      conditions: [
        ...activeSession.conditions,
        '利用可否は組織・Enterpriseのポリシーに依存します。実行元のマシンがオンラインである必要があります。',
      ],
      warnings: [
        '会話やツール実行などのイベントがGitHubへ送信されます。リモート画面ではスラッシュコマンドを利用できません。',
      ],
    },
  ),
  app(
    '/rename',
    '現在のチャットまたはセッションの名前を変更します。',
    'session',
    '/rename',
    '後で見つけやすい名前へ変更します。',
    activeSession,
  ),
  app(
    '/research',
    '調査ワークフローを実行し、出典付きのレポートを作ります。',
    'documentation',
    '/research 日付ライブラリの互換性を公式情報から比較して',
    '比較対象と根拠の範囲を指定します。',
    {
      syntax: '/research [PROMPT]',
      warnings: ['外部検索に送る情報と調査による利用量を確認してください。'],
    },
  ),
  app(
    '/reset-allowed-tools',
    'セッション単位のツール承認を消去し、自動承認を無効にします。',
    'settings',
    '/reset-allowed-tools',
    'ツールへの許可を見直して自動承認を終えます。',
    activeSession,
  ),
  app(
    '/restart-session',
    '会話履歴を保持して現在のセッションを再起動します。',
    'session',
    '/restart-session',
    '履歴を引き継いでセッションを再起動します。',
    {
      ...activeSession,
      warnings: ['進行中の処理に影響する可能性があるため、作業状態を確認してください。'],
    },
  ),
  app(
    '/review',
    '現在のセッションの変更をレビューします。',
    'testing',
    '/review',
    'コード変更の問題や見落としを調べます。',
    {
      ...activeSession,
      warnings: ['レビューの指摘は実際のコードと検証結果で確認してください。'],
    },
  ),
  app(
    '/rubber-duck',
    'このセッションで使用したモデルとは異なるモデルに、方針や実装への批評を求めます。',
    'testing',
    '/rubber-duck この再試行設計の問題点を指摘して',
    '別のモデルの観点を使って設計を検討します。',
    {
      syntax: '/rubber-duck [PROMPT]',
      warnings: ['別モデルへの追加の依頼による利用量が発生します。'],
    },
  ),
  app(
    '/security-review',
    '現在の差分に対してセキュリティを重視したレビューを実行します。',
    'testing',
    '/security-review',
    '作業中の変更に脆弱性がないか確認します。',
    {
      ...activeSession,
      conditions: ['変更があるアクティブなセッションが必要です。'],
      warnings: [
        '差分を対象としたレビューで、安全性を保証する監査ではありません。指摘と修正は検証してください。',
      ],
    },
  ),
  app(
    '/skills',
    'スキルを管理し、セッション中の再読み込みを行います。',
    'agents',
    '/skills reload',
    '更新したスキルをセッションへ読み込み直します。',
    {
      subcommands: subcommands([
        ['/skills reload', 'セッションの途中でスキルを再読み込みします。'],
      ]),
      warnings: ['新しく読み込むスキルの指示や実行内容を確認してください。'],
    },
  ),
  app(
    '/spar',
    '反対の立場からの推論によって、方針の弱点を検討します。',
    'testing',
    '/spar この移行計画が失敗する条件を検討して',
    '方針に対する反論を通じて見落としを探します。',
    {
      syntax: '/spar [PROMPT]',
      warnings: ['追加のモデル利用が発生します。反論の妥当性は根拠と照合してください。'],
    },
  ),
  app(
    '/spawn',
    '委任した作業に集中する子セッションを作成します。',
    'agents',
    '/spawn ログ出力の仕様だけを調査して',
    '独立した小さな作業を子セッションへ委任します。',
    {
      syntax: '/spawn [PROMPT]',
      warnings: [
        '別セッションで追加の処理と利用量が発生します。対象ファイルと変更可能な範囲を明示してください。',
      ],
    },
  ),
  app(
    '/terminal',
    '右側のパネルに新しいターミナルを開き、必要ならコマンドを実行します。',
    'settings',
    '/terminal',
    'まずターミナルだけを開き、作業場所を確認します。',
    {
      ...activeSession,
      syntax: '/terminal [COMMAND]',
      warnings: [
        '引数にコマンドを渡すと実行される可能性があります。実行内容と作業ディレクトリを確認してください。',
      ],
    },
  ),
  app(
    '/usage',
    '契約プランの利用量とレート制限の詳細を開きます。',
    'settings',
    '/usage',
    '利用枠と現在の使用状況を確認します。',
  ),
];
