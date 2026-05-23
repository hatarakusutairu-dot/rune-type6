import type { Question } from '../lib/scoring';

export const work1Questions: Question[] = [
  {
    id: 1,
    text: '新しいゲームを始めた時、最初にやることは？',
    options: [
      { text: 'ランク戦やオンライン対戦にすぐ潜る', type: 'competitor' },
      { text: 'トレーニングモードで基本操作を練習する', type: 'achiever' },
      { text: 'フレンドを誘って一緒に始める', type: 'socializer' },
      { text: 'マップや設定画面を隅々まで見て回る', type: 'explorer' },
    ],
  },
  {
    id: 2,
    text: 'ゲームで一番テンションが上がる瞬間は？',
    options: [
      { text: '格上のプレイヤーに勝った時', type: 'competitor' },
      { text: '苦手だった技術がやっとできるようになった時', type: 'achiever' },
      { text: 'チームで盛り上がって最高の雰囲気の時', type: 'socializer' },
      { text: '誰も知らないルートや裏技を発見した時', type: 'explorer' },
    ],
  },
  {
    id: 3,
    text: 'フレンドに「新しいゲーム一緒にやろう」と誘われた。どう感じる？',
    options: [
      { text: '対戦要素があるなら興味ある', type: 'competitor' },
      { text: 'やり込み要素やスキルの深さがあるか気になる', type: 'achiever' },
      { text: '誰が一緒にやるかが一番大事', type: 'socializer' },
      { text: 'どんなゲームか調べてワクワクする', type: 'explorer' },
    ],
  },
  {
    id: 4,
    text: 'ゲーム内で手に入れたいものは？',
    options: [
      { text: '高いランクやレート', type: 'competitor' },
      { text: '全実績コンプリートや最高レベルの装備', type: 'achiever' },
      { text: '信頼できるフレンドやギルドメンバー', type: 'socializer' },
      { text: 'まだ誰も見つけていない隠し要素', type: 'explorer' },
    ],
  },
  {
    id: 5,
    text: 'ゲームがつまらないと感じるのはどんな時？',
    options: [
      { text: '弱い相手としか当たらない時', type: 'competitor' },
      { text: '何をやっても上達している実感がない時', type: 'achiever' },
      { text: '一人でプレイしている時間が長い時', type: 'socializer' },
      { text: 'やることが全部分かっていて新鮮味がない時', type: 'explorer' },
    ],
  },
  {
    id: 6,
    text: '新しいキャラクターや武器が追加された。まず何をする？',
    options: [
      { text: 'ランク戦で強いか試す', type: 'competitor' },
      { text: 'トレーニングモードで性能を検証する', type: 'achiever' },
      { text: 'フレンドと一緒に使ってみる', type: 'socializer' },
      { text: '全スキルの効果を調べて隠れた使い方を探す', type: 'explorer' },
    ],
  },
  {
    id: 7,
    text: 'チームメンバーに求めることは？',
    options: [
      { text: '勝つためにしっかりプレイしてくれること', type: 'competitor' },
      { text: '自分の役割を着実にこなしてくれること', type: 'achiever' },
      { text: '楽しい雰囲気を作ってくれること', type: 'socializer' },
      { text: '新しい作戦や発想を持ってきてくれること', type: 'explorer' },
    ],
  },
  {
    id: 8,
    text: 'ゲームの大型アップデートが来た。まず何をする？',
    options: [
      { text: '環境が変わったランク戦に早く潜りたい', type: 'competitor' },
      { text: 'パッチノートを読んで変更点を全部確認する', type: 'achiever' },
      { text: 'フレンドと「何が変わった？」と話しながら触る', type: 'socializer' },
      { text: '新マップや新機能を真っ先に探検する', type: 'explorer' },
    ],
  },
  {
    id: 9,
    text: 'ゲームを選ぶ時に一番重視するのは？',
    options: [
      { text: '競技性の高さ・対戦の奥深さ', type: 'competitor' },
      { text: 'やり込み要素の多さ・上達の手応え', type: 'achiever' },
      { text: '友達がやっているかどうか', type: 'socializer' },
      { text: '世界観やシステムの独自性', type: 'explorer' },
    ],
  },
  {
    id: 10,
    text: '味方がミスした時、最初に思うことは？',
    options: [
      { text: 'ここから巻き返せるか考える', type: 'competitor' },
      { text: '次同じミスをしないための対策を考える', type: 'achiever' },
      { text: '「ドンマイ」と声をかけたくなる', type: 'socializer' },
      { text: '意外な原因だったりしないか気になる', type: 'explorer' },
    ],
  },
  {
    id: 11,
    text: 'ゲーム配信を見る時、何が気になる？',
    options: [
      { text: '配信者のランクや勝率', type: 'competitor' },
      { text: '操作の細かいテクニックや立ち回り', type: 'achiever' },
      { text: '配信者と視聴者のやり取りや雰囲気', type: 'socializer' },
      { text: '知らなかった小ネタやテクニック', type: 'explorer' },
    ],
  },
  {
    id: 12,
    text: 'ゲームで嬉しい褒められ方は？',
    options: [
      { text: '「強すぎ」「お前がいたから勝てた」', type: 'competitor' },
      { text: '「上手くなったね」「練習の成果出てるよ」', type: 'achiever' },
      { text: '「一緒にやると楽しい」「また誘ってね」', type: 'socializer' },
      { text: '「その発想はなかった」「よくそれ見つけたね」', type: 'explorer' },
    ],
  },
  {
    id: 13,
    text: '1週間ゲームができない状況。一番つらいことは？',
    options: [
      { text: 'ランクが落ちる・ライバルに差をつけられる', type: 'competitor' },
      { text: 'せっかく身についた感覚が鈍る', type: 'achiever' },
      { text: 'フレンドとの会話やイベントに参加できない', type: 'socializer' },
      { text: '新情報やアプデに乗り遅れる', type: 'explorer' },
    ],
  },
  {
    id: 14,
    text: 'ゲーム内のショップで買うものの傾向は？',
    options: [
      { text: '強さに直結するアイテムや装備', type: 'competitor' },
      { text: '効率を上げるツールや経験値ブースト', type: 'achiever' },
      { text: 'マルチプレイで使えるエモートやスキン', type: 'socializer' },
      { text: '見た目がユニークなアイテムやレアもの', type: 'explorer' },
    ],
  },
  {
    id: 15,
    text: '負けが続いた時にやることは？',
    options: [
      { text: 'もう一戦。勝つまでやめない', type: 'competitor' },
      { text: 'リプレイを見直して改善点を探す', type: 'achiever' },
      { text: 'フレンドを誘って気分を変える', type: 'socializer' },
      { text: '別のゲームや別のモードで気分転換する', type: 'explorer' },
    ],
  },
  {
    id: 16,
    text: 'ゲームの大会に出るとしたら、一番の動機は？',
    options: [
      { text: '優勝したい・強い相手と戦いたい', type: 'competitor' },
      { text: '自分の実力がどこまで通用するか試したい', type: 'achiever' },
      { text: 'チームで目標に向かう一体感を味わいたい', type: 'socializer' },
      { text: '大会という特別な環境を体験してみたい', type: 'explorer' },
    ],
  },
  {
    id: 17,
    text: 'チームの練習で自分が一番やりたいことは？',
    options: [
      { text: 'スクリム（実戦形式の練習試合）', type: 'competitor' },
      { text: '苦手なパターンの反復トレーニング', type: 'achiever' },
      { text: 'チームの連携を確認しながらワイワイやる', type: 'socializer' },
      { text: '新しい戦術や構成を試す実験的な練習', type: 'explorer' },
    ],
  },
  {
    id: 18,
    text: 'チームで自分の意見が通らなかった時、どう思う？',
    options: [
      { text: '結果で証明してやると思う', type: 'competitor' },
      { text: '次の機会にもっと良い提案をしようと思う', type: 'achiever' },
      { text: 'みんなが納得しているならそれでいい', type: 'socializer' },
      { text: '別のアプローチを考えてみようと思う', type: 'explorer' },
    ],
  },
  {
    id: 19,
    text: 'ゲームで友達に教えるとしたら、何を教える？',
    options: [
      { text: '勝つためのコツや戦術', type: 'competitor' },
      { text: '効率よく上達する練習方法', type: 'achiever' },
      { text: '楽しく遊ぶための心構え', type: 'socializer' },
      { text: '面白い小ネタや知られていない仕様', type: 'explorer' },
    ],
  },
  {
    id: 20,
    text: 'ゲームを始めて最初の1ヶ月。一番成長を感じるのは？',
    options: [
      { text: '初めて強い相手に勝てた時', type: 'competitor' },
      { text: 'プレイ時間に比例して確実に上手くなっている時', type: 'achiever' },
      { text: 'ゲーム内で気軽に誘える仲間ができた時', type: 'socializer' },
      { text: 'ゲームの深い仕組みや知識が増えた時', type: 'explorer' },
    ],
  },
];
