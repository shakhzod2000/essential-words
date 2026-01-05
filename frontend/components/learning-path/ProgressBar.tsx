interface ProgressBarProps {
  unitNumber: number;
  essentialNumber: number;
  progress: number;
}

export function ProgressBar({ unitNumber, essentialNumber, progress }: ProgressBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white pt-4">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-gray-200 rounded-2xl shadow-lg transition-all duration-300 mx-6 px-6 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="transition-all duration-300">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Unit {unitNumber}
            </p>
            <h2 className="text-lg font-bold text-gray-900">Essential {essentialNumber}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-green-600 min-w-[40px]">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
