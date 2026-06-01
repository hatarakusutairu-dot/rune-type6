import { Component, type ReactNode } from 'react';

interface State {
  err: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: unknown) {
    // Surface to the browser console so a teacher can read it via DevTools
    // if they ever screenshot it for us.
    console.error('App crashed:', err, info);
  }

  reset = () => {
    this.setState({ err: null });
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel max-w-md w-full text-center">
          <p className="text-5xl mb-3">⚠️</p>
          <h1 className="text-2xl font-black mb-2">画面エラー</h1>
          <p className="text-white/70 text-sm mb-5 leading-relaxed">
            予期しないエラーが発生しました。<br />
            「画面を再読み込み」を押して復帰してください。
          </p>
          <pre className="text-left text-[10px] text-white/40 mb-5 max-h-32 overflow-auto whitespace-pre-wrap break-words">
            {String(this.state.err?.message ?? this.state.err)}
          </pre>
          <div className="flex flex-col gap-2">
            <button onClick={this.reload} className="btn-primary">
              画面を再読み込み
            </button>
            <button onClick={this.reset} className="btn-ghost">
              リロードせずに復帰を試みる
            </button>
          </div>
        </div>
      </main>
    );
  }
}
