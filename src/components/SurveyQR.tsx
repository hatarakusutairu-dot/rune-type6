import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SURVEY } from '../data/survey';

const IMAGE_PATH = '/slides/survey_qr.png';

/**
 * Closing-screen survey QR. Priority:
 *  1. /slides/survey_qr.png on disk (uploaded image)
 *  2. SURVEY.url generated via qrcode.react
 *  3. Hidden if neither is provided
 */
export default function SurveyQR() {
  const [hasImage, setHasImage] = useState<'checking' | 'yes' | 'no'>('checking');

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setHasImage('yes');
    };
    img.onerror = () => {
      if (!cancelled) setHasImage('no');
    };
    img.src = IMAGE_PATH;
    return () => {
      cancelled = true;
    };
  }, []);

  if (hasImage === 'checking') return null;

  if (hasImage === 'no' && !SURVEY.url) {
    return (
      <section className="panel text-center">
        <p className="text-white/60">
          アンケートはまだ設定されていません
        </p>
        <p className="text-white/40 text-xs mt-2">
          src/data/survey.ts の url にアンケートURLを入れるか、
          public/slides/survey_qr.png に QR 画像を置いてください
        </p>
      </section>
    );
  }

  return (
    <section className="panel text-center">
      {SURVEY.label && (
        <p className="text-white/85 text-xl font-bold mb-4">{SURVEY.label}</p>
      )}
      <div className="inline-block bg-white p-4 rounded-2xl">
        {hasImage === 'yes' ? (
          <img src={IMAGE_PATH} alt="survey QR" className="w-64 h-64 object-contain" />
        ) : (
          <QRCodeSVG value={SURVEY.url} size={256} />
        )}
      </div>
      {SURVEY.caption && (
        <p className="text-white/70 text-base mt-4">{SURVEY.caption}</p>
      )}
      {hasImage === 'no' && SURVEY.url && (
        <p className="text-white/30 text-xs mt-2 break-all">{SURVEY.url}</p>
      )}
    </section>
  );
}
