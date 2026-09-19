import type { CommandRecord } from '../catalog/types';
import { commandBuilder, subcommands } from './builders';

const vscode = commandBuilder('vscode', 'チャット（画面・セッションに依存）', [
  'vscode-ai-reference',
]);
const visualStudio = commandBuilder('visual-studio', 'IDEチャット', ['github-chat-visual-studio']);
const jetbrains = commandBuilder('jetbrains', 'IDEチャット', ['github-chat-jetbrains']);
const xcode = commandBuilder('xcode', 'IDEチャット', ['github-chat-xcode']);
const web = commandBuilder('github-web', 'GitHub.comのCopilot Chat', ['github-chat-web']);

const localAgent = {
  sessionKind: 'ローカルのエージェントセッション',
  conditions: ['ローカルのエージェントセッションで使用します。'],
};
const supportedLocalOrCli = {
  sessionKind: '対応するローカル / Copilot CLIセッション',
  conditions: ['この操作に対応したローカルまたはCopilot CLIセッションが必要です。'],
};
const jetbrainsCli = {
  sessionKind: 'JetBrains内の対話型Copilot CLIセッション',
  conditions: [
    'JetBrains内で実行する対話型Copilot CLIセッション限定です。',
    '通常のJetBrains IDEチャット用コマンドとしては掲載していません。',
  ],
};

