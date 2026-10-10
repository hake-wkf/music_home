import { useState } from 'react';
import { useDeviceController } from './hooks/useDeviceController';
import { WeChatMiniHeader } from './components/WeChatMiniHeader';
import { PlayerCard } from './components/PlayerCard';
import { FeatureGrid } from './components/FeatureGrid';
import { VolumeControl } from './components/VolumeControl';
import { ChannelQuickBar } from './components/ChannelQuickBar';
import { SourceModal } from './components/SourceModal';
import { FolderChannelModal } from './components/FolderChannelModal';
import { SongSelectionPage } from './components/SongSelectionPage';
import { ProtocolMonitor } from './components/ProtocolMonitor';
import { MOCK_FOLDERS } from './mock/songs';
import { X } from 'lucide-react';

export default function App() {
  const {
    playerStatus,
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
    simulateFetchingInfo,
    simulateQueryFailed,
    resetToInitialState,
    setSongStatusHasInfo,
    setSongStatusFetching,
    setSongStatusNoSong,
  } = useDeviceController();

  // 页面导航视图状态: 'home' (主控台页面) | 'songs' (指定歌曲点播独立页面，无弹窗)
  const [activeView, setActiveView] = useState<'home' | 'songs'>('home');

  // 弹窗模态管理 (输入源、指定文件夹)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);

  const currentFolderObj =
    MOCK_FOLDERS.find((f) => f.path === selectedFolder) || MOCK_FOLDERS[0];

  return (
    <div className="min-h-screen bg-[#eceff3] flex items-center justify-center p-0 sm:py-6 text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      {/* 统一移动 App 容器 (严格符合 App/小程序 高度约束，带原生底框，纯白极简家庭风格) */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[860px] bg-white shadow-2xl rounded-none sm:rounded-[44px] border-0 sm:border-[6px] sm:border-gray-900/90 flex flex-col overflow-hidden relative">
        {/* 1. App 统一头部 (在曲库页显示返回按钮与页面标题) */}
        <WeChatMiniHeader
          deviceName="客厅背景音乐主机"
          title={activeView === 'songs' ? '指定歌曲点播' : '客厅背景音乐主机'}
          showBack={activeView === 'songs'}
          onBack={() => setActiveView('home')}
          isOnline={hardware.online}
          onOpenDebug={() => setIsLogsModalOpen(true)}
        />

        {/* 2. 页面主体渲染区 */}
        {activeView === 'home' ? (
          /* 主控台视图 (高度受限滚动) */
          <main className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5 bg-[#fafbfc]">
            {/* ① 音乐播放主卡片 (支持3大歌曲播放状态: 有歌曲信息 / 播放信息获取中 / 暂无播放歌曲，已去除进度条) */}
            <PlayerCard
              playerStatus={playerStatus}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playMode={playMode}
              source={source}
              storageStatus={storageStatus}
              selectedFolderName={currentFolderObj.name}
              onTogglePlayPause={togglePlayPause}
              onPrevTrack={prevTrack}
              onNextTrack={nextTrack}
              onSetPlayMode={setMusicPlayMode}
              onGetCurrentSongInfo={getCurrentSongInfo}
              onSetSongStatusHasInfo={setSongStatusHasInfo}
              onSetSongStatusFetching={setSongStatusFetching}
              onSetSongStatusNoSong={setSongStatusNoSong}
              onSimulateFetchingInfo={simulateFetchingInfo}
              onSimulateQueryFailed={simulateQueryFailed}
              onResetToInitial={resetToInitialState}
            />

            {/* ② 3 宫格功能快捷栏 (指定歌曲点播跳转新页面) */}
            <FeatureGrid
              source={source}
              storageStatus={storageStatus}
              selectedFolderName={currentFolderObj.name}
              onOpenSourceModal={() => setIsSourceModalOpen(true)}
              onOpenFolderModal={() => setIsFolderModalOpen(true)}
              onNavigateToSongPage={() => setActiveView('songs')}
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
        ) : (
          /* 指定歌曲点播独立页面 (不要弹窗、不要分页、连续平滑滚动) */
          <SongSelectionPage
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlayById={playSongById}
            onPlayByName={playSongByName}
            onTogglePlayPause={togglePlayPause}
            onBackToHome={() => setActiveView('home')}
          />
        )}

        {/* 3. 原生 App 底框 (无底部导航栏，保留原生安全触控条底框) */}
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

      {/* 弹窗 3: 指令通信日志弹窗 (右上角菜单唤起) */}
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
