import { useState } from 'react';
import { X, Search, Music, Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SongItem } from '../types/device';
import { MOCK_SONGS } from '../mock/songs';

interface DirectPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSongId: string;
  isPlaying: boolean;
  onPlayById: (songId: string) => void;
  onPlayByName: (songName: string) => void;
}

const PAGE_SIZE = 5; // 每页展示 5 首曲目，在移动端弹窗内无需过多翻滚即可完整查看

export function DirectPlayModal({
  isOpen,
  onClose,
  currentSongId,
  isPlaying,
  onPlayById,
  onPlayByName,
}: DirectPlayModalProps) {
  const [songNameSearch, setSongNameSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (!isOpen) return null;

  // 严格只支持按曲目名搜索 (搜索只支持曲目名)
  const trimmedQuery = songNameSearch.trim().toLowerCase();
  const filteredSongs = MOCK_SONGS.filter((s) => {
    if (!trimmedQuery) return true;
    return s.name.toLowerCase().includes(trimmedQuery);
  });

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const currentPagedSongs = filteredSongs.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSongNameSearch(val);
    setCurrentPage(1); // 搜索词变动时自动重置回第 1 页
  };

  const handlePlaySong = (song: SongItem) => {
    onPlayById(song.id);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    if (filteredSongs.length > 0) {
      handlePlaySong(filteredSongs[0]);
    } else {
      onPlayByName(songNameSearch.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 弹窗头部 */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-semibold">
              <Music className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                指定歌曲点播
              </h2>
              <p className="text-[11px] text-gray-500">
                分页曲库 · 支持按曲目名精准过滤
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

        {/* 2. 搜索框 (只支持曲目名搜索) */}
        <div className="p-3.5 bg-white border-b border-gray-100 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={songNameSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索曲目名（如：晴天、夜曲、如愿...）"
              className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3.5 py-2.5 pl-9 pr-8 border border-gray-200 focus:outline-hidden focus:bg-white focus:border-gray-900 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            {songNameSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                title="清空搜索"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
            <span>仅按曲目名检索</span>
            <span className="font-mono">
              共 {filteredSongs.length} 首曲目 · 每页 {PAGE_SIZE} 首
            </span>
          </div>
        </div>

        {/* 3. 分页曲库列表主体 */}
        <div className="p-3.5 flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-gray-50/40 min-h-[300px]">
          {filteredSongs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
              <p className="text-xs">未找到包含“{songNameSearch}”的曲目名</p>
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-xs text-gray-700 underline font-medium cursor-pointer"
              >
                查看全部歌曲
              </button>
            </div>
          ) : (
            currentPagedSongs.map((song: SongItem) => {
              const isCurrent = song.id === currentSongId;
              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-gray-100 border-gray-300 shadow-2xs'
                      : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono text-[11px] font-bold text-gray-700 px-1.5 py-0.5 bg-gray-100 rounded-md shrink-0">
                      #{song.id}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">
                        {song.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {song.artist} · 《{song.album}》
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isCurrent && isPlaying ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
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

        {/* 4. 分页控制条 (Pagination Controls) */}
        {filteredSongs.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>上一页</span>
            </button>

            {/* 页码指示器与快捷页码胶囊 */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    safeCurrentPage === pageNum
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors cursor-pointer"
            >
              <span>下一页</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5. 底部返回栏 */}
        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-400 font-mono">
            第 {safeCurrentPage} / {totalPages} 页 (共 {filteredSongs.length} 首)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
