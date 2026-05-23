import type { Question } from '../lib/scoring';

export const work2Questions: Question[] = [
  {
    id: 1,
    text: 'チームが3連敗して雰囲気が最悪。あなたはどうする？',
    options: [
      { text: '「切り替えよう、次は絶対取る」と強気に声を出す', type: 'attacker' },
      { text: '「一回落ち着こう、焦ってもしょうがない」と提案する', type: 'guardian' },
      { text: '「負けパターン分析しよう」とリプレイを確認する', type: 'analyst' },
      { text: '「大丈夫、俺たちならいける！」と雰囲気を上げる', type: 'booster' },
    ],
  },
  {
    id: 2,
    text: '大事な試合で自分が大きなミスをした直後は？',
    options: [
      { text: 'すぐ取り返そうと攻めのプレイをする', type: 'attacker' },
      { text: '同じミスを繰り返さないよう慎重にプレイする', type: 'guardian' },
      { text: '何が悪かったか頭の中で整理する', type: 'analyst' },
      { text: '「ドンマイ自分！次で取り返す！」と気持ちを切り替える', type: 'booster' },
    ],
  },
  {
    id: 3,
    text: '残り時間わずかで逆転が必要。あなたの判断は？',
    options: [
      { text: 'リスク承知で最も攻撃的な動きに出る', type: 'attacker' },
      { text: '確実に1ポイント取れる安全な作戦を選ぶ', type: 'guardian' },
      { text: '相手の弱点を分析して最も効率的な逆転ルートを考える', type: 'analyst' },
      { text: '「まだいける！全員で行こう！」とチームを鼓舞する', type: 'booster' },
    ],
  },
  {
    id: 4,
    text: '味方が明らかなミスをした。あなたの反応は？',
    options: [
      { text: '「次は○○してみよう」と具体的なプランを伝える', type: 'attacker' },
      { text: '自分のポジションでカバーして流れを取り戻す', type: 'guardian' },
      { text: 'なぜそうなったか一緒に考える', type: 'analyst' },
      { text: '「切り替えていこう！」と声をかける', type: 'booster' },
    ],
  },
  {
    id: 5,
    text: '試合前のチームミーティング。あなたの役割は？',
    options: [
      { text: '「今日は絶対勝つぞ」と気合を入れる', type: 'attacker' },
      { text: '「相手の得意な動きに注意しよう」とリスクを確認する', type: 'guardian' },
      { text: '「相手のデータを見てきた」と情報を共有する', type: 'analyst' },
      { text: '「楽しんでいこう！」とチームの緊張をほぐす', type: 'booster' },
    ],
  },
  {
    id: 6,
    text: '新しいチームに入ったばかり。まず何をする？',
    options: [
      { text: '自分の実力を見せて存在感を出す', type: 'attacker' },
      { text: 'チームの雰囲気やルールを観察して合わせる', type: 'guardian' },
      { text: 'メンバーのプレイスタイルを分析する', type: 'analyst' },
      { text: '積極的に話しかけて仲良くなる', type: 'booster' },
    ],
  },
  {
    id: 7,
    text: 'チームメイトが落ち込んでいる。あなたはどうする？',
    options: [
      { text: '「練習で取り返そうぜ」と行動に誘う', type: 'attacker' },
      { text: 'いつも通り接して安心感を与える', type: 'guardian' },
      { text: '何があったか状況を整理するのを手伝う', type: 'analyst' },
      { text: '雑談やゲームで気分転換を提案する', type: 'booster' },
    ],
  },
  {
    id: 8,
    text: '作戦会議で自分の意見が否定された。どう感じる？',
    options: [
      { text: '「じゃあ結果で証明する」と思う', type: 'attacker' },
      { text: 'リスクが少ない方の案なら、そちらに合わせる', type: 'guardian' },
      { text: '否定された理由を論理的に理解しようとする', type: 'analyst' },
      { text: '「まあいいか、チームで決めたことをやろう」と切り替える', type: 'booster' },
    ],
  },
  {
    id: 9,
    text: '大会前日の夜。あなたの過ごし方は？',
    options: [
      { text: 'イメトレ。明日の試合で勝つイメージを繰り返す', type: 'attacker' },
      { text: '持ち物確認・準備を完璧にして早めに寝る', type: 'guardian' },
      { text: '対戦相手のデータやリプレイを最終チェック', type: 'analyst' },
      { text: 'チームメンバーと雑談して緊張をほぐす', type: 'booster' },
    ],
  },
  {
    id: 10,
    text: '試合中にチーム内で意見が割れた。あなたはどうする？',
    options: [
      { text: '「俺についてこい」と自分の判断で動く', type: 'attacker' },
      { text: 'とりあえずリスクが低い方に合わせて動く', type: 'guardian' },
      { text: '両方の案のメリットを比較して判断する', type: 'analyst' },
      { text: '「どっちでもいい、一つに決めてみんなで行こう！」とまとめる', type: 'booster' },
    ],
  },
  {
    id: 11,
    text: '格上のチームとの試合。あなたの心境は？',
    options: [
      { text: '燃える。強い相手と戦えるチャンス', type: 'attacker' },
      { text: 'いつも以上に慎重にミスなくプレイしたい', type: 'guardian' },
      { text: '相手の戦術を研究して穴を見つけたい', type: 'analyst' },
      { text: '楽しもう。いい経験になるし、チームの雰囲気良く行こう', type: 'booster' },
    ],
  },
  {
    id: 12,
    text: 'チームの練習メニューを決める時、あなたの発言は？',
    options: [
      { text: '「強いチーム相手の練習試合を入れよう」', type: 'attacker' },
      { text: '「まず基本をしっかり固めるメニューにしよう」', type: 'guardian' },
      { text: '「先週の試合データを見て弱点を優先しよう」', type: 'analyst' },
      { text: '「たまには息抜きメニューも入れよう！」', type: 'booster' },
    ],
  },
  {
    id: 13,
    text: 'チーム練習でうまくいかないことが続いている。あなたの提案は？',
    options: [
      { text: '「実戦で試そう。練習より本番で鍛えよう」', type: 'attacker' },
      { text: '「基礎に戻ろう。今のやり方を見直そう」', type: 'guardian' },
      { text: '「何が原因か一つずつ検証しよう」', type: 'analyst' },
      { text: '「一旦別のことしてリフレッシュしよう」', type: 'booster' },
    ],
  },
  {
    id: 14,
    text: '試合後の振り返り。あなたが一番話したいことは？',
    options: [
      { text: '次の試合でどう勝つかの作戦', type: 'attacker' },
      { text: '今回危なかった場面と再発防止策', type: 'guardian' },
      { text: 'データに基づいた客観的な分析', type: 'analyst' },
      { text: '良かったプレイの称え合い', type: 'booster' },
    ],
  },
  {
    id: 15,
    text: 'チームの雰囲気が険悪になっている。あなたの動きは？',
    options: [
      { text: '「ぶつかることもある。乗り越えよう」と直球で言う', type: 'attacker' },
      { text: '対立している人の間に入ってバランスを取る', type: 'guardian' },
      { text: '何が問題の根本原因か整理する', type: 'analyst' },
      { text: '別の話題を振って空気を変えようとする', type: 'booster' },
    ],
  },
  {
    id: 16,
    text: '自分のパフォーマンスが明らかに落ちている時期。どう対処する？',
    options: [
      { text: 'もっと練習量を増やして力で突破する', type: 'attacker' },
      { text: '無理せずペースを落として調子を戻す', type: 'guardian' },
      { text: 'データを見て何が落ちているか特定する', type: 'analyst' },
      { text: '仲間に相談する。一人で抱え込まない', type: 'booster' },
    ],
  },
  {
    id: 17,
    text: 'チームに新メンバーが入ってきた。あなたの接し方は？',
    options: [
      { text: '「一緒にランク潜ろう」と実戦に誘う', type: 'attacker' },
      { text: 'チームのルールや練習の流れを共有する', type: 'guardian' },
      { text: '得意なゲームやポジションを聞く', type: 'analyst' },
      { text: 'チームの雑談に混ぜて雰囲気に馴染ませる', type: 'booster' },
    ],
  },
  {
    id: 18,
    text: '大会で予選落ちした直後。あなたの気持ちは？',
    options: [
      { text: '悔しい。次は絶対リベンジする', type: 'attacker' },
      { text: '何がダメだったか冷静に受け止めたい', type: 'guardian' },
      { text: '対戦データを振り返って改善点を洗い出したい', type: 'analyst' },
      { text: 'チームが落ち込まないように声をかけたい', type: 'booster' },
    ],
  },
  {
    id: 19,
    text: '忙しくてゲームの練習時間が取れない。あなたの対応は？',
    options: [
      { text: '睡眠削ってでも最低限の練習はする', type: 'attacker' },
      { text: '優先順位をつけて計画的に切り替える', type: 'guardian' },
      { text: '短い時間で最大効率の練習メニューを組む', type: 'analyst' },
      { text: '練習できなくてもチームメイトと連絡は取る', type: 'booster' },
    ],
  },
  {
    id: 20,
    text: 'ゲーマーとしての自分の強みは？',
    options: [
      { text: '勝負強さ・ピンチでも攻める度胸', type: 'attacker' },
      { text: '安定感・大崩れしない堅実さ', type: 'guardian' },
      { text: '冷静な判断力・データ分析力', type: 'analyst' },
      { text: 'チームの空気を作る・みんなをつなげる力', type: 'booster' },
    ],
  },
];
