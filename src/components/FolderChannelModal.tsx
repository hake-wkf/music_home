import { useState } from 'react';
import { X, Folder, Layers, Grid, Play, Check } from 'lucide-react';
import { AudioChannel, ChannelInfo } from '../types/device';
import { MOCK_FOLDERS } from '../mock/songs';

interface FolderChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFolder: string;
  selectedChannels: AudioChannel[];
  channels: ChannelInfo[];
  onPlayFolderWithChannels: (folder: string, channels: AudioChannel[]) => void;
  onToggleChannel: (chId: AudioChannel) => void;
}

export function FolderChannelModal({
  isOpen,
  onClose,
  selectedFolder,
  selectedChannels,
  channels,
  onPlayFolderWithChannels,
  onToggleChannel,
}: FolderChannelModalProps) {
  const [localFolder, setLocalFolder] = useState<string>(selectedFolder);

  if (!isOpen) return null;

  const handleConfirmPlay = () => {
    onPlayFolderWithChannels(localFolder, selectedChannels);
    onClose();
  };

  const currentFolderObj = MOCK_FOLDERS.find((f) => f.path === localFolder) || MOCK_FOLDERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-semibold">
              <Folder className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                指定文件夹与通道播放
              </h2>
              <p className="text-[11px] text-gray-500">
                选择媒体目录并路由至指定房间功放通道
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="关闭弹窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 主体 */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* 1. 下拉选择文件夹 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>下拉选择目标文件夹:</span>
              <span className="text-gray-500 font-mono text-[11px]">
                {currentFolderObj.count} 首音频
              </span>
            </label>
            <div className="relative">
              <select
                value={localFolder}
                onChange={(e) => setLocalFolder(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3.5 py-2.5 border border-gray-200 focus:outline-hidden focus:bg-white focus:border-gray-900 cursor-pointer appearance-none pr-8 font-medium transition-all"
              >
                {MOCK_FOLDERS.map((f) => (
                  <option key={f.path} value={f.path}>
                    📁 {f.name} ({f.path}) [{f.count}首]
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              简介: {currentFolderObj.description}
            </p>
          </div>

          {/* 2. 选择播放通道 (1-4 可多选) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-gray-700" />
                <span>选择播放通道 (1-4 通道 可多选):</span>
              </label>
              <span className="text-[11px] text-gray-500 font-mono">
                已选 {selectedChannels.length}/4
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
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
                      <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                        {ch.zone} · 增益 {Math.round(ch.gain * 100)}%
                      </span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-1.5 transition-colors ${
                        isSelected
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部确认按钮 */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirmPlay}
            disabled={selectedChannels.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>确认并在所选通道播放</span>
          </button>
        </div>
      </div>
    </div>
  );
}
