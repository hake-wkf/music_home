import { useState, type FormEvent } from 'react';
import {
  Search,
  Music,
  Play,
  CheckCircle,
  X,
  RotateCw,
  FolderSync,
  SlidersHorizontal,
  Grid,
  Check,
} from 'lucide-react';
import { SongItem, AudioChannel, ChannelInfo } from '../types/device';
import { MOCK_SONGS } from '../mock/songs';

interface SongSelectionPageProps {
  currentSong: SongItem | null;
  isPlaying: boolean;
  selectedChannels: AudioChannel[];
  channels: ChannelInfo[];
  onToggleChannel: (chId: AudioChannel) => void;
  onPlayById: (songId: string, channels?: AudioChannel[]) => void;
  onPlayByName: (songName: string, channels?: AudioChannel[]) => void;
  onTogglePlayPause: () => void;
  onBackToHome?: () => void;
  onRefreshLibrary?: () => Promise<number | void> | void;
}

export function SongSelectionPage({
  currentSong,
  isPlaying,
  selectedChannels,
  channels,
  onToggleChannel,
  onPlayById,
  onPlayByName,
  onRefreshLibrary,
}: SongSelectionPageProps) {
  // 需求8: 指定歌曲点播需要有一个初始状态的页面，下方没有歌曲列表，只有刷新曲库的按钮
  const [isLibraryLoaded, setIsLibraryLoaded] = useState<boolean>(false);
  const [songNameSearch, setSongNameSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string>('');
  const [isChannelModalOpen, setIsChannelModalOpen] = useState<boolean>(false);

  // 严格只支持按曲目名搜索 (无作者名)
  const trimmedQuery = songNameSearch.trim().toLowerCase();
  const filteredSongs = isLibraryLoaded
    ? MOCK_SONGS.filter((s) => {
        if (!trimmedQuery) return true;
        return s.name.toLowerCase().includes(trimmedQuery);
      })
    : [];

  const handlePlaySong = (song: SongItem) => {
    onPlayById(song.id, selectedChannels);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    if (filteredSongs.length > 0) {
      handlePlaySong(filteredSongs[0]);
    } else {
      onPlayByName(songNameSearch.trim(), selectedChannels);
    }
  };

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefreshLibrary) {
        await onRefreshLibrary();
      }
      setIsLibraryLoaded(true);
      setRefreshToast('曲库已刷新就绪');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => {
        setRefreshToast('');
      }, 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fafbfc] overflow-hidden">
      {/* 1. 顶部操作栏 */}
      <div className="p-3.5 bg-white border-b border-gray-100 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
              <Music className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-gray-900">
                指定歌曲点播
              </h2>
              <p className="text-[10px] text-gray-400">
                {isLibraryLoaded ? '点击曲目立即起播' : '等待加载存储介质曲库'}
              </p>
            </div>
          </div>

          {/* 顶部操作区: 刷新曲库按键与播放通道设置 (去掉返回主页，更改为播放通道设置) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
              title="刷新存储介质曲库列表"
            >
              <RotateCw
                className={`w-3 h-3 text-gray-600 ${
                  isRefreshing ? 'animate-spin text-gray-900' : ''
                }`}
              />
              <span>{isRefreshing ? '刷新中...' : '刷新曲库'}</span>
            </button>

            {/* 仅通过弹窗设置输出通道 (只要弹窗设置) */}
            <button
              type="button"
              onClick={() => setIsChannelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-800 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer active:scale-95 shadow-2xs"
              title="设置音频输出通道"
            >
              <SlidersHorizontal className="w-3 h-3 text-gray-700" />
              <span>输出通道</span>
              <span className="text-[10px] bg-gray-900 text-white px-1.5 py-0.2 rounded-md font-mono font-bold leading-none">
                {selectedChannels.length}/4
              </span>
            </button>
          </div>
        </div>

        {/* 当曲库加载后展示曲目名搜索框 */}
        {isLibraryLoaded && (
          <>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={songNameSearch}
                onChange={(e) => setSongNameSearch(e.target.value)}
                placeholder="搜索曲目名（如：晴天、夜曲、如愿、卡农...）"
                className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3.5 py-2 pl-9 pr-8 border border-gray-200 focus:outline-hidden focus:bg-white focus:border-gray-900 transition-all font-medium"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              {songNameSearch && (
                <button
                  type="button"
                  onClick={() => setSongNameSearch('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title="清空搜索"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
              {refreshToast ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1 animate-fadeIn">
                  <CheckCircle className="w-3 h-3" />
                  <span>{refreshToast}</span>
                </span>
              ) : (
                <span>支持按曲目名实时检索与点播</span>
              )}
              <span className="font-mono">
                共 {filteredSongs.length} 首可用曲目
              </span>
            </div>
          </>
        )}
      </div>

      {/* 2. 主体区: 初始状态 (无歌曲列表，只有刷新曲库按钮) VS 刷新后曲库列表 */}
      {!isLibraryLoaded ? (
        /* 初始状态页面: 下方没有歌曲列表，只有刷新曲库的按钮 */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-linear-to-b from-[#fafbfc] to-gray-50/50">
          <div className="max-w-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-700 flex items-center justify-center mx-auto border border-gray-200 shadow-2xs">
              <FolderSync className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">曲库未加载</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                当前尚未读取存储介质曲目列表，请点击下方按钮从设备刷新曲库
              </p>
            </div>

            {/* 核心刷新曲库按钮 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="w-full py-3 px-5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>{isRefreshing ? '正在同步曲库...' : '刷新曲库'}</span>
              </button>
            </div>

            {refreshToast && (
              <p className="text-[11px] text-emerald-600 font-semibold animate-fadeIn flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{refreshToast}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* 刷新后的连续曲库列表 (彻底去除分页，所有歌曲只有歌曲名称没有作者名称) */
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-2">
          {filteredSongs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2 bg-white rounded-2xl border border-gray-100 p-6">
              <Search className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
              <p className="text-xs font-medium">未找到包含“{songNameSearch}”的曲目名</p>
              <button
                type="button"
                onClick={() => setSongNameSearch('')}
                className="text-xs text-gray-800 underline font-semibold cursor-pointer"
              >
                查看全部曲目
              </button>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gray-100/90 border-gray-400 shadow-xs'
                      : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/60 shadow-2xs'
                  }`}
                >
                  {/* 歌曲信息: 严格只有歌曲名称，没有作者名称 */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono text-[10px] font-bold text-gray-700 px-1.5 py-0.5 bg-gray-100 rounded-md shrink-0 border border-gray-200/60">
                      #{song.id}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">
                        {song.name}
                      </p>
                    </div>
                  </div>

                  {/* 状态与点播操作 (点击后：立即显示刚刚选择的歌曲名称，同时标记“播放中”) */}
                  <div
                    className="shrink-0 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>播放中</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePlaySong(song)}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>点播</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. 输出通道设置弹窗: 标题叫输出通道，去掉网格卡片 */}
      {isChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部: 标题叫输出通道 */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-semibold">
                  <SlidersHorizontal className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    输出通道
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    选择音频输出通道 (1-4 通道 可多选)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChannelModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="关闭弹窗"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 弹窗主体: 选择输出通道 (样式与文件夹播放选择通道完全保持一致) */}
            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-gray-700" />
                    <span>选择输出通道 (1-4 通道 可多选):</span>
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
                            通道 {ch.id} · 增益 {Math.round(ch.gain * 100)}%
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

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 space-y-1">
                <div className="font-semibold text-gray-700">说明:</div>
                <p>点播歌曲时，音频将通过所勾选的输出通道播放。支持同时选择多个通道实现多区同步播放。</p>
              </div>
            </div>

            {/* 底部确认按钮 */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsChannelModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => setIsChannelModalOpen(false)}
                disabled={selectedChannels.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认输出通道 ({selectedChannels.length}/4)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
