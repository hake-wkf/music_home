import { Volume2, VolumeX, Volume1, RefreshCw, Sliders } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onSetVolume: (vol: number) => void;
  onQueryVolume: () => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onSetVolume,
  onQueryVolume,
  onToggleMute,
}: VolumeControlProps) {
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-4 h-4 text-rose-500" />;
    if (volume < 50) return <Volume1 className="w-4 h-4 text-gray-700" />;
    return <Volume2 className="w-4 h-4 text-gray-900" />;
  };

  const presets = [15, 35, 55, 80];

  return (
    <section className="bg-white border border-gray-200/90 rounded-3xl p-4.5 shadow-xs space-y-3.5">
      {/* 标题栏与查询音量动作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-gray-800" />
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            音乐播放音量
          </span>
          <span className="text-xs font-mono font-bold text-gray-900 ml-1">
            {isMuted ? '静音' : `${volume}%`}
          </span>
        </div>
        <button
          type="button"
          onClick={onQueryVolume}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors active:scale-95 cursor-pointer"
          title="发送指令: 查询音乐播放音量"
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
          <span>查询音量</span>
        </button>
      </div>

      {/* 滑块行 */}
      <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-200/80 rounded-2xl p-3.5">
        {/* 快速静音按键 */}
        <button
          type="button"
          onClick={onToggleMute}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title={isMuted ? '取消静音' : '快速静音'}
        >
          {getVolumeIcon()}
        </button>

        {/* 音量滑块 */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isMuted ? 0 : volume}
            onChange={(e) => onSetVolume(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            title="拖动设置音量"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 读数 */}
        <div className="w-10 text-right">
          <span className="text-sm font-bold font-mono text-gray-900 tabular-nums">
            {isMuted ? '0' : volume}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">%</span>
        </div>
      </div>

      {/* 快捷档位 */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[11px] text-gray-400 shrink-0">快捷档位:</span>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {presets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onSetVolume(val)}
              className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all active:scale-95 cursor-pointer ${
                volume === val && !isMuted
                  ? 'bg-gray-900 text-white border-gray-900 font-bold shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
