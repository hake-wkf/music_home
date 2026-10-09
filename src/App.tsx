import { useState } from 'react';
import { useDeviceController } from './hooks/useDeviceController';
import { WeChatMiniHeader } from './components/WeChatMiniHeader';
import { PlayerCard } from './components/PlayerCard';
import { FeatureGrid } from './components/FeatureGrid';
import { VolumeControl } from './components/VolumeControl';
import { ChannelQuickBar } from './components/ChannelQuickBar';
import { SourceModal } from './components/SourceModal';
import { FolderChannelModal } from './components/FolderChannelModal';
import { DirectPlayModal } from './components/DirectPlayModal';
import { ProtocolMonitor } from './components/ProtocolMonitor';
import { MOCK_FOLDERS } from './mock/songs';
import { X } from 'lucide-react';

export default function App() {
  const {
    source,
    storageStatus,
    totalFiles,
    volume,
    isMuted,
    isPlaying,
    currentSong,
    currentTime,
    playMode,
    selectedFolder,
    selectedChannels,
    channels,
    hardware,
    logs,
    setAudioSource,
    queryAudioSource,
    setMusicVolume,
    queryMusicVolume,
    queryStorageStatus,
    getTotalFiles,
    getCurrentSongInfo,
    playSongById,
    playSongByName,
    playFolderWithChannels,
    togglePlayPause,
    setMusicPlayMode,
    prevTrack,
    nextTrack,
    toggleMute,
    toggleChannel,
    clearLogs,
  } = useDeviceController();

  // 弹窗模态管理
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);

  const currentFolderObj =
    MOCK_FOLDERS.find((f) => f.path === selectedFolder) || MOCK_FOLDERS[0];

  return (
    <div className="min-h-screen bg-[#eceff3] flex items-center justify-center p-0 sm:py-6 text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      {/* 统一移动 App 容器 (严格符合 App/小程序 高度约束，带原生底框) */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[860px] bg-white shadow-2xl rounded-none sm:rounded-[44px] border-0 sm:border-[6px] sm:border-gray-900/90 flex flex-col overflow-hidden relative">
        {/* 1. App 统一头部 */}
        <WeChatMiniHeader
          deviceName="客厅背景音乐主机"
          isOnline={hardware.online}
          onOpenDebug={() => setIsLogsModalOpen(true)}
        />

        {/* 2. 页面主体滚动区 (高度受限滚动，纯白极简家庭风格) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5 bg-[#fafbfc]">
          {/* ① 音乐播放主卡片 */}
          <PlayerCard
            currentSong={currentSong}
            currentTime={currentTime}
            isPlaying={isPlaying}
            playMode={playMode}
            onTogglePlayPause={togglePlayPause}
            onPrevTrack={prevTrack}
            onNextTrack={nextTrack}
            onSetPlayMode={setMusicPlayMode}
            onGetCurrentSongInfo={getCurrentSongInfo}
          />

          {/* ② 3 宫格功能快捷弹窗栏 */}
          <FeatureGrid
            source={source}
            storageStatus={storageStatus}
            selectedFolderName={currentFolderObj.name}
            onOpenSourceModal={() => setIsSourceModalOpen(true)}
            onOpenFolderModal={() => setIsFolderModalOpen(true)}
            onOpenSongModal={() => setIsSongModalOpen(true)}
          />

          {/* ③ 音乐播放主音量调节 */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onSetVolume={setMusicVolume}
            onQueryVolume={queryMusicVolume}
            onToggleMute={toggleMute}
          />

          {/* ④ 房间播放分区 (4通道独立控制) */}
          <ChannelQuickBar
            channels={channels}
            selectedChannels={selectedChannels}
            onToggleChannel={toggleChannel}
          />
        </main>

        {/* 3. 原生 App 底框 (无导航栏，保留触控条底框) */}
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 py-2.5 shrink-0 select-none">
          <div className="w-28 h-1 bg-gray-300 rounded-full mx-auto"></div>
        </div>
      </div>

      {/* 弹窗 1: 输入源与介质管理弹窗 (设置音乐输入源、查询输入源、查询USB/TF卡状态、获取文件总数) */}
      <SourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={source}
        storageStatus={storageStatus}
        totalFiles={totalFiles}
        onSelectSource={setAudioSource}
        onQuerySource={queryAudioSource}
        onQueryStorageStatus={queryStorageStatus}
        onGetTotalFiles={getTotalFiles}
      />

      {/* 弹窗 2: 指定文件夹播放弹窗 (下拉选择文件夹; 选择播放通道1-4可多选) */}
      <FolderChannelModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        selectedFolder={selectedFolder}
        selectedChannels={selectedChannels}
        channels={channels}
        onPlayFolderWithChannels={playFolderWithChannels}
        onToggleChannel={toggleChannel}
      />

      {/* 弹窗 3: 指定歌曲播放弹窗 (曲库列表分页、按曲目名搜索) */}
      <DirectPlayModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        currentSongId={currentSong.id}
        isPlaying={isPlaying}
        onPlayById={playSongById}
        onPlayByName={playSongByName}
      />

      {/* 弹窗 4: 指令通信日志弹窗 (右上角菜单唤起) */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[82vh] max-h-[720px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-900">
                IoT 指令通信日志 ({logs.length})
              </span>
              <button
                type="button"
                onClick={() => setIsLogsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3.5 bg-gray-50/50">
              <ProtocolMonitor logs={logs} onClearLogs={clearLogs} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
