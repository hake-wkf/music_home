import { useState, type FormEvent } from 'react';
import {
  Search,
  Music,
  Play,
  Pause,
  CheckCircle,
  Disc,
  ArrowLeft,
  X,
  Volume2,
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
}

export function SongSelectionPage({
  currentSong,
  isPlaying,
  onPlayById,
  onPlayByName,
  onTogglePlayPause,
  onBackToHome,
}: SongSelectionPageProps) {
  const [songNameSearch, setSongNameSearch] = useState<string>('');

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

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>返回主页</span>
          </button>
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

        <div className="flex items-center justify-end text-[10px] text-gray-400 px-0.5">
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

      {/* 3. 页面底部常驻迷你播放控制条 */}
      <div className="bg-white border-t border-gray-200/90 p-2.5 px-3.5 flex items-center justify-between shrink-0 shadow-xs">
        <div
          onClick={onBackToHome}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div
            className={`w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-2xs ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '8s' }}
          >
            <Disc className="w-4 h-4 text-gray-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {currentSong ? currentSong.name : '暂无播放歌曲'}
            </p>
            <p className="text-[10px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-gray-400" />
              <span>
                {currentSong
                  ? `${currentSong.artist} · 点击返回主控台`
                  : '请在上方列表中点播歌曲'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="w-8 h-8 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onBackToHome}
            className="px-2.5 py-1 text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            主控台
          </button>
        </div>
      </div>
    </div>
  );
}