export const ideCommands: CommandRecord[] = [
  vscode(
    '/doc',
    '選択したコードのドキュメントコメントを生成します。',
    'documentation',
    '/doc',
    '対象コードを選び、エディターのインラインチャットで実行します。',
    {
      sessionKind: 'エディターのインラインチャット',
      conditions: ['エディターのインラインチャットで使用します。'],
    },
  ),
  vscode(
    '/explain',
    'コードブロック、ファイル、プログラミング上の概念を説明します。',
    'documentation',
    '/explain この関数のエラー処理を説明して',
    '注目したい観点を添えて説明を依頼します。',
  ),
  vscode(
    '/fix',
    'コードの問題やコンパイラー・lintのエラーの修正を依頼します。',
    'coding',
    '/fix この関数の型エラーを修正して',
    '対象のコードとエラーを確認したうえで修正を依頼します。',
  ),
  vscode(
    '/tests',
    'エディター内の関数やメソッドを対象にテストを生成します。',
    'testing',
    '/tests 境界値と空配列のケースを追加して',
    '選択した処理に必要なテスト観点を指定します。',
  ),
  vscode(
    '/setupTests',
    'テストフレームワークの選択、設定手順、関連する拡張機能の案内を得ます。',
    'testing',
    '/setupTests',
    '現在のコードに合うテスト環境のセットアップを相談します。',
    {
      status: 'experimental',
      warnings: [
        '提案に従って導入する前に、既存のテスト構成や依存関係との整合を確認してください。',
      ],
    },
  ),
  vscode(
    '/fixTestFailure',
    '失敗しているテストの原因を調べ、修正を依頼します。',
    'testing',
    '/fixTestFailure',
    'テスト失敗の情報を用意して原因調査と修正を依頼します。',
    {
      sourceIds: ['github-chat-vscode'],
      conditions: [
        'GitHubのVS Code向けチートシートで確認した項目です。現在のセッションの候補に表示されるか確認してください。',
      ],
    },
  ),
  vscode(
    '/clear',
    '新しいチャットを開始し、現在のチャットをアーカイブまたは完了扱いにします。',
    'session',
    '/clear',
    '話題を切り替えて新しいチャットを開始します。',
  ),
  vscode(
    '/help',
    'そのチャットで利用できるエージェントとスラッシュコマンドを表示します。',
    'documentation',
    '/help',
    'ローカルのAskチャットで候補を確認します。',
    {
      sessionKind: 'ローカルのAskチャット',
      conditions: ['ローカルのAskチャットで使用します。'],
    },
  ),
  vscode(
    '/rename',
    '現在のローカルチャットの名前を変更します。',
    'session',
    '/rename 認証エラーの調査',
    '後で探しやすい名前を付けます。',
    {
      syntax: '/rename <name>',
      sessionKind: 'ローカルチャット',
      conditions: ['現在のローカルチャットが対象です。'],
    },
  ),
  vscode(
    '/compact',
    '会話のコンテキストを圧縮し、長いセッションの使用量を減らします。',
    'context',
    '/compact',
    '会話が長くなったときにコンテキストを圧縮します。',
    {
      sessionKind: '対応するエージェントセッション',
      conditions: ['コンテキスト圧縮に対応したエージェントセッションが必要です。'],
      warnings: [
        '要約によって会話の細部が省かれる可能性があります。重要な制約は確認してください。',
      ],
    },
  ),
  vscode(
    '/fork',
    '会話履歴を引き継いだ独立したチャットセッションを作ります。',
    'session',
    '/fork',
    '現在までの会話を起点に別の検討を始めます。',
  ),
  vscode(
    '/debug',
    'チャットのログ調査に使うChat Debugビューを表示します。',
    'settings',
    '/debug',
    '期待と異なる応答の調査にログ表示を開きます。',
    {
      sessionKind: 'Chatビュー',
      conditions: ['Chatビューから使用します。Agentsウィンドウでは利用できません。'],
      warnings: ['ログを共有する場合は、コードや個人情報などが含まれていないか確認してください。'],
    },
  ),
  vscode(
    '/troubleshoot',
    'エージェントのデバッグログの分析をAIに依頼します。',
    'settings',
    '/troubleshoot ツール呼び出しが失敗した原因を調べて',
    '調査したい症状を添えます。',
    {
      sessionKind: 'ローカル / Copilot CLIセッション',
      conditions: [
        'ローカルまたはCopilot CLIセッションで使用します。#sessionで別のセッションも選択できます。',
      ],
      warnings: ['分析対象のログに機密情報が含まれていないか確認してください。'],
    },
  ),
  vscode(
    '/models',
    'モデル選択画面を開きます。',
    'settings',
    '/models',
    'このセッションで選べるモデルを確認します。',
  ),
  vscode(
    '/tools',
    'ローカルチャットで使うツールを設定します。',
    'settings',
    '/tools',
    'タスクに必要なツールを選びます。',
    {
      sessionKind: 'ローカルチャット',
      conditions: ['ローカルチャットセッションで使用します。'],
      warnings: ['有効にするツールのアクセス先と副作用を確認してください。'],
    },
  ),
  vscode(
    '/new',
    '要件に沿って新しいワークスペースまたはファイルのひな形を作ります。',
    'coding',
    '/new TypeScriptで小さな日記アプリを作りたい',
    '必要なプロジェクトを自然言語で説明します。',
    {
      warnings: ['作成前にプレビューで生成内容と保存先を確認してください。'],
    },
  ),
  vscode(
    '/newNotebook',
    '要件に沿ったJupyter Notebookのひな形を作ります。',
    'coding',
    '/newNotebook 月次売上データを集計して可視化したい',
    'Notebookに含めたい処理を説明します。',
  ),
  vscode(
    '/init',
    'プロジェクトの構造や実装パターンを基に、ワークスペースの指示を生成・更新します。',
    'agents',
    '/init',
    'リポジトリに合うCopilot向け指示を整えます。',
    {
      ...localAgent,
      warnings: [
        'copilot-instructions.mdやAGENTS.mdなどの変更案を確認し、既存の規則を保持してください。',
      ],
    },
  ),
  vscode(
    '/plan',
    '調査、実装手順、検証、判断事項を含む実装計画を作成します。',
    'agents',
    '/plan 検索画面にページネーションを追加したい',
    '複数段階の変更について実装前の計画を依頼します。',
    {
      sessionKind: '対応するエージェントセッション',
      conditions: ['計画作成に対応したエージェントセッションが必要です。'],
    },
  ),
  vscode(
    '/search',
    '自然言語で説明した条件をSearchビュー用の検索クエリにします。',
    'context',
    '@vscode /search TypeScriptの未使用TODOを探したい',
    '検索の目的を@vscode参加者に伝えます。',
    {
      syntax: '@vscode /search 検索したい内容',
      sessionKind: '@vscode参加者のチャット',
      conditions: ['@vscode参加者に続けて指定するコマンドです。'],
    },
  ),
  vscode(
    '/agents',
    'カスタムエージェントの設定を開きます。',
    'agents',
    '/agents',
    '利用するカスタムエージェントを設定します。',
  ),
  vscode(
    '/hooks',
    'フックの設定を開きます。',
    'settings',
    '/hooks',
    'イベントに応じて実行するフックの設定を確認します。',
    {
      warnings: ['フックが実行する処理と適用範囲を確認してください。'],
    },
  ),
  vscode(
    '/instructions',
    'カスタム指示の設定を開きます。',
    'agents',
    '/instructions',
    'Copilotに渡す指示を設定します。',
  ),
  vscode(
    '/prompts',
    '再利用するプロンプトファイルの設定を開きます。',
    'agents',
    '/prompts',
    '定型タスク用のプロンプトを設定します。',
  ),
  vscode(
    '/skills',
    'エージェントスキルの設定を開きます。',
    'agents',
    '/skills',
    '利用するスキルを設定します。',
  ),
  vscode(
    '/create-prompt',
    '再利用できるプロンプトファイルを生成します。',
    'agents',
    '/create-prompt リリースノートをまとめるプロンプトを作って',
    '繰り返す作業の内容を伝えます。',
    localAgent,
  ),
  vscode(
    '/create-instructions',
    '開発方針などを記した指示ファイルを生成します。',
    'agents',
    '/create-instructions このプロジェクトのテスト方針を整理して',
    '指示に残す対象を指定します。',
    localAgent,
  ),
  vscode(
    '/create-skill',
    '専門的な手順をまとめたエージェントスキルを生成します。',
    'agents',
    '/create-skill 変更内容から検証項目を選ぶスキルを作って',
    'スキルに担当させる作業を説明します。',
    localAgent,
  ),
  vscode(
    '/create-agent',
    '役割に応じたカスタムエージェントを生成します。',
    'agents',
    '/create-agent 読み取り専用で設計を調べるエージェントを作って',
    '役割と制約を指定します。',
    localAgent,
  ),
  vscode(
    '/create-hook',
    'イベントに応じて動くフックの設定を生成します。',
    'settings',
    '/create-hook 作業完了時に通知するフックを作って',
    'フックの実行タイミングと処理を説明します。',
    {
      ...localAgent,
      warnings: ['生成された実行コマンドと副作用を確認してから利用してください。'],
    },
  ),
  vscode(
    '/yolo',
    '現在のセッションを、承認を省略する権限レベルへ切り替えます。',
    'settings',
    '/yolo',
    '承認省略の影響を理解したうえでセッションを切り替えます。',
    {
      ...supportedLocalOrCli,
      aliases: ['/autoApprove'],
      warnings: [
        '操作ごとの承認が省略されます。ファイル変更やコマンド実行などの副作用を事前に確認してください。',
      ],
    },
  ),
  vscode(
    '/disableYolo',
    '現在のセッションの権限レベルを既定に戻します。',
    'settings',
    '/disableYolo',
    '承認省略を終えて既定の権限レベルに戻します。',
    {
      ...supportedLocalOrCli,
      aliases: ['/disableAutoApprove'],
    },
  ),
  vscode(
    '/autopilot',
    '現在のセッションでAutopilotを有効にします。',
    'agents',
    '/autopilot',
    '自律的な継続実行へ切り替えます。',
    {
      ...supportedLocalOrCli,
      warnings: [
        '継続するツール実行やコード変更、追加の利用量に注意し、作業範囲を限定してください。',
      ],
    },
  ),
  vscode(
    '/exitAutopilot',
    'Autopilotを終了し、権限レベルを既定に戻します。',
    'agents',
    '/exitAutopilot',
    '自律的な継続実行から戻ります。',
    supportedLocalOrCli,
  ),

  visualStudio(
    '/doc',
    '対象シンボルのドキュメントコメントを追加します。',
    'documentation',
    '/doc',
    'コメントを追加したいシンボルを指定して実行します。',
  ),
  visualStudio(
    '/explain',
    'アクティブなエディター内のコードの動作を説明します。',
    'documentation',
    '/explain 非同期処理の流れを説明して',
    '開いているコードの理解したい点を伝えます。',
  ),
  visualStudio(
    '/fix',
    '選択したコードの問題に対する修正案を提示します。',
    'coding',
    '/fix nullを受け取ったときのエラーを直して',
    '選択したコードの問題を説明します。',
  ),
  visualStudio(
    '/help',
    'Copilotの基本的な使い方とクイックリファレンスを表示します。',
    'documentation',
    '/help',
    'IDEでの使い方を確認します。',
  ),
  visualStudio(
    '/optimize',
    '選択したコードの実行時間を分析し、改善を提案します。',
    'coding',
    '/optimize このループの実行時間を改善して',
    '性能を確認したいコードを選択して依頼します。',
    {
      warnings: ['改善案は実際の入力と計測結果で検証してください。'],
    },
  ),
  visualStudio(
    '/tests',
    '選択したコードの単体テストを生成します。',
    'testing',
    '/tests 不正な入力のテストを追加して',
    '対象コードと必要なケースを指定します。',
  ),

  jetbrains(
    '/explain',
    'アクティブなエディター内のコードの動作を説明します。',
    'documentation',
    '/explain このクラスの責務を説明して',
    '対象コードを開いて説明を依頼します。',
  ),
  jetbrains(
    '/fix',
    '選択したコードの問題に対する修正案を提示します。',
    'coding',
    '/fix リソースが解放されない問題を直して',
    '選択した処理の問題を伝えます。',
  ),
  jetbrains(
    '/help',
    'Copilotの基本的な使い方とクイックリファレンスを表示します。',
    'documentation',
    '/help',
    'JetBrainsでの使い方を確認します。',
  ),
  jetbrains(
    '/tests',
    '選択したコードの単体テストを生成します。',
    'testing',
    '/tests 空の入力と重複する入力を検証して',
    '対象のコードとテスト観点を指定します。',
  ),
  jetbrains(
    '/chronicle',
    'CLIセッションの履歴を振り返り、検索や改善の提案に利用します。',
    'session',
    '/chronicle standup',
    'CLIセッションの作業履歴から振り返りを作ります。',
    {
      ...jetbrainsCli,
      syntax: '/chronicle <standup|tips|search|improve>',
      sourceIds: ['github-chat-jetbrains', 'cli-chronicle-guide'],
      conditions: [
        ...jetbrainsCli.conditions,
        'improveが分析する履歴は、現在のリポジトリまたは作業ディレクトリのものに限られます。',
      ],
      subcommands: subcommands([
        ['/chronicle standup', '最近の作業の振り返りをまとめます。'],
        ['/chronicle tips', '履歴に基づく作業上の助言を得ます。'],
        ['/chronicle search', 'セッションの履歴を検索します。'],
        ['/chronicle improve', '指示の改善案を得ます。'],
      ]),
      warnings: ['履歴に含まれるコードや会話の取り扱いに注意してください。'],
    },
  ),
  jetbrains(
    '/compact',
    '現在のCLIセッションのコンテキストを圧縮します。',
    'context',
    '/compact',
    '長くなったCLIセッションのコンテキストを整理します。',
    {
      ...jetbrainsCli,
      warnings: ['要約で省かれた細部や重要な制約を確認してください。'],
    },
  ),
  jetbrains(
    '/remote',
    'CLIセッションのリモート操作を有効化・管理します。',
    'collaboration',
    '/remote',
    '現在のCLIセッションのリモート操作状態を確認します。',
    {
      ...jetbrainsCli,
      sourceIds: ['github-chat-jetbrains', 'cli-remote-control'],
      conditions: [
        ...jetbrainsCli.conditions,
        '実行元のマシンがオンラインである必要があります。組織・Enterpriseのポリシーにより利用可否が変わります。',
      ],
      warnings: [
        '有効化すると会話やツール実行などのセッションイベントがGitHubへ送信されます。リモート画面ではスラッシュコマンドは使えません。',
      ],
    },
  ),

  xcode(
    '/doc',
    '対象シンボルのドキュメントを生成します。',
    'documentation',
    '/doc',
    '説明を追加したいシンボルを指定して実行します。',
  ),
  xcode(
    '/explain',
    '選択したコードの処理内容を説明します。',
    'documentation',
    '/explain この状態更新の流れを説明して',
    '対象コードを選択し、理解したい点を伝えます。',
  ),
  xcode(
    '/fix',
    'コードのエラーやタイプミスの修正を提案します。',
    'coding',
    '/fix この型エラーを直して',
    'エラーが発生するコードを選択して依頼します。',
  ),
  xcode(
    '/simplify',
    '選択したコードを簡潔にする案を提示します。',
    'coding',
    '/simplify この条件分岐を読みやすくして',
    '簡略化したいコードを選択します。',
    {
      warnings: ['簡略化の前後で振る舞いが保たれていることを検証してください。'],
    },
  ),
  xcode(
    '/tests',
    '選択したコードの単体テストを作成します。',
    'testing',
    '/tests 日付の境界条件を検証して',
    '選択した処理のテスト観点を指定します。',
  ),

  web(
    '/clear',
    '現在の会話をクリアします。',
    'session',
    '/clear',
    '現在の会話内容をクリアします。',
    {
      warnings: ['継続に必要な情報は、会話をクリアする前に保存してください。'],
    },
  ),
  web('/delete', '会話を削除します。', 'session', '/delete', '不要になった会話を削除します。', {
    warnings: ['会話を削除する操作です。対象と保存しておく情報を事前に確認してください。'],
  }),
  web('/new', '新しい会話を開始します。', 'session', '/new', '別の話題で会話を始めます。'),
  web(
    '/rename',
    '会話の名前を変更します。',
    'session',
    '/rename',
    '会話名を変更する操作を開始します。',
  ),
];
