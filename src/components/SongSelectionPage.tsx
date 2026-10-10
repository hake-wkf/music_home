import { useState, type FormEvent } from 'react';
import {
  Search,
  Music,
  Play,
  CheckCircle,
  ArrowLeft,
  X,
  RotateCw,
} from 'lucide-react';
import { SongItem } from '../types/device';
import { MOCK_SONGS } from '../mock/songs';

interface SongSelectionPageProps {
  currentSong: SongItem | null;
  isPlaying: boolean;
  onPlayById: (songId: string) => void;
  onPlayByName: (songName: string) => void;
  onTogglePlayPause: () => void;
  onBackToHome: () => void;
  onRefreshLibrary?: () => Promise<number | void> | void;
}

export function SongSelectionPage({
  currentSong,
  isPlaying,
  onPlayById,
  onPlayByName,
  onTogglePlayPause,
  onBackToHome,
  onRefreshLibrary,
}: SongSelectionPageProps) {
  const [songNameSearch, setSongNameSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshToast, setRefreshToast] = useState<string>('');

  // 严格只支持按曲目名搜索 (搜索只支持曲目名)
  const trimmedQuery = songNameSearch.trim().toLowerCase();
  const filteredSongs = MOCK_SONGS.filter((s) => {
    if (!trimmedQuery) return true;
    return s.name.toLowerCase().includes(trimmedQuery);
  });

  const handlePlaySong = (song: SongItem) => {
    onPlayById(song.id);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    if (filteredSongs.length > 0) {
      handlePlaySong(filteredSongs[0]);
    } else {
      onPlayByName(songNameSearch.trim());
    }
  };

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefreshLibrary) {
        await onRefreshLibrary();
      }
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
      {/* 1. 顶部操作区与曲目名搜索条 */}
      <div className="p-3.5 bg-white border-b border-gray-100 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
              <Music className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-gray-900">
                本地存储曲库点播
              </h2>
              <p className="text-[10px] text-gray-400">
                点击曲目立即下发指令起播
              </p>
            </div>
          </div>

          {/* 刷新曲库按键与返回主页 */}
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

            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>返回主页</span>
            </button>
          </div>
        </div>

        {/* 曲目名搜索框 (只支持曲目名搜索，输入即实时过滤) */}
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
            <span>支持实时检索与点播</span>
          )}
          <span className="font-mono">
            共 {filteredSongs.length} 首可用曲目
          </span>
        </div>
      </div>

      {/* 2. 连续曲库列表 (彻底去除分页，支持全量平滑原生滚动) */}
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
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-gray-100/90 border-gray-400 shadow-xs'
                    : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/60 shadow-2xs'
                }`}
              >
                {/* 歌曲信息 */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold text-gray-700 px-1.5 py-0.5 bg-gray-100 rounded-md shrink-0 border border-gray-200/60">
                    #{song.id}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-xs truncate">
                      {song.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {song.artist} · 《{song.album}》
                    </p>
                  </div>
                </div>

                {/* 状态与点播操作 (用户点击后：立即显示刚刚选择的歌曲名称，同时标记“播放中”) */}
                <div className="shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}
