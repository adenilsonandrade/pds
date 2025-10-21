import React from 'react';

interface State {
  hasError: boolean;
  error: any;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600">Ocorreu um erro ao renderizar a página</h2>
          <pre className="mt-4 whitespace-pre-wrap bg-surface p-4 rounded">{String(this.state.error)}</pre>
          <div className="mt-4">
            <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => window.location.reload()}>
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}
