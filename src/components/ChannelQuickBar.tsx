import { Volume2, VolumeX } from 'lucide-react';
import { ChannelInfo, AudioChannel } from '../types/device';

interface ChannelQuickBarProps {
  channels: ChannelInfo[];
  selectedChannels: AudioChannel[];
  onToggleChannel: (id: AudioChannel) => void;
}

export function ChannelQuickBar({
  channels,
  selectedChannels,
  onToggleChannel,
}: ChannelQuickBarProps) {
  return (
    <section className="bg-white border border-gray-200/90 rounded-3xl p-4.5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
          房间播放分区 (4通道独立控制)
        </h3>
        <span className="text-[11px] font-mono text-gray-500">
          已开启 {selectedChannels.length}/4
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {channels.map((ch) => {
          const isSelected = selectedChannels.includes(ch.id);
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onToggleChannel(ch.id)}
              className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer ${
                isSelected
                  ? 'bg-gray-50 border-gray-900 text-gray-900 shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-4 h-4 rounded text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {ch.id}
                  </span>
                  <span className="text-xs font-bold truncate text-gray-900">
                    {ch.name}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {ch.zone} · {isSelected ? '正在播放' : '已关闭'}
                </span>
              </div>

              <div className="shrink-0 ml-1.5">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-2xs">
                    <Volume2 className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <VolumeX className="w-3 h-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
