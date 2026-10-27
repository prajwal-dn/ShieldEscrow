function Loader({ message = "Securing blockchain state..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 dark:border-cyan-500/20 animate-ping opacity-25"></div>
        
        {/* Middle rotating ring */}
        <div className="w-14 h-14 rounded-full border-2 border-indigo-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-cyan-400 border-r-indigo-500 dark:border-r-indigo-400 animate-spin"></div>
        
        {/* Inner static core */}
        <div className="absolute w-6 h-6 rounded-full bg-indigo-500/80 dark:bg-cyan-400/80 blur-xs"></div>
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-slate-600 dark:text-slate-300 animate-pulse font-mono">
        {message}
      </p>
    </div>
  );
}

export default Loader;