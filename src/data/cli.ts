import type { CommandRecord } from '../catalog/types';
import { commandBuilder, subcommands } from './builders';

const cli = commandBuilder('cli', 'ローカルの対話型CLIセッション', [
  'cli-command-reference',
  'cli-command-source',
]);

export const cliCommands: CommandRecord[] = [
  cli(
    '/add-dir',
    '指定したディレクトリへのファイルアクセスを許可し、その配下のスキルとエージェントを信頼済み設定として読み込みます。',
    'context',
    '/add-dir ..\\shared-library',
    '作業に必要な別ディレクトリを追加します。',
    {
      syntax: '/add-dir PATH',
      warnings: [
        'アクセス範囲が広がります。追加先の.github/skillsと.github/agentsの内容も信頼することになるため、事前に確認してください。',
      ],
    },
  ),
  cli(
    '/after',
    '現在のセッションで、指定時間後に一度だけプロンプトなどを実行する予定を登録します。',
    'agents',
    '/after 30m 作業状況を要約して',
    '30分後の単発タスクを登録します。',
    {
      syntax: '/after [DELAY PROMPT]',
      status: 'experimental',
      conditions: [
        '現在のセッションのスケジュールです。引数なしでは予定の一覧・削除画面が開き、追加は入力欄から行います。',
      ],
      warnings: ['予定時刻にAIやツールの処理が走り、利用量や副作用が発生する可能性があります。'],
    },
  ),
  cli(
    '/agent',
    '利用可能なエージェントを参照し、使用するものを選びます。',
    'agents',
    '/agent',
    '現在の環境で検出されたエージェントを確認します。',
    {
      conditions: ['選択できるエージェントが環境に用意されている必要があります。'],
    },
  ),
  cli(
    '/app',
    '現在のセッションをGitHub Copilot appで開きます。',
    'collaboration',
    '/app',
    '対話中のCLIセッションをアプリで開きます。',
    {
      conditions: [
        '対応するGitHub Copilot app（1.1.3以降）が必要です。未インストールの場合はダウンロードURLが表示されます。',
      ],
    },
  ),
  cli(
    '/ask',
    '会話履歴に追加しない補足の質問をします。',
    'session',
    '/ask このエラーメッセージの意味は？',
    '作業の本筋から離れた短い質問をします。',
    {
      syntax: '/ask QUESTION',
      aliases: ['/btw'],
    },
  ),
  cli(
    '/autopilot',
    '目的を指定してAutopilotを開始するか、進行中の目的を更新します。',
    'agents',
    '/autopilot 入力検証のテストを追加して --max-ai-credits 5',
    '目的とAI Creditsの上限を指定します。',
    {
      syntax: '/autopilot [OBJECTIVE] [--max-ai-credits N]',
      aliases: ['/goal'],
      examples: [
        {
          prompt: '/autopilot 入力検証のテストを追加して --max-ai-credits 5',
          description: '目的とAI Creditsの上限を指定します。',
        },
        {
          prompt: '/goal on',
          description: '目的を設定せずAutopilotを有効にします。',
        },
        {
          prompt: '/goal off',
          description: 'Autopilotを無効にします。',
        },
        {
          prompt: '/goal --max-ai-credits 3',
          description: '停止中の目的に新しい3クレジットの枠を設定して再開します。',
        },
      ],
      conditions: [
        '目的を省略すると会話の文脈から意図が推定されます。',
        '別名の/goal onと/goal offは、目的を設定せずAutopilotを切り替えます。on/offには--max-ai-creditsを併用できません。',
        '/goal --max-ai-credits Nは、停止中の目的に新しいクレジット枠を設定して再開します。',
      ],
      warnings: [
        '自律的に処理を続けるため、変更範囲と利用量を確認してください。再開時の上限は差分追加ではなく、新しい利用枠です。',
      ],
    },
  ),
  cli(
    '/changelog',
    'CLIの変更履歴を表示し、必要ならAIによる要約を作ります。',
    'documentation',
    '/changelog last 3',
    '直近3リリースの変更履歴を確認します。',
    {
      syntax: '/changelog [summarize] [VERSION|last N|since VERSION]',
      aliases: ['/release-notes'],
      subcommands: subcommands([
        [
          '/changelog summarize [VERSION|last N|since VERSION]',
          '指定範囲の変更履歴をAIで要約します。',
        ],
      ]),
    },
  ),
  cli(
    '/chronicle',
    'セッション履歴の分析や振り返り、観測した使い方に基づくスキル提案を行います。',
    'session',
    '/chronicle standup',
    '最近の作業を振り返る要約を作ります。',
    {
      syntax:
        '/chronicle <standup|tips|cost-tips|search|improve|reindex|skills create|skills review|skills status>',
      sourceIds: ['cli-command-reference', 'cli-command-source', 'cli-chronicle-guide'],
      subcommands: subcommands([
        ['/chronicle standup', '作業履歴を振り返る要約を得ます。'],
        ['/chronicle tips', '履歴に基づく使い方の助言を得ます。'],
        ['/chronicle cost-tips', 'トークン使用量とコストの削減案を得ます。'],
        ['/chronicle search [検索内容]', 'セッション履歴の本文から話題やキーワードを検索します。'],
        ['/chronicle improve', '指示の改善案を得ます。'],
        [
          '/chronicle reindex',
          'ローカルの履歴索引を再構築し、アカウントへセッションデータを同期します。',
        ],
        ['/chronicle skills create', '利用状況からリポジトリ用スキルの案を作ります。'],
        ['/chronicle skills review', '提案されたスキルをレビューします。'],
        ['/chronicle skills status', 'スキル提案の状態を確認します。'],
      ]),
      conditions: [
        '引数なしではサブコマンドの選択画面を開きます。improveの分析範囲は現在のリポジトリまたは作業ディレクトリに限られます。',
      ],
      warnings: [
        '分析対象の履歴にはコードや会話が含まれます。生成された指示・スキルは適用前に確認してください。',
        'reindexにはGitHubアカウントへのデータ同期が含まれます。',
      ],
    },
  ),
  cli(
    '/clear',
    '新しい会話を開始します。必要なら最初のプロンプトも指定できます。',
    'session',
    '/clear 次は設定ファイルの構成を調べて',
    '話題を切り替えて新しい会話を始めます。',
    {
      syntax: '/clear [PROMPT]',
      aliases: ['/new', '/reset'],
    },
  ),
  cli(
    '/clikit',
    'CLIの業務向けUI部品をプレビューします。',
    'settings',
    '/clikit',
    '利用量などを表示するCLI部品を確認します。',
    {
      syntax: '/clikit [COMPONENT]',
    },
  ),
  cli(
    '/compact',
    '会話履歴を要約してコンテキスト使用量を減らします。',
    'context',
    '/compact 認証に関する決定事項を残して',
    '要約に残してほしい観点を指定します。',
    {
      syntax: '/compact [FOCUS-INSTRUCTIONS]',
      warnings: [
        '要約で細部が省かれる可能性があります。重要な要件や制約が残っているか確認してください。',
      ],
    },
  ),
  cli(
    '/context',
    'コンテキストウィンドウのトークン使用量と内訳を表示します。',
    'context',
    '/context',
    '現在どの程度コンテキストを使っているか確認します。',
  ),
  cli(
    '/copy',
    '直前の応答をクリップボードへコピーします。',
    'collaboration',
    '/copy',
    '直前に得た説明を別の場所で利用するためにコピーします。',
    {
      warnings: ['共有クリップボードや貼り付け先に機密情報を渡さないよう確認してください。'],
    },
  ),
  cli(
    '/cwd',
    '作業ディレクトリを確認または変更します。',
    'context',
    '/cwd',
    '現在の作業場所を確認します。',
    {
      syntax: '/cwd',
      aliases: ['/cd'],
      examples: [
        { prompt: '/cwd', description: '現在の作業場所を確認します。' },
        {
          prompt: '/cd ..\\shared-library',
          description: '別名の/cdを使い、指定した作業ディレクトリへ移動します。',
        },
      ],
      conditions: ['ディレクトリを変更する別名の構文は/cd [PATH]です。'],
      warnings: ['変更後にどのリポジトリやファイルへ操作するか確認してください。'],
    },
  ),
  cli(
    '/delegate',
    'リモートリポジトリへの変更を委任し、AIが作るプルリクエストにつなげます。',
    'collaboration',
    '/delegate 検索処理の境界値テストを追加して',
    '独立した変更をリモート側に委任します。',
    {
      syntax: '/delegate [PROMPT]',
      warnings: [
        'リモートで処理やPR作成が行われます。対象リポジトリ、送信する内容、追加の利用量を確認してください。',
      ],
    },
  ),
  cli(
    '/diagnose',
    '現在のセッションログを分析し、エラーや期待と異なる動作を調べます。',
    'settings',
    '/diagnose MCPの接続失敗を調べて',
    '調査したい症状に焦点を絞ります。',
    {
      syntax: '/diagnose [PROMPT]',
      warnings: ['分析対象のログに機密情報が含まれていないか確認してください。'],
    },
  ),
  cli(
    '/diff',
    '現在のディレクトリの変更差分を確認します。',
    'testing',
    '/diff',
    '編集した内容を差分で確認します。',
    {
      conditions: [
        '作業ツリーに変更がないときはブランチ差分へ自動で切り替えます。この自動切り替えは実験的機能として記載されています。',
      ],
    },
  ),
  cli(
    '/downgrade',
    '指定したCLIバージョンをダウンロードし、そのバージョンで再起動します。',
    'settings',
    '/downgrade 1.0.0',
    '例示した番号を実際に利用可能なバージョンへ置き換えて実行します。',
    {
      syntax: '/downgrade VERSION',
      conditions: ['チームアカウント向けの操作です。例のバージョン番号は配布状況を保証しません。'],
      warnings: [
        '実行環境のバージョンが変わります。互換性や修正済みの問題への影響を確認してください。',
      ],
    },
  ),
  cli(
    '/env',
    '読み込まれた指示、サーバー、スキル、エージェントなどの環境情報を表示します。',
    'context',
    '/env',
    '何が現在のセッションに適用されているか確認します。',
  ),
  cli(
    '/every',
    '現在のセッションで、プロンプトなどを繰り返し実行する予定を登録します。',
    'agents',
    '/every 1h 作業の進捗をまとめて',
    '1時間ごとの繰り返し予定を作ります。',
    {
      syntax: '/every [INTERVAL] PROMPT',
      status: 'experimental',
      conditions: ['引数なしでは予定の一覧・削除画面を開きます。追加は入力欄から行います。'],
      warnings: [
        '繰り返し処理によって利用量や副作用が積み重なります。不要な予定は削除してください。',
      ],
    },
  ),
  cli(
    '/exit',
    '現在のセッションを閉じます。最後のセッションを閉じるとCLIが終了します。',
    'session',
    '/exit',
    '現在のセッションを閉じます。',
    {
      aliases: ['/quit'],
      subcommands: subcommands([
        ['/exit print', 'CLIを終了し、会話記録を出力する選択肢を表示します。'],
      ]),
      conditions: ['別のセッションが動いている場合は、通常はその中で最も新しいものに移ります。'],
      warnings: ['実行中の作業と、出力する会話記録の内容を確認してください。'],
    },
  ),
  cli(
    '/extensions',
    'CLI拡張機能の管理やモード設定を行います。',
    'settings',
    '/extensions',
    'CLI拡張機能の管理を開きます。',
    {
      syntax: '/extensions [manage|mode]',
      aliases: ['/extension'],
      status: 'experimental',
      subcommands: subcommands([
        ['/extensions manage', '拡張機能の管理を開きます。'],
        ['/extensions mode', '拡張機能のモードを扱います。'],
      ]),
      warnings: ['拡張機能が実行するコードやアクセス先を確認してください。'],
    },
  ),
  cli(
    '/experimental',
    '実験的機能を有効化・無効化するか、現在の設定を確認します。',
    'settings',
    '/experimental show',
    '実験的機能の設定を確認します。',
    {
      syntax: '/experimental [on|off|show]',
      subcommands: subcommands([
        ['/experimental on', '実験的機能を有効にします。'],
        ['/experimental off', '実験的機能を無効にします。'],
        ['/experimental show', '現在の設定を表示します。'],
      ]),
      warnings: ['有効にした実験的機能の動作や提供状況は変わる可能性があります。'],
    },
  ),
  cli(
    '/feedback',
    'CLIに関するフィードバックを送る操作を開始します。',
    'collaboration',
    '/feedback',
    '再現手順などを添えて問題を報告します。',
    {
      aliases: ['/bug'],
      warnings: ['報告や添付情報に機密コード、認証情報、個人情報を含めないでください。'],
    },
  ),
  cli(
    '/fleet',
    'タスクを分割し、複数のサブエージェントによる並列実行を有効にします。',
    'agents',
    '/fleet 独立した3つのモジュールのテストを追加して',
    '分離して進められる作業を並列化します。',
    {
      syntax: '/fleet [PROMPT]',
      warnings: [
        '並列実行では利用量が増え、同じファイルへの変更が競合する可能性があります。範囲を分けてください。',
      ],
    },
  ),
  cli(
    '/help',
    '対話型CLIで利用可能なコマンドのヘルプを表示します。',
    'documentation',
    '/help',
    'インストール済みCLIで使えるコマンドを確認します。',
  ),
  cli(
    '/ide',
    'IDEのワークスペースに接続します。',
    'collaboration',
    '/ide',
    '接続するIDEワークスペースを選びます。',
  ),
  cli(
    '/init',
    'このリポジトリのCopilot向け指示やエージェント機能を初期化します。',
    'agents',
    '/init',
    'リポジトリに合うAI支援開発用の構成を整えます。',
    {
      conditions: ['初期化の対象は現在のリポジトリです。'],
      warnings: ['指示や構成ファイルの生成・更新内容を確認し、既存の設定を保持してください。'],
    },
  ),
  cli(
    '/instructions',
    'カスタム指示ファイルを表示し、有効・無効を切り替えます。',
    'agents',
    '/instructions',
    '現在読み込む指示を確認します。',
    {
      warnings: ['指示を無効にすると、それまで適用されていた作業規則が変わる場合があります。'],
    },
  ),
  cli(
    '/keep-alive',
    'セッション中、処理中、または指定時間のスリープを防ぎます。',
    'settings',
    '/keep-alive 30m',
    '30分間マシンがスリープしないようにします。',
    {
      syntax: '/keep-alive [on|off|busy|DURATION]',
      aliases: ['/caffeinate'],
      subcommands: subcommands([
        ['/keep-alive on', 'セッションが有効な間、スリープを防ぎます。'],
        ['/keep-alive off', 'スリープ防止を無効にします。'],
        ['/keep-alive busy', 'エージェントが処理中の間、スリープを防ぎます。'],
      ]),
      conditions: ['期間には30m、2h、1dなどを指定できます。単位なしの数値は分として扱われます。'],
      warnings: ['消費電力や端末の管理方針に注意してください。'],
    },
  ),
  cli(
    '/limits',
    '1回の応答で使うAI Creditsの上限を設定・解除します。',
    'settings',
    '/limits set max-ai-credits 3',
    '1応答あたりの上限を設定します。',
    {
      subcommands: subcommands([
        ['/limits set max-ai-credits VALUE', '応答ごとのクレジット上限を設定します。'],
        ['/limits unset [max-ai-credits|all]', '指定した上限またはすべての上限を解除します。'],
      ]),
      conditions: [
        '引数なしでは設定画面を開きます。上限はユーザーメッセージごとにリセットされます。',
      ],
      warnings: [
        'ソフト上限であり、厳密な請求額の上限ではありません。解除するとこの応答制限は働かなくなります。',
      ],
    },
  ),
  cli(
    '/list-dirs',
    'ファイルアクセスを許可したディレクトリの一覧を表示します。',
    'context',
    '/list-dirs',
    '現在のアクセス許可範囲を確認します。',
  ),
  cli(
    '/login',
    'Copilotへのログインを開始します。',
    'settings',
    '/login',
    '利用するアカウントで認証します。',
    {
      warnings: ['認証情報をプロンプトや共有ログへ貼り付けないでください。'],
    },
  ),
  cli(
    '/logout',
    'Copilotからログアウトします。',
    'settings',
    '/logout',
    '現在の認証状態を終了します。',
  ),
  cli(
    '/lsp',
    '言語サーバーの構成確認、テスト、再読み込み、ログ表示を行います。',
    'settings',
    '/lsp show',
    '設定されている言語サーバーを確認します。',
    {
      syntax: '/lsp [show|test|reload|logs|help] [SERVER-NAME]',
      subcommands: subcommands([
        ['/lsp show [SERVER-NAME]', '言語サーバーの構成を表示します。'],
        ['/lsp test [SERVER-NAME]', '言語サーバーをテストします。'],
        ['/lsp reload [SERVER-NAME]', '言語サーバーを再読み込みします。'],
        ['/lsp logs [SERVER-NAME]', 'LSPサービスのライブログを開きます。'],
        ['/lsp help', 'LSP管理のヘルプを表示します。'],
      ]),
      warnings: ['言語サーバーの実行や再読み込みは現在の解析状態に影響する場合があります。'],
    },
  ),
  cli(
    '/mcp',
    'MCPサーバーの構成、状態、接続先や認証を管理します。',
    'settings',
    '/mcp list',
    '接続状態を含むサーバー一覧を表示します。',
    {
      syntax:
        '/mcp [config|list|show|add|edit|delete|disable|enable|auth|reload|search] [SERVER-NAME]',
      subcommands: subcommands([
        ['/mcp config', 'MCPサーバー一覧に絞った管理画面を開きます。'],
        ['/mcp list', 'サーバーの一覧と接続状態を表示します。'],
        ['/mcp ls', 'listの別名です。'],
        ['/mcp show [SERVER-NAME]', '全体または指定サーバーの詳細を表示します。'],
        ['/mcp add', 'サーバーの追加画面を開きます。'],
        ['/mcp edit SERVER-NAME', 'サーバーの設定を編集します。'],
        ['/mcp delete SERVER-NAME', 'サーバー設定を削除します。'],
        ['/mcp disable SERVER-NAME', 'サーバーを無効にします。'],
        ['/mcp enable SERVER-NAME', 'サーバーを有効にします。'],
        ['/mcp auth SERVER-NAME', 'サーバーの認証を行います。'],
        ['/mcp reload [SERVER-NAME]', 'サーバーを再読み込みします。'],
        ['/mcp search', 'MCPサーバーを検索します。'],
      ]),
      conditions: [
        '参照や管理画面の表示以外の変更操作は、処理中のターンが終わるまで実行できません。',
        'リポジトリの.mcp.json由来のサーバーはedit/deleteでは変更できず、編集すべきファイルが案内されます。',
      ],
      warnings: [
        '外部サービスとの接続やローカルサーバーの実行を伴います。権限、送信データ、設定の削除対象を確認してください。',
      ],
    },
  ),
  cli(
    '/model',
    'AIモデルやAutoを選択し、適用する設定スコープを指定します。',
    'settings',
    '/model',
    '現在のセッション用のモデル選択画面を開きます。',
    {
      syntax: '/model [--session|--global|--repo|--local] [MODEL]',
      aliases: ['/models'],
      conditions: [
        '既定では現在のセッションだけに適用します。--globalは以後のセッション、--repo/--localはリポジトリの既定値を変更します。',
        '実行中に要求した変更はターン終了後に適用されます。利用できるモデルは環境に依存します。',
      ],
      warnings: [
        '選択モデルの利用量とデータ保持条件を確認してください。保存先のスコープを指定すると以後の利用にも影響します。',
      ],
    },
  ),
  cli(
    '/permissions',
    '権限モードを切り替え、現在のモードの確認やセッション内の承認のリセットを行います。',
    'settings',
    '/permissions show',
    '承認を変更せず、現在の権限モードを確認します。',
    {
      syntax: '/permissions [default|assisted|allow-all|show]',
      aliases: ['/allow-all', '/yolo'],
      subcommands: subcommands([
        ['/permissions default', '既定の権限モードに切り替えます。'],
        ['/permissions assisted', 'assisted権限モードに切り替えます。'],
        ['/permissions allow-all', 'ツール・パス・URLへの操作を一括許可します。'],
        ['/permissions show', '現在の権限モードを表示します。'],
        [
          '/permissions reset',
          '現在のセッション内のツールとパスの承認をリセットし、次回の利用で再確認します。',
        ],
      ]),
      examples: [
        {
          prompt: '/permissions show',
          description: '承認を変更せず、現在の権限モードを確認します。',
        },
        {
          prompt: '/allow-all show',
          description: '一括許可操作の別名を使って、現在の状態を確認します。',
        },
        {
          prompt: '/yolo show',
          description: 'もう一つの別名を使って、現在の状態を確認します。',
        },
      ],
      conditions: [
        '/allow-allと/yoloは、/permissions全体ではなく一括許可操作の別名です。',
        '別名の構文は/allow-all [off|auto|show]および/yolo [off|auto|show]です。',
      ],
      warnings: [
        'allow-allはツール・ファイルパス・URLへの権限を一括で許可します。意図しない実行、変更、外部アクセスの危険を理解したうえで利用してください。',
      ],
    },
  ),
  cli(
    '/plan',
    'コードを変更する前に実装計画を作成します。',
    'agents',
    '/plan APIの入力検証を共通化したい',
    '変更の目的を伝え、作業手順を検討します。',
    {
      syntax: '/plan [PROMPT]',
    },
  ),
  cli(
    '/plugin',
    'プラグインとマーケットプレイスを一覧・導入・更新・削除します。',
    'agents',
    '/plugin list',
    'インストール済みプラグインを確認します。',
    {
      subcommands: subcommands([
        [
          '/plugin install SOURCE',
          'マーケットプレイス、リポジトリ、git URL、ローカルパスから導入します。',
        ],
        ['/plugin update PLUGIN[@MARKETPLACE]', '指定したプラグインを更新します。'],
        ['/plugin uninstall PLUGIN[@MARKETPLACE]', '指定したプラグインを削除します。'],
        ['/plugin remove PLUGIN[@MARKETPLACE]', 'uninstallの別名です。'],
        ['/plugin rm PLUGIN[@MARKETPLACE]', 'uninstallの別名です。'],
        ['/plugin list', 'インストール済みの一覧を表示します。'],
        ['/plugin ls', 'listの別名です。'],
        ['/plugin marketplace add SOURCE', 'マーケットプレイスを追加します。'],
        ['/plugin marketplace remove NAME', 'マーケットプレイスの登録を削除します。'],
        ['/plugin marketplace list', '登録済みマーケットプレイスを表示します。'],
        ['/plugin marketplace browse NAME', 'マーケットプレイス内のプラグインを参照します。'],
        ['/plugin marketplace update [NAME]', '指定先またはすべてのカタログを再取得します。'],
        ['/plugin marketplace refresh [NAME]', 'marketplace updateの別名です。'],
      ]),
      conditions: [
        '引数なしで管理画面を開きます。MCPサーバーは/mcp、スキルは/skillsで管理します。',
        '一覧表示と管理画面以外のサブコマンドは、現在のターンが終わるまで実行できません。',
        '削除済みの実験的コマンド/pluginsとは異なります。',
      ],
      warnings: [
        '導入・更新する配布元を確認してください。プラグインは追加のツールや処理を提供し、削除は既存の作業構成に影響します。',
      ],
    },
  ),
  cli(
    '/pr',
    '現在のブランチのプルリクエストを確認・作成・修正し、必要ならマージまで進めます。',
    'collaboration',
    '/pr view',
    '変更を行う前に現在のPRを確認します。',
    {
      syntax: '/pr [view|create|fix|auto|automerge]',
      subcommands: subcommands([
        ['/pr view', '現在のブランチのPRを表示します。'],
        ['/pr create', 'PRを作成します。'],
        ['/pr fix', 'PRの問題に対処します。'],
        ['/pr auto', 'PRのチェックが成功するまで対応し、マージせず停止します。'],
        ['/pr automerge', 'PRのチェックが成功するまで対応し、マージします。'],
        ['/pr agentmerge', 'automergeの別名です。'],
      ]),
      conditions: ['現在のブランチのPRを対象にします。'],
      warnings: [
        'PR作成・修正はリモートへの変更を伴います。automergeとagentmergeはマージまで実行するため、対象と影響を確認してください。',
      ],
    },
  ),
  cli(
    '/refine',
    'ラフに書いたプロンプトを、確認しやすい明確な文章に整えます。',
    'documentation',
    '/refine テスト遅いので理由を調べたい',
    '送信前に依頼内容を整理します。',
    {
      syntax: '/refine TEXT',
      conditions: [
        '入力中にCtrl+Xに続けて/refineを実行すると、引数なしでも入力欄の文章を整えられます。',
      ],
    },
  ),
  cli(
    '/remote',
    'セッションのリモート操作状態を確認し、接続を有効化・終了します。',
    'collaboration',
    '/remote',
    'リモート操作の現在の状態を確認します。',
    {
      syntax: '/remote [on|off]',
      sourceIds: ['cli-command-reference', 'cli-command-source', 'cli-remote-control'],
      subcommands: subcommands([
        ['/remote on', 'リモートからの操作を有効にします。'],
        ['/remote off', 'リモート接続を終了します。'],
      ]),
      conditions: [
        '対話型CLIセッションで、実行元のマシンがオンラインである必要があります。',
        '組織・Enterpriseのポリシーにより利用可否が変わります。リモート画面でのスラッシュコマンドは利用できません。',
      ],
      warnings: [
        '有効化すると会話・ツール実行・権限要求などのイベントがGitHubへ送信されます。処理そのものは実行元のマシンで続きます。',
      ],
    },
  ),
  cli(
    '/research',
    'GitHubの検索とWeb資料を使い、指定したテーマを詳しく調査します。',
    'documentation',
    '/research このライブラリの互換性に関する公式情報を調べて',
    '調査対象と根拠の範囲を伝えます。',
    {
      syntax: '/research TOPIC',
      warnings: ['外部検索に送る情報と調査による利用量を確認してください。'],
    },
  ),
  cli(
    '/reset-allowed-tools',
    '許可済みツールの一覧をリセットします。',
    'settings',
    '/reset-allowed-tools',
    'それまでのツールの許可を見直します。',
  ),
  cli(
    '/restart',
    'CLIを再起動し、このプロセスで動作中のセッションを復元します。',
    'session',
    '/restart',
    '複数のセッションを引き継いでCLIを再起動します。',
    {
      conditions: [
        '再起動先が複数セッションの復元に対応しない場合、前面のセッションのみで続けるか中止するか確認されます。',
      ],
      warnings: ['前面以外のセッションも対象となります。進行中の作業を確認してください。'],
    },
  ),
  cli(
    '/resume',
    '一覧またはIDを使って、別のセッションへ切り替えます。',
    'session',
    '/resume',
    '再開するセッションを一覧から選びます。',
    {
      syntax: '/resume [SESSION-ID]',
      aliases: ['/continue'],
    },
  ),
  cli(
    '/review',
    'コードレビュー用エージェントで変更内容を分析します。',
    'testing',
    '/review エラー処理の抜けを重点的に確認して',
    'レビューで重視する観点を指定します。',
    {
      syntax: '/review [PROMPT]',
      warnings: [
        'エージェントの追加実行による利用量が発生します。指摘はコードとテストで確認してください。',
      ],
    },
  ),
  cli(
    '/rubber-duck',
    '計画、コード、テストについて別の観点から意見を得ます。',
    'testing',
    '/rubber-duck このキャッシュ戦略の弱点を指摘して',
    '設計の見落としがないか意見を求めます。',
    {
      syntax: '/rubber-duck [PROMPT]',
      warnings: ['別のエージェントへの相談による利用量が発生します。'],
    },
  ),
  cli(
    '/sandbox',
    'OSレベルのサンドボックスの設定、状態、実効ポリシーを管理します。',
    'settings',
    '/sandbox status',
    '隔離の状態を変更せず確認します。',
    {
      syntax: '/sandbox [config|status|policy|enable|disable]',
      status: 'experimental',
      subcommands: subcommands([
        ['/sandbox config', 'サンドボックス設定を開きます。'],
        ['/sandbox status', '有効・無効の状態を表示します。'],
        ['/sandbox policy', 'パス・ネットワークなどの実効ポリシーを表示します。'],
        ['/sandbox enable', 'サンドボックスを有効にします。'],
        ['/sandbox disable', 'サンドボックスを無効にします。'],
      ]),
      conditions: ['statusとpolicyは処理中でも参照できます。設定変更はターン終了まで待機します。'],
      warnings: [
        '無効化はファイル・ネットワークなどの隔離を弱めます。対象のOSや実効ポリシーを確認してください。',
      ],
    },
  ),
  cli(
    '/search',
    '会話のタイムラインを検索します。',
    'context',
    '/search 入力検証',
    '会話中の特定の話題を探します。',
    {
      syntax: '/search [QUERY]',
      aliases: ['/find'],
    },
  ),
  cli(
    '/security-review',
    '作業中のローカルコード変更を対象に、脆弱性と修正案を優先順位付きで調べます。',
    'testing',
    '/security-review 入力値の検証と認可を重点的に確認して',
    '現在の差分の中で重点的に見る観点を指定します。',
    {
      syntax: '/security-review [PROMPT]',
      conditions: [
        '現在のローカル変更を対象とするレビューで、リポジトリ全体のセキュリティ監査ではありません。',
      ],
      warnings: [
        '追加の利用量が発生します。問題が見つからなくても安全性が保証されたわけではありません。',
      ],
    },
  ),
  cli(
    '/session',
    'セッションの情報、履歴上のチェックポイント、関連ファイルなどを確認・管理します。',
    'session',
    '/session info',
    '現在のセッションの詳細を確認します。',
    {
      syntax:
        '/session [info|checkpoints [n]|files|plan|rename [NAME]|cleanup|prune|delete [ID]|delete-all]',
      aliases: ['/sessions', '/rename'],
      subcommands: subcommands([
        ['/session info', 'セッション情報と、利用可能ならセッションリンクを表示します。'],
        ['/session checkpoints [n]', 'チェックポイントを確認します。'],
        ['/session files', 'セッションに関係するファイルを確認します。'],
        ['/session plan', 'セッションの計画を確認します。'],
        ['/session rename [NAME]', 'セッションを改名します。省略時は名前を自動生成します。'],
        ['/session cleanup', 'セッションのクリーンアップを行います。'],
        ['/session prune', 'セッションの整理を行います。'],
        ['/session delete [ID]', '対象のセッションを削除します。'],
        ['/session delete-all', 'セッションをまとめて削除します。'],
      ]),
      examples: [
        { prompt: '/session info', description: '現在のセッションの詳細を確認します。' },
        {
          prompt: '/rename 入力検証の見直し',
          description: 'renameサブコマンドの別名を使い、セッションに名前を付けます。',
        },
      ],
      conditions: ['/rename [NAME]は/session全体ではなく/session rename [NAME]の別名です。'],
      warnings: [
        'cleanup・prune・delete・delete-allを実行する前に対象と保存したい情報を確認してください。特にdelete-allは一括削除です。',
      ],
    },
  ),
  cli(
    '/settings',
    '設定画面を開くか、キーを指定して設定の参照・変更を行います。',
    'settings',
    '/settings show model',
    'モデル設定の現在値を確認します。',
    {
      syntax: '/settings [--repo|--local] [show KEY|KEY|KEY VALUE]',
      aliases: ['/config'],
      subcommands: subcommands([
        [
          '/settings show KEY',
          '設定の現在値を表示します。秘密情報の名前を持つ値はマスクされます。',
        ],
        ['/settings KEY', '指定キーの設定画面を開きます。'],
        ['/settings KEY VALUE', '指定キーをその場で変更します。'],
      ]),
      conditions: [
        '--repoは.github/copilot/settings.json、--localは.github/copilot/settings.local.jsonを対象にします。リポジトリで上書きできるキーのみ変更できます。',
        '管理ポリシーで制御された設定は読み取り専用です。',
      ],
      warnings: [
        '設定スコープにより他のセッションにも影響します。値がマスクされる機能があっても、共有する出力は確認してください。',
      ],
    },
  ),
  cli(
    '/share',
    'セッションや調査結果をリンク、ファイル、gistとして共有・書き出しします。',
    'collaboration',
    '/share file session .\\session-notes.md',
    '共有前の確認用にローカルのMarkdownへ出力します。',
    {
      syntax: '/share [link|off|file|html|gist|research] [...]',
      aliases: ['/export'],
      sourceIds: [
        'cli-command-reference',
        'cli-command-source',
        'cli-chronicle-guide',
        'gist-visibility',
      ],
      subcommands: subcommands([
        ['/share link', '共有リンクを生成します。'],
        ['/share off', '共有を停止します。'],
        ['/share link off', 'リンク共有を停止します。'],
        ['/share file [session|research] [PATH]', 'Markdownファイルへ書き出します。'],
        ['/share html [session|research] [PATH]', 'HTMLファイルへ書き出します。'],
        ['/share gist [session|research]', 'GitHub gistを作成します。'],
        ['/share research [PATH]', '調査レポートを書き出します。'],
      ]),
      conditions: [
        '引数なしでは、ログイン済みかつ同期済みなら共有リンクを生成し、そうでなければMarkdownファイルへの出力に切り替わります。',
        'gistはEnterprise Managed Usersおよびデータレジデンシー対応のGitHub Enterprise Cloud（*.ghe.com）では利用できません。',
      ],
      warnings: [
        '会話、コード、ファイルパスなどが外部に共有される可能性があります。出力先と閲覧範囲を確認し、機密情報を除いてください。',
        'secret gistもURLを知る人から閲覧できるため、非公開の保管先とは扱わないでください。',
      ],
    },
  ),
  cli(
    '/skills',
    'スキルの一覧、詳細、導入、削除、再読み込みを管理します。',
    'agents',
    '/skills list',
    '現在利用可能なスキルを確認します。',
    {
      subcommands: subcommands([
        ['/skills list', '利用可能なスキルを一覧表示します。'],
        ['/skills info NAME', '指定したスキルの詳細を表示します。'],
        [
          '/skills add [--project] <FILE|URL|DIRECTORY>',
          'ファイル・URL・ディレクトリからスキルを追加します。',
        ],
        [
          '/skills remove <NAME|DIRECTORY>',
          'スキルを削除するか、カスタムディレクトリの登録を解除します。',
        ],
        ['/skills reload', 'すべてのディレクトリからスキルを再読み込みします。'],
      ]),
      conditions: [
        '引数なしではSkillsタブを開きます。ファイル・URLから導入する際の--projectは、保存先をユーザー単位ではなくリポジトリ単位にします。',
      ],
      warnings: [
        '導入するスキルの指示と同梱コードを確認してください。追加・削除は以後の作業に影響します。',
      ],
    },
  ),
  cli(
    '/statusline',
    'ステータス行に表示する項目を設定します。',
    'settings',
    '/statusline',
    '必要な利用状況などをステータス行に表示します。',
    {
      aliases: ['/footer'],
    },
  ),
  cli(
    '/subagents',
    'サブエージェント用モデルの既定値とエージェント別設定を管理します。',
    'agents',
    '/subagents',
    '委任先で使うモデル設定を確認します。',
    {
      aliases: ['/agents'],
      conditions: [
        'modelPolicyがrequiredの場合はモデル変更が制限されます。エージェント定義が必須指定している場合は選択画面で上書きできません。',
      ],
      warnings: ['モデル設定はサブエージェントの利用量や処理特性に影響します。'],
    },
  ),
  cli(
    '/tasks',
    'サブエージェントやシェルコマンドのタスクを確認・管理します。',
    'agents',
    '/tasks',
    '進行中の委任処理を確認します。',
    {
      warnings: [
        '管理画面からタスクを停止する場合は、途中の処理やファイル変更への影響を確認してください。',
      ],
    },
  ),
  cli(
    '/terminal-setup',
    '複数行入力を使うためのターミナル設定を行います。',
    'settings',
    '/terminal-setup',
    'Shift+EnterやCtrl+Enterによる入力に備えて設定します。',
    {
      warnings: ['ターミナルの既存のキー割り当てとの競合を確認してください。'],
    },
  ),
  cli(
    '/theme',
    '表示のカラーモードを確認・変更します。',
    'settings',
    '/theme high-contrast',
    '見分けやすい高コントラスト表示に切り替えます。',
    {
      syntax: '/theme [default|github|dim|high-contrast|colorblind]',
    },
  ),
  cli(
    '/tuikit',
    'TUIkitの表示部品やカラートークンをプレビューします。',
    'settings',
    '/tuikit colors',
    '色の表示を確認します。',
    {
      syntax: '/tuikit [colors|icons|select|tabbar]',
    },
  ),
  cli(
    '/undo',
    '以前のユーザーターンへ戻すための選択画面を開きます。',
    'session',
    '/undo',
    '戻したい時点と、ファイルも復元するかを選びます。',
    {
      aliases: ['/rewind'],
      conditions: [
        '会話だけを戻すか、会話とCopilotが変更したファイルを戻すかを選択します。Gitは必須ではありません。自分で後から編集したファイルは復元対象から除外されます。',
      ],
      warnings: [
        'ファイルを含める選択では、破棄するターンの変更が戻されます。対象と必要な成果を確認してください。',
      ],
    },
  ),
  cli(
    '/update',
    'CLIを最新バージョンへ更新します。',
    'settings',
    '/update',
    '配布されている最新CLIに更新します。',
    {
      aliases: ['/upgrade'],
      warnings: ['実行環境が変更されます。互換性と作業中のセッションへの影響を確認してください。'],
    },
  ),
  cli(
    '/usage',
    'セッションの利用状況、モデルごとのトークン量などを表示します。',
    'settings',
    '/usage',
    '現在のセッションの使用量を確認します。',
    {
      conditions: [
        'トークン従量課金のアカウントでは、モデルごとのAI Credits使用量も表示されます。',
      ],
    },
  ),
  cli(
    '/user',
    '現在のGitHubユーザーを表示し、アカウントを切り替えます。',
    'settings',
    '/user show',
    '現在のアカウントを確認します。',
    {
      syntax: '/user [show|list|switch]',
      subcommands: subcommands([
        ['/user show', '現在のユーザーを表示します。'],
        ['/user list', 'ユーザーの一覧を表示します。'],
        ['/user switch', '使用するユーザーを切り替えます。'],
      ]),
      warnings: ['切り替え先の権限や利用枠が作業に適切か確認してください。'],
    },
  ),
  cli(
    '/version',
    'バージョン情報を表示し、更新の有無を確認します。',
    'settings',
    '/version',
    '現在利用しているCLIのバージョンを確認します。',
  ),
  cli(
    '/vim',
    '入力欄のVim方式のモーダル編集を切り替えます。',
    'settings',
    '/vim',
    '入力時にVim形式のキー操作を利用します。',
  ),
  cli(
    '/voice',
    '音声モード、音声モデル、マイクなどの入力機器を管理します。',
    'settings',
    '/voice devices',
    '使用する音声入力機器を確認します。',
    {
      syntax: '/voice [on|off|models|devices]',
      subcommands: subcommands([
        ['/voice on', '音声モードを有効にします。'],
        ['/voice off', '音声モードを無効にします。'],
        ['/voice models', '利用できる音声モデルを確認します。'],
        ['/voice devices', '入力デバイスを選択します。'],
      ]),
      warnings: ['周囲の会話や機密情報が音声入力に混ざらないよう確認してください。'],
    },
  ),
  cli(
    '/fork',
    '現在のセッションから新しいセッションを分岐します。',
    'session',
    '/fork 別の実装案',
    '別案の検討用に名前を付けて分岐します。',
    {
      syntax: '/fork [NAME]',
      aliases: ['/branch'],
    },
  ),
  cli(
    '/worktree',
    '新しいGit worktreeを作って移動するか、新しい会話をその中で開始します。',
    'session',
    '/worktree new 検索の性能を調べて',
    '元の会話を残して新しいworktreeで調査を始めます。',
    {
      syntax: '/worktree [branch|task]',
      subcommands: subcommands([
        [
          '/worktree new [PROMPT]',
          '現在の会話と作業場所を維持したまま、新しいworktreeで会話を始めます。',
        ],
      ]),
      conditions: [
        'Gitリポジトリが必要です。通常の/worktreeは未コミットの変更を元のworktreeに残します。',
        '既定では現在のHEADから分岐します。worktreeBaseRef設定でリモートの既定ブランチを基点にできます。newは予約されたサブコマンド名です。',
      ],
      warnings: [
        '新しいブランチと作業ディレクトリが作られます。必要なディスク容量と作業場所を確認してください。',
      ],
    },
  ),
  cli(
    '/move',
    '未コミットの変更を新しいGit worktreeへ移し、その作業場所へ切り替えます。',
    'session',
    '/move isolate-validation',
    '現在の変更を専用のworktreeへ移します。',
    {
      syntax: '/move [branch|task]',
      conditions: [
        'Gitリポジトリが必要です。ブランチ名やタスクを省略すると会話から名前を生成します。',
      ],
      warnings: ['未コミット変更の場所が変わります。元の作業場所と移動先を確認してください。'],
    },
  ),
];
