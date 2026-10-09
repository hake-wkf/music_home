import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  ListOrdered,
  PlayCircle,
  Disc,
  Info,
} from 'lucide-react';
import { SongItem, PlayMode, PLAY_MODES } from '../types/device';

interface PlayerCardProps {
  currentSong: SongItem;
  currentTime: number;
  isPlaying: boolean;
  playMode: PlayMode;
  onTogglePlayPause: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSetPlayMode: (mode: PlayMode) => void;
  onGetCurrentSongInfo: () => void;
}

export function PlayerCard({
  currentSong,
  currentTime,
  isPlaying,
  playMode,
  onTogglePlayPause,
  onPrevTrack,
  onNextTrack,
  onSetPlayMode,
  onGetCurrentSongInfo,
}: PlayerCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.round((currentTime / Math.max(1, currentSong.duration)) * 100)
  );

  const cyclePlayMode = () => {
    const nextMode = ((playMode + 1) % 5) as PlayMode;
    onSetPlayMode(nextMode);
  };

  const currentModeInfo = PLAY_MODES.find((m) => m.id === playMode) || PLAY_MODES[3];

  const getModeIcon = (mode: PlayMode) => {
    switch (mode) {
      case 0:
        return <PlayCircle className="w-4 h-4 text-gray-700" />;
      case 1:
        return <Repeat1 className="w-4 h-4 text-gray-700" />;
      case 2:
        return <ListOrdered className="w-4 h-4 text-gray-700" />;
      case 3:
        return <Repeat className="w-4 h-4 text-gray-700" />;
      case 4:
        return <Shuffle className="w-4 h-4 text-gray-700" />;
      default:
        return <Repeat className="w-4 h-4 text-gray-700" />;
    }
  };

  return (
    <section className="bg-white border border-gray-200/90 rounded-3xl p-4.5 shadow-xs space-y-4">
      {/* 唱片与歌曲信息区 */}
      <div className="flex items-center gap-4">
        {/* 黑胶唱片 */}
        <div className="relative shrink-0">
          <div
            className={`w-18 h-18 rounded-full bg-linear-to-tr from-gray-950 via-gray-900 to-gray-800 border-2 border-gray-200 shadow-xs flex items-center justify-center transition-all ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '9s' }}
          >
            <div className="w-11 h-11 rounded-full border border-gray-700/80 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center">
                <Disc className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
          <span
            className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs ${
              isPlaying
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {isPlaying ? '播放中' : '已暂停'}
          </span>
        </div>

        {/* 歌曲详情 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-md border border-gray-200 shrink-0">
                #{currentSong.id}
              </span>
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {currentSong.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onGetCurrentSongInfo}
              className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="发送指令: 获取播放歌曲的ID以及名称"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">
            {currentSong.artist} · 《{currentSong.album}》
          </p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
            目录: {currentSong.folder}
          </p>
        </div>
      </div>

      {/* 进度条与播放时间 */}
      <div className="space-y-1">
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gray-900 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[10px] text-gray-400 font-sans">
            {currentModeInfo.name} ({progressPercent}%)
          </span>
          <span>{formatTime(currentSong.duration)}</span>
        </div>
      </div>

      {/* 核心控制栏 */}
      <div className="flex items-center justify-between pt-1">
        {/* 循环模式按键 */}
        <button
          type="button"
          onClick={cyclePlayMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
          title={`当前模式: ${currentModeInfo.name} (点击切换)`}
        >
          {getModeIcon(playMode)}
          <span className="text-xs font-mono">[{playMode}]</span>
          <span>{currentModeInfo.name}</span>
        </button>

        {/* 核心三键 */}
        <div className="flex items-center gap-2.5">
          {/* 上一首 */}
          <button
            type="button"
            onClick={onPrevTrack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all active:scale-90 cursor-pointer shadow-2xs"
            title="发送指令: 切换上一首"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* 播放 / 暂停 */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-900 hover:bg-black text-white transition-all active:scale-95 cursor-pointer shadow-xs"
            title={isPlaying ? '发送指令: 暂停' : '发送指令: 播放'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* 下一首 */}
          <button
            type="button"
            onClick={onNextTrack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all active:scale-90 cursor-pointer shadow-2xs"
            title="发送指令: 切换下一首"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
