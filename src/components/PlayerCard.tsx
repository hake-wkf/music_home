import { useState } from 'react';
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
  ChevronDown,
  Loader2,
  CheckCircle2,
  Music2,
} from 'lucide-react';
import {
  SongItem,
  PlayMode,
  PLAY_MODES,
  PlayerPlaybackStatus,
  AudioSource,
  StorageStatusCode,
} from '../types/device';

interface PlayerCardProps {
  playerStatus: PlayerPlaybackStatus;
  currentSong: SongItem | null;
  isPlaying: boolean;
  playMode: PlayMode;
  source: AudioSource;
  storageStatus: StorageStatusCode;
  selectedFolderName: string;
  onTogglePlayPause: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSetPlayMode: (mode: PlayMode) => void;
  onGetCurrentSongInfo: (simulateFailure?: boolean) => void;
  onSetSongStatusHasInfo?: () => void;
  onSetSongStatusFetching?: () => void;
  onSetSongStatusNoSong?: () => void;
  onSimulateFetchingInfo?: () => void;
  onSimulateQueryFailed?: () => void;
  onResetToInitial?: () => void;
}

export function PlayerCard({
  playerStatus,
  currentSong,
  isPlaying,
  playMode,
  source,
  storageStatus,
  selectedFolderName,
  onTogglePlayPause,
  onPrevTrack,
  onNextTrack,
  onSetPlayMode,
  onGetCurrentSongInfo,
  onSetSongStatusHasInfo,
  onSetSongStatusFetching,
  onSetSongStatusNoSong,
}: PlayerCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);

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

  // =========================================================================
  // 歌曲播放状态判断 (严格对应用户需求: 1.有歌曲信息 2.播放信息获取中 3.暂无播放歌曲)
  // =========================================================================
  let currentPlaybackState: 'HAS_SONG' | 'FETCHING_INFO' | 'NO_SONG' = 'NO_SONG';

  if (playerStatus === 'FETCHING_INFO') {
    currentPlaybackState = 'FETCHING_INFO';
  } else if (
    playerStatus === 'HAS_SONG' ||
    playerStatus === 'PLAYING' ||
    playerStatus === 'PAUSED' ||
    (currentSong !== null && playerStatus !== 'NO_SONG' && playerStatus !== 'INITIAL')
  ) {
    currentPlaybackState = 'HAS_SONG';
  } else {
    currentPlaybackState = 'NO_SONG';
  }

  // 状态显示变量映射
  let displayTitle = '暂无播放歌曲';
  let displaySubtitle = '请选择歌曲开始播放';
  let badgeText = '暂无播放歌曲';
  let badgeColor = 'bg-gray-100 text-gray-600 border-gray-200';
  let idTag = '-';
  let folderTag = '等待选择曲目点播';
  let canSpin = false;

  if (currentPlaybackState === 'HAS_SONG') {
    const song = currentSong || {
      id: '001',
      name: '晴天',
      artist: '',
      album: '',
      folder: '流行金曲',
      duration: 269,
    };
    displayTitle = song.name;
    displaySubtitle = song.artist ? `${song.artist}` : `曲目编号 #${song.id}`;
    badgeText = isPlaying ? '有歌曲信息 · 播放中' : '有歌曲信息 · 已暂停';
    badgeColor = isPlaying
      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
      : 'bg-gray-100 text-gray-700 border-gray-200';
    idTag = `#${song.id}`;
    folderTag = `目录: ${song.folder || selectedFolderName || '流行精选'}`;
    canSpin = isPlaying;
  } else if (currentPlaybackState === 'FETCHING_INFO') {
    displayTitle = '播放信息获取中';
    displaySubtitle = '正在获取硬件解码芯片曲目信息...';
    badgeText = '播放信息获取中';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    idTag = '获取中';
    folderTag = '正在同步曲目元数据...';
    canSpin = true;
  } else {
    // NO_SONG 暂无播放歌曲
    displayTitle = '暂无播放歌曲';
    displaySubtitle = '请选择歌曲开始播放';
    badgeText = '暂无播放歌曲';
    badgeColor = 'bg-gray-100 text-gray-600 border-gray-200';
    idTag = '-';
    folderTag = '存储介质就绪 · 等待点播';
    canSpin = false;
  }

  return (
    <section className="bg-white border border-gray-200/90 rounded-3xl p-4 shadow-xs space-y-4 relative">
      {/* 唱片与歌曲信息区 */}
      <div className="flex items-center gap-3.5">
        {/* 黑胶唱片 (播放时旋转，暂停/未播放静止) */}
        <div className="relative shrink-0">
          <div
            className={`w-17 h-17 rounded-full bg-linear-to-tr from-gray-950 via-gray-900 to-gray-800 border-2 border-gray-200 shadow-xs flex items-center justify-center transition-all ${
              canSpin ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '9s' }}
          >
            <div className="w-10 h-10 rounded-full border border-gray-700/80 flex items-center justify-center">
              <div className="w-6.5 h-6.5 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center">
                <Disc className="w-3.5 h-3.5 text-gray-300" />
              </div>
            </div>
          </div>
          <span
            className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full border shadow-2xs whitespace-nowrap ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>

        {/* 歌曲详情及状态 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded-md border border-gray-200 shrink-0">
                {idTag}
              </span>
              <h2 className="text-sm font-bold text-gray-900 truncate" title={displayTitle}>
                {displayTitle}
              </h2>
            </div>

            {/* 曲目信息操作入口 */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-1.5 py-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                title="曲目信息操作"
              >
                <Info className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* 曲目信息操作下拉框 */}
              {showStatusMenu && (
                <>
                  {/* 点击背景遮罩关闭 */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-7 z-40 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-56 text-left space-y-1 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-gray-400 border-b border-gray-100">
                      曲目信息操作
                    </div>

                    {/* 状态 1: 有歌曲信息 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSetSongStatusHasInfo) onSetSongStatusHasInfo();
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        currentPlaybackState === 'HAS_SONG'
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>有歌曲信息</span>
                      </div>
                      {currentPlaybackState === 'HAS_SONG' && (
                        <span className="text-[10px] text-emerald-600 font-mono">当前</span>
                      )}
                    </button>

                    {/* 状态 2: 播放信息获取中 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSetSongStatusFetching) onSetSongStatusFetching();
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        currentPlaybackState === 'FETCHING_INFO'
                          ? 'bg-blue-50 text-blue-800 font-bold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Loader2
                          className={`w-3.5 h-3.5 text-blue-600 ${
                            currentPlaybackState === 'FETCHING_INFO' ? 'animate-spin' : ''
                          }`}
                        />
                        <span>播放信息获取中</span>
                      </div>
                      {currentPlaybackState === 'FETCHING_INFO' && (
                        <span className="text-[10px] text-blue-600 font-mono">当前</span>
                      )}
                    </button>

                    {/* 状态 3: 暂无播放歌曲 */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSetSongStatusNoSong) onSetSongStatusNoSong();
                        setShowStatusMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        currentPlaybackState === 'NO_SONG'
                          ? 'bg-gray-100 text-gray-900 font-bold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Music2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>暂无播放歌曲</span>
                      </div>
                      {currentPlaybackState === 'NO_SONG' && (
                        <span className="text-[10px] text-gray-500 font-mono">当前</span>
                      )}
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* 真实下发获取当前歌曲 */}
                    <button
                      type="button"
                      onClick={() => {
                        onGetCurrentSongInfo();
                        setShowStatusMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <span>查询当前歌曲信息</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 truncate mt-1">{displaySubtitle}</p>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{folderTag}</p>
        </div>
      </div>

      {/* 注意：已严格按用户要求去除播放进度条 */}

      {/* 核心控制栏 (模式切换、上一曲、播放/暂停、下一曲) */}
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

        {/* 核心播放三键 */}
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
