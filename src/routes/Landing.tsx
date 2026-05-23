import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      navigate(`/student?room=${encodeURIComponent(room)}`, { replace: true });
    }
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="panel max-w-xl w-full text-center">
        <h1 className="text-4xl font-black tracking-tight mb-2">TYPE SCANNER</h1>
        <p className="text-white/70 mb-8">高校 eスポーツコース メンタルコミュニケーション授業</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/teacher" className="btn-primary">講師として開始</Link>
          <Link to="/student" className="btn-ghost">生徒として参加</Link>
        </div>
        <p className="mt-8 text-xs text-white/40">
          このアセスメントはBartle分類およびストレスコーピング理論を参考にしていますが、
          学術的な心理検査ではありません。チーム活動での自分の傾向を振り返るための教育ツールです。
        </p>
      </div>
    </main>
  );
}
