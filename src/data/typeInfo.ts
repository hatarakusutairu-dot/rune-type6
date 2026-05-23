export interface TypeInfo {
  id: string;
  name: string;
  nameEn: string;
  catchcopy: string;
  color: string;
  description: string;
  motivators: string[];
  demotivators: string[];
  goodSigns: string[];
  badSigns: string[];
  helpfulActions: string;
  teamValue: string;
  overdone: string;
  innerVoice?: string;
}

export const typeInfo: Record<string, TypeInfo> = {
  // ───────── ワーク1：ゲーマータイプ ─────────
  competitor: {
    id: 'competitor',
    name: 'コンペティター',
    nameEn: 'Competitor',
    catchcopy: '勝ってナンボ',
    color: '#FF4444',
    description: '勝つこと・他者との競争に価値を見出すタイプ。強い相手との対戦が一番のごほうび。',
    motivators: ['「お前がエースだ」', '「勝負どころ任せた」', '「強いね、本物だ」'],
    demotivators: ['「もっと周り見て」', '「無理するな」', '「ガチすぎ」'],
    goodSigns: ['ランクが上がっていく実感がある', '強い相手との対戦に燃える'],
    badSigns: ['弱い相手に勝っても満たされない', 'ランクが落ちるとモチベが消える'],
    helpfulActions: '「次の相手は格上だぞ」と勝負の刺激を与えてあげると最大限のパフォーマンスを出す',
    teamValue: 'チームに「勝ち」を意識させる原動力。試合で一番熱く向かっていく存在',
    overdone: '周りが見えなくなる・チームが置いていかれる',
  },
  achiever: {
    id: 'achiever',
    name: 'アチーバー',
    nameEn: 'Achiever',
    catchcopy: 'やり込んでこそ',
    color: '#FFD700',
    description: '上達・達成感・コンプリートに価値を見出すタイプ。コツコツ積み上げて成長する。',
    motivators: ['「上手くなったね」', '「練習の成果出てる」', '「コンプリートおめでとう」'],
    demotivators: ['「才能じゃない？」', '「やり込みすぎ」', '「もう十分でしょ」'],
    goodSigns: ['確実に上達している実感がある', '練習が苦じゃなく続く'],
    badSigns: ['練習しても伸びない焦り', '自己評価が下がっていく'],
    helpfulActions: '結果より過程を認める。「ここまで来たね」とプロセスを言語化してあげる',
    teamValue: 'チームの技術レベルを底上げする職人。地道な貢献で全員のベースを引き上げる',
    overdone: '完璧主義になりすぎて動けなくなる',
  },
  socializer: {
    id: 'socializer',
    name: 'ソーシャライザー',
    nameEn: 'Socializer',
    catchcopy: '一緒にやるから楽しい',
    color: '#00E676',
    description: '仲間との関わり・楽しい雰囲気に価値を見出すタイプ。誰とやるかが何より大事。',
    motivators: ['「一緒にやろう」', '「お前といると楽しい」', '「またやろうね」'],
    demotivators: ['「一人でやれよ」', '「真面目にやれ」', '「ベタベタするな」'],
    goodSigns: ['チームの会話が増える', '笑い声が出ている時間が長い'],
    badSigns: ['チームがバラバラだとやる気が消える', '一人プレイ時間が続くとしんどい'],
    helpfulActions: 'ボイスチャットや雑談に巻き込む。誘うと喜んでくる',
    teamValue: 'チームを「集団」にまとめる粘着剤。空気感のベースを作る',
    overdone: '楽しさ優先で真剣な場面を軽くしすぎる',
  },
  explorer: {
    id: 'explorer',
    name: 'エクスプローラー',
    nameEn: 'Explorer',
    catchcopy: '知らないことを知りたい',
    color: '#448AFF',
    description: '新しい発見・未知の探求に価値を見出すタイプ。誰も知らないものを見つけたい。',
    motivators: ['「その発想すごい」', '「よく見つけたね」', '「面白い視点」'],
    demotivators: ['「普通にやって」', '「定石でいい」', '「奇をてらうな」'],
    goodSigns: ['新しい発見でテンションが上がる', 'マップや仕様を細部まで知っている'],
    badSigns: ['同じことの繰り返しでつまらなくなる', '既知のことばかりで飽きる'],
    helpfulActions: '「次は何を試してみる？」と探索の余白を残してあげる',
    teamValue: 'チームに新しい風を入れる。マンネリを防ぎ、メタの変化に強い',
    overdone: '試したい気持ちで定石を外しすぎる',
  },

  // ───────── ワーク2：危機対応タイプ ─────────
  attacker: {
    id: 'attacker',
    name: 'アタッカー',
    nameEn: 'Attacker',
    catchcopy: '前に出るタイプ',
    color: '#FF6D00',
    description: '困難に対して直接的・能動的に立ち向かう傾向。ピンチで攻めに転じる頼もしさ。',
    motivators: ['「お前の突破力に賭けてる」', '「攻めていこう」', '「いけ！」'],
    demotivators: ['「落ち着け」', '「攻めすぎ」', '「無理するな」'],
    goodSigns: ['ピンチで前に出る勇気がある', '攻めのコールが増える'],
    badSigns: ['攻めても通らない焦り', '守りが続くとイライラする'],
    helpfulActions: '攻める場面を明確にして、思い切り行かせる。タイミングをチームで共有',
    teamValue: 'ピンチを切り開く突破口。チームに勝ちの可能性を提示する',
    overdone: 'チーム作戦を無視して単独で突っ込む',
    innerVoice: 'ピンチほど燃える。任せておけ。',
  },
  guardian: {
    id: 'guardian',
    name: 'ガーディアン',
    nameEn: 'Guardian',
    catchcopy: '守って安定',
    color: '#00BCD4',
    description: 'リスクを最小化し安定を維持しようとする傾向。チームの土台を支える堅実さ。',
    motivators: ['「安定感やばい」', '「お前がいると崩れない」', '「いつも助かってる」'],
    demotivators: ['「もっと攻めて」', '「リスク取れ」', '「守りすぎ」'],
    goodSigns: ['ミスが減る・崩れない', 'チームの土台が安定している'],
    badSigns: ['守りに入りすぎて流れを失う', '自己否定が始まる'],
    helpfulActions: '「ここは攻めるべき」とリスクを取る場面を共有する',
    teamValue: 'チームの土台。崩れない安心感を担う、見えない貢献の主役',
    overdone: '慎重すぎてチャンスを逃す',
    innerVoice: '派手じゃなくても、確実に守る。',
  },
  analyst: {
    id: 'analyst',
    name: 'アナリスト',
    nameEn: 'Analyst',
    catchcopy: '冷静に読む',
    color: '#AA00FF',
    description: '情報収集・分析によって状況を理解してから行動する傾向。冷静な判断力が武器。',
    motivators: ['「分析すごい」', '「その視点なかった」', '「考えてくれてありがとう」'],
    demotivators: ['「考えすぎ」', '「感覚でやれよ」', '「理屈っぽい」'],
    goodSigns: ['判断が的確になっている', 'データに裏付けのある発言ができる'],
    badSigns: ['分析に時間をかけすぎて行動が遅れる', '一人で考え込んでしまう'],
    helpfulActions: '分析を共有してチームで活かす場を作る。意見を引き出してあげる',
    teamValue: 'チームの司令塔。冷静な判断でピンチを乗り越える頭脳',
    overdone: '行動より分析が優先になる',
    innerVoice: '冷静に状況を見れば、必ず勝ち筋はある。',
  },
  booster: {
    id: 'booster',
    name: 'ブースター',
    nameEn: 'Booster',
    catchcopy: '空気をつくる',
    color: '#FF4081',
    description: '感情面でのサポートと雰囲気づくりで状況を改善する傾向。チームの空気の生命線。',
    motivators: ['「お前がいてチームが回ってる」', '「いつもありがとう」', '「明るいの大事」'],
    demotivators: ['「軽い」', '「真面目にやれ」', '「ノリだけじゃダメ」'],
    goodSigns: ['チームの空気が良くなる', 'みんなの表情がやわらぐ'],
    badSigns: ['チームの空気が悪いと自分まで沈む', '一人で疲れを抱え込む'],
    helpfulActions: '「お前は大丈夫？」とブースター本人もケアしてあげる',
    teamValue: 'チームのメンタルの生命線。崩れない雰囲気と一体感を作る',
    overdone: '自分が疲れていても無理に明るく振る舞う',
    innerVoice: 'みんなが楽しくやれたら、それでいい。',
  },
};
