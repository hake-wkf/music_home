import { ChevronLeft, MoreHorizontal, Wifi, Battery } from 'lucide-react';

interface WeChatMiniHeaderProps {
  deviceName: string;
  isOnline: boolean;
  onOpenDebug?: () => void;
}

export function WeChatMiniHeader({
  deviceName,
  isOnline,
  onOpenDebug,
}: WeChatMiniHeaderProps) {
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
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title="返回上一级"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-gray-900 tracking-tight">
                {deviceName}
              </h1>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>
        </div>

        {/* 微信标准胶囊按钮 (WeChat Capsule) */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full h-7 px-2.5 gap-2 shadow-2xs">
          <button
            type="button"
            onClick={onOpenDebug}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center p-0.5 cursor-pointer"
            title="查看指令日志与硬件调试"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3 bg-gray-200"></div>
          <button
            type="button"
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
