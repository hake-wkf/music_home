import { ChevronLeft, MoreHorizontal, Wifi, Battery } from 'lucide-react';

interface WeChatMiniHeaderProps {
  deviceName: string;
  isOnline: boolean;
  onOpenDebug?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  onToggleOnline?: () => void;
}

export function WeChatMiniHeader({
  deviceName,
  isOnline,
  onOpenDebug,
  showBack = false,
  onBack,
  title,
  onToggleOnline,
}: WeChatMiniHeaderProps) {
  const displayTitle = title || deviceName;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 text-gray-900 select-none">
      {/* 手机系统状态栏 */}
      <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] text-gray-500 font-mono">
        <span className="font-bold text-gray-800">09:41</span>
        <div className="flex items-center gap-1.5 text-gray-700">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 小程序/App 导航栏 */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="px-1.5 py-1 -ml-1 rounded-xl flex items-center gap-0.5 text-gray-800 hover:text-gray-950 hover:bg-gray-100 transition-colors cursor-pointer"
              title="返回首页"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-semibold">返回</span>
            </button>
          ) : (
            <div className="w-2" />
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-gray-900 tracking-tight truncate">
                {displayTitle}
              </h1>
              <button
                type="button"
                onClick={onToggleOnline}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
                }`}
                title={isOnline ? '当前设备在线（点击可模拟离线）' : '当前设备已离线（点击可恢复在线）'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span>{isOnline ? '在线' : '离线'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 微信标准胶囊按钮 (WeChat Capsule) */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-7 px-2.5 gap-2 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={onOpenDebug}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center p-0.5 cursor-pointer"
            title="查看指令通信日志"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-gray-200"></div>
          <button
            type="button"
            onClick={showBack ? onBack : undefined}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center p-0.5 cursor-pointer"
            title="小程序主页"
          >
            <div className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-current"></div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
