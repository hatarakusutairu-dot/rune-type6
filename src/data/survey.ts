/**
 * アンケート（外部フォーム）の URL 設定。
 *
 * 1. URL をここに入れると、最後の「まとめ」ページに QR コードが自動生成されます
 * 2. ファイル方式が良い場合は public/slides/survey_qr.png を置いてください（こちらが優先）
 * 3. どちらも未設定の場合は QR エリアは表示されません
 */
export const SURVEY = {
  /** Google Forms / Microsoft Forms など、何でも OK。空文字なら無効 */
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSdreLi7RManuJQlHxJ65mBw5Hw6aXDTA_OdmCJ_MUP4I5-uMg/viewform',
  /** QR の上に表示する一言 */
  label: '感想アンケートにご協力ください',
  /** QR の下の補足 */
  caption: 'スマホで読み取って回答してね',
};
