export function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-slate-400">Loading...</p>
    </div>
  );
}

export default LoadingFallback;
