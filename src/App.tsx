import { useState } from 'react';
import { Terminal } from 'lucide-react';
import { useDeviceController } from './hooks/useDeviceController';
import { WeChatMiniHeader } from './components/WeChatMiniHeader';
import { PlayerCard } from './components/PlayerCard';
import { FeatureGrid } from './components/FeatureGrid';
import { VolumeControl } from './components/VolumeControl';
import { ChannelQuickBar } from './components/ChannelQuickBar';
import { SourceModal } from './components/SourceModal';
import { FolderChannelModal } from './components/FolderChannelModal';
import { DirectPlayModal } from './components/DirectPlayModal';
import { DebugSheet } from './components/DebugSheet';
import { MOCK_FOLDERS } from './mock/songs';

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
    toggleUsbInserted,
    toggleTfCardInserted,
    toggleBluetoothPaired,
  } = useDeviceController();

  // 统一弹窗模态管理
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState<boolean>(false);
  const [isDebugSheetOpen, setIsDebugSheetOpen] = useState<boolean>(false);

  const currentFolderObj =
    MOCK_FOLDERS.find((f) => f.path === selectedFolder) || MOCK_FOLDERS[0];

  return (
    <div className="min-h-screen bg-[#f1f2f5] flex justify-center text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      {/* 统一移动 App 容器 (纯白极简现代设计) */}
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-xl border-x border-gray-200/90 flex flex-col relative">
        {/* 1. App 统一头部 */}
        <WeChatMiniHeader
          deviceName="客厅背景音乐主机"
          isOnline={hardware.online}
          onOpenDebug={() => setIsDebugSheetOpen(true)}
        />

        {/* 2. 页面主体滚动流 (纯净白色系、统一间距与圆角卡片) */}
        <main className="flex-1 p-4 space-y-3.5 overflow-y-auto custom-scrollbar pb-8 bg-[#fafbfc]">
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

          {/* ② 3 宫格功能快捷弹窗栏 (消除页面上的重复按钮与杂乱元素) */}
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

          {/* ⑤ 底部整洁的调试与协议入口 */}
          <div className="pt-2 pb-4 text-center">
            <button
              type="button"
              onClick={() => setIsDebugSheetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs font-mono transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-gray-600" />
              <span>IoT 指令日志 ({logs.length}) · 硬件调试台</span>
            </button>
          </div>
        </main>
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

      {/* 弹窗 3: 指定歌曲播放弹窗 (按歌曲ID播放、按歌名播放、曲库列表) */}
      <DirectPlayModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        currentSongId={currentSong.id}
        isPlaying={isPlaying}
        onPlayById={playSongById}
        onPlayByName={playSongByName}
      />

      {/* 弹窗 4: 产品经理指令协议日志与硬件工装抽屉 */}
      <DebugSheet
        isOpen={isDebugSheetOpen}
        onClose={() => setIsDebugSheetOpen(false)}
        logs={logs}
        hardware={hardware}
        onClearLogs={clearLogs}
        onToggleUsb={toggleUsbInserted}
        onToggleTf={toggleTfCardInserted}
        onToggleBluetooth={toggleBluetoothPaired}
      />
    </div>
  );
}
