import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FileText, ArrowRight, Sparkles, BarChart3, Shield } from 'lucide-react';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, name);
        if (signUpError) {
          setError(signUpError.message);
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%200L30%2015L15%2030L0%2015z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.03)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">ConsultantAI</span>
          </div>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Transform interviews into
              <span className="block mt-1 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                actionable insights
              </span>
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed">
              Upload transcripts, let AI extract workflows, pain points, and recommendations.
              Generate professional reports in minutes.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">AI-Powered Analysis</p>
                  <p className="text-sm text-indigo-200">Claude extracts workflows, pain points, tools, and roles automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Company Summaries</p>
                  <p className="text-sm text-indigo-200">Aggregate insights across multiple interviews for a complete picture</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Secure & Private</p>
                  <p className="text-sm text-indigo-200">Enterprise-grade security with Supabase authentication</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-indigo-300">
            Powered by Claude AI (Anthropic)
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl mb-4 shadow-glow-indigo">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Consultant<span className="text-gradient">AI</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Transform interview transcripts into actionable insights
            </p>
          </div>

          {/* Form header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 mt-1">
              {isSignUp ? 'Start analyzing interviews with AI' : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {/* Login/Signup Card */}
          <div className="bg-white rounded-2xl shadow-soft-lg border border-slate-200/60 p-7">
            {/* Tabs */}
            <div className="flex gap-1 mb-7 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  !isSignUp
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  isSignUp
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors placeholder-slate-400"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors placeholder-slate-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Secure data storage with Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
