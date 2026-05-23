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
  if (hasImage === 'no' && !SURVEY.url) return null;

  return (
    <section className="panel mt-6 text-center">
      {SURVEY.label && (
        <p className="text-white/85 text-base font-bold mb-3">{SURVEY.label}</p>
      )}
      <div className="inline-block bg-white p-3 rounded-2xl">
        {hasImage === 'yes' ? (
          <img src={IMAGE_PATH} alt="survey QR" className="w-48 h-48 object-contain" />
        ) : (
          <QRCodeSVG value={SURVEY.url} size={192} />
        )}
      </div>
      {SURVEY.caption && (
        <p className="text-white/60 text-sm mt-3">{SURVEY.caption}</p>
      )}
      {hasImage === 'no' && SURVEY.url && (
        <p className="text-white/30 text-xs mt-2 break-all">{SURVEY.url}</p>
      )}
    </section>
  );
}
