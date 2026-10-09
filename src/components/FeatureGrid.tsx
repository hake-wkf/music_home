import { Radio, FolderOpen, Search, ChevronRight } from 'lucide-react';
import { AudioSource, StorageStatusCode } from '../types/device';

interface FeatureGridProps {
  source: AudioSource;
  storageStatus: StorageStatusCode;
  selectedFolderName: string;
  onOpenSourceModal: () => void;
  onOpenFolderModal: () => void;
  onOpenSongModal: () => void;
}

export function FeatureGrid({
  source,
  storageStatus,
  selectedFolderName,
  onOpenSourceModal,
  onOpenFolderModal,
  onOpenSongModal,
}: FeatureGridProps) {
  const sourceName = source === 1 ? 'USB' : source === 2 ? 'TF卡' : '蓝牙';
  const statusLabel =
    storageStatus === '0' ? '未插卡' : storageStatus === '01' ? '播放中' : '就绪';

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* 1. 音频输入源入口 */}
      <button
        type="button"
        onClick={onOpenSourceModal}
        className="bg-white border border-gray-200/90 rounded-2xl p-3 shadow-xs hover:border-gray-400 hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer active:scale-97 group"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 text-gray-700" />
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 transition-colors" />
        </div>
        <div className="mt-2.5 min-w-0">
          <span className="text-xs font-bold text-gray-900 block truncate">
            音频输入源
          </span>
          <span className="text-[10px] text-gray-500 font-medium block truncate mt-0.5">
            {sourceName} · {statusLabel}
          </span>
        </div>
      </button>

      {/* 2. 文件夹播放入口 */}
      <button
        type="button"
        onClick={onOpenFolderModal}
        className="bg-white border border-gray-200/90 rounded-2xl p-3 shadow-xs hover:border-gray-400 hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer active:scale-97 group"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <FolderOpen className="w-4 h-4 text-gray-700" />
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 transition-colors" />
        </div>
        <div className="mt-2.5 min-w-0">
          <span className="text-xs font-bold text-gray-900 block truncate">
            文件夹播放
          </span>
          <span className="text-[10px] text-gray-500 block truncate mt-0.5">
            {selectedFolderName}
          </span>
        </div>
      </button>

      {/* 3. 指定歌曲点播入口 */}
      <button
        type="button"
        onClick={onOpenSongModal}
        className="bg-white border border-gray-200/90 rounded-2xl p-3 shadow-xs hover:border-gray-400 hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer active:scale-97 group"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Search className="w-4 h-4 text-gray-700" />
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 transition-colors" />
        </div>
        <div className="mt-2.5 min-w-0">
          <span className="text-xs font-bold text-gray-900 block truncate">
            指定歌曲点播
          </span>
          <span className="text-[10px] text-gray-500 block truncate mt-0.5">
            曲库列表 · 歌名搜索
          </span>
        </div>
      </button>
    </div>
  );
}
