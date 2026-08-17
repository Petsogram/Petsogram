import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-rose-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong loading this section.</h2>
          <p className="text-stone-500 mb-8 max-w-md">
            An unexpected error occurred while rendering this page. You can try reloading or return to the home page.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-900/10"
            >
              <RefreshCw size={18} /> Reload
            </button>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onGoHome) this.props.onGoHome();
                else window.location.href = '/';
              }} 
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-all"
            >
              <Home size={18} /> Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
