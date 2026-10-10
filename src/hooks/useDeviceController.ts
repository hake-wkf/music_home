import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AudioSource,
  StorageStatusCode,
  PlayMode,
  AudioChannel,
  ChannelInfo,
  SongItem,
  ProtocolLog,
  HardwareState,
  PlayerPlaybackStatus,
} from '../types/device';
import { MOCK_FOLDERS, MOCK_SONGS } from '../mock/songs';
import { audioSynth } from '../utils/audioSynth';

export function useDeviceController() {
  // 1. 歌曲播放状态 (严格对应产品规范: 1.有歌曲信息 2.播放信息获取中 3.暂无播放歌曲)
  // 刚进入页面初始状态: 'NO_SONG' (显示“暂无播放歌曲”“请选择歌曲开始播放”)
  const [playerStatus, setPlayerStatus] = useState<PlayerPlaybackStatus>('NO_SONG');

  // 2. 当前输入源: 1: USB, 2: TF卡, 3: 蓝牙 (默认TF卡)
  const [source, setSource] = useState<AudioSource>(2);

  // 3. 存储卡状态: '0': 未插卡, '01': 正在播放, '02': 就绪未播放
  const [storageStatus, setStorageStatus] = useState<StorageStatusCode>('02');

  // 4. 当前播放歌曲 (刚进入页面时为 null)
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);

  // 5. 当前播放进度 (秒)
  const [currentTime, setCurrentTime] = useState<number>(0);

  // 6. 是否正在播放
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 7. 文件总数
  const [totalFiles, setTotalFiles] = useState<number>(MOCK_SONGS.length);

  // 8. 当前音量 (0-100)
  const [volume, setVolume] = useState<number>(45);

  // 9. 是否静音
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 10. 播放模式: 0: 单次, 1: 单曲循环, 2: 顺序播放, 3: 列表循环, 4: 随机播放
  const [playMode, setPlayMode] = useState<PlayMode>(3); // 默认列表循环

  // 11. 选中的文件夹
  const [selectedFolder, setSelectedFolder] = useState<string>(MOCK_FOLDERS[0].path);

  // 12. 选中的通道 (1-4 可多选)
  const [selectedChannels, setSelectedChannels] = useState<AudioChannel[]>([1, 2]);

  // 通道状态配置 (1-4 通道，规范命名为通道一、通道二、通道三、通道四)
  const [channels, setChannels] = useState<ChannelInfo[]>([
    { id: 1, name: '通道一', zone: 'CH 1', power: true, gain: 1.0 },
    { id: 2, name: '通道二', zone: 'CH 2', power: true, gain: 0.8 },
    { id: 3, name: '通道三', zone: 'CH 3', power: false, gain: 0.7 },
    { id: 4, name: '通道四', zone: 'CH 4', power: false, gain: 0.9 },
  ]);

  // 硬件仿真模拟
  const [hardware, setHardware] = useState<HardwareState>({
    usbInserted: true,
    tfCardInserted: true,
    bluetoothPaired: true,
    bluetoothDeviceName: '客厅的 iPhone',
    firmwareVersion: 'v2.4.8-Home',
    deviceMac: '84:F3:EB:C8:10:A2',
    online: true,
    latencyMs: 120,
  });

  // 通信协议日志
  const [logs, setLogs] = useState<ProtocolLog[]>([]);
  const logIdRef = useRef<number>(1);
  const folderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 添加协议日志助手
  const addLog = useCallback(
    (
      direction: 'TX' | 'RX' | 'AUTO' | 'SYS',
      command: string,
      rawHex: string,
      payload: Record<string, unknown> | string,
      description: string,
      statusBadge?: string,
      isAutoTrigger: boolean = false
    ) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;

      const newLog: ProtocolLog = {
        id: `log_${logIdRef.current++}`,
        timestamp: timeStr,
        direction,
        command,
        rawHex,
        payload,
        description,
        statusBadge,
        isAutoTrigger,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    },
    []
  );

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // =========================================================================
  // 1. 设置音乐输入源 (支持3种切换: 1: USB, 2: TF卡, 3: 蓝牙)
  // =========================================================================
  const setAudioSource = useCallback(
    async (targetSource: AudioSource) => {
      audioSynth.playClickBeep(980);
      const sourceName = targetSource === 1 ? 'USB' : targetSource === 2 ? 'TF卡' : '蓝牙';

      const txHex = `AA 55 10 01 0${targetSource} ED`;
      addLog(
        'TX',
        'SET_SOURCE',
        txHex,
        { source: targetSource, name: sourceName },
        `指令下发: 设置音乐输入源为 [${sourceName}] (代码: ${targetSource})`
      );

      await delay(hardware.latencyMs);

      const rxHex = `AA 55 90 01 00 ED`;
      addLog(
        'RX',
        'RESP_SET_SOURCE',
        rxHex,
        { code: 0, status: 'SUCCESS', activeSource: targetSource },
        `设备应答: 输入源已切换至 [${sourceName}]`,
        '切换成功'
      );

      setSource(targetSource);

      // 根据目标音源自动响应初始显示状态
      if (targetSource === 3) {
        // 蓝牙模式：显示“蓝牙播放”“请在手机端选择音乐”
        setPlayerStatus('BLUETOOTH');
      } else {
        const isInserted = targetSource === 1 ? hardware.usbInserted : hardware.tfCardInserted;
        if (!isInserted) {
          // USB/TF 未插卡：显示“未检测到存储卡”
          setStorageStatus('0');
          setPlayerStatus('NO_CARD');
        } else if (!isPlaying) {
          // USB/TF 就绪未播放：显示“等待播放”“选择歌曲开始播放”
          setStorageStatus('02');
          if (!currentSong) {
            setPlayerStatus('READY_WAITING');
          }
        }
      }
    },
    [addLog, currentSong, hardware.latencyMs, hardware.tfCardInserted, hardware.usbInserted, isPlaying]
  );

  // =========================================================================
  // 2. 查询音乐输入源
  // =========================================================================
  const queryAudioSource = useCallback(async () => {
    audioSynth.playClickBeep(750);
    const txHex = `AA 55 11 00 ED`;
    addLog('TX', 'QUERY_SOURCE', txHex, {}, '指令下发: 查询当前音乐输入源');

    await delay(hardware.latencyMs);

    const rxHex = `AA 55 91 01 0${source} ED`;
    const sourceName = source === 1 ? 'USB' : source === 2 ? 'TF卡' : '蓝牙';
    addLog(
      'RX',
      'RESP_QUERY_SOURCE',
      rxHex,
      { source, name: sourceName },
      `设备上报: 当前输入源为 [${sourceName}] (${source})`,
      `${sourceName} 工作中`
    );
  }, [addLog, hardware.latencyMs, source]);

  // =========================================================================
  // 3. 设置音乐播放音量
  // =========================================================================
  const setMusicVolume = useCallback(
    async (newVolume: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newVolume)));
      setVolume(clamped);
      audioSynth.setVolume(clamped);

      const hexVol = clamped.toString(16).padStart(2, '0').toUpperCase();
      const txHex = `AA 55 20 01 ${hexVol} ED`;
      addLog(
        'TX',
        'SET_VOLUME',
        txHex,
        { volume: clamped },
        `指令下发: 设置播放音量为 ${clamped}% (0x${hexVol})`
      );

      await delay(hardware.latencyMs);

      const rxHex = `AA 55 A0 01 00 ED`;
      addLog(
        'RX',
        'RESP_SET_VOLUME',
        rxHex,
        { code: 0, currentVolume: clamped },
        `设备应答: 主机音量已调节至 ${clamped}%`,
        '音量已生效'
      );
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 4. 查询音乐播放音量
  // =========================================================================
  const queryMusicVolume = useCallback(async () => {
    audioSynth.playClickBeep(700);
    const txHex = `AA 55 21 00 ED`;
    addLog('TX', 'QUERY_VOLUME', txHex, {}, '指令下发: 查询当前音乐播放音量');

    await delay(hardware.latencyMs);

    const hexVol = volume.toString(16).padStart(2, '0').toUpperCase();
    const rxHex = `AA 55 A1 01 ${hexVol} ED`;
    addLog(
      'RX',
      'RESP_QUERY_VOLUME',
      rxHex,
      { volume, hex: `0x${hexVol}` },
      `设备上报: 当前播放音量为 ${volume}%`,
      `音量: ${volume}%`
    );
  }, [addLog, hardware.latencyMs, volume]);

  // =========================================================================
  // 5. 查询 USB/TF卡状态: 0: 未插卡, 01: 正在播放, 02: 就绪未播放
  // =========================================================================
  const queryStorageStatus = useCallback(async () => {
    audioSynth.playClickBeep(700);
    const txHex = `AA 55 30 00 ED`;
    addLog('TX', 'QUERY_STORAGE_STATUS', txHex, {}, '指令下发: 查询 USB/TF卡状态');

    await delay(hardware.latencyMs);

    let statusCode: StorageStatusCode = '02';
    const currentSrc = source;
    if (currentSrc === 1) {
      if (!hardware.usbInserted) statusCode = '0';
      else if (isPlaying) statusCode = '01';
      else statusCode = '02';
    } else if (currentSrc === 2) {
      if (!hardware.tfCardInserted) statusCode = '0';
      else if (isPlaying) statusCode = '01';
      else statusCode = '02';
    } else {
      statusCode = isPlaying ? '01' : '02';
    }

    setStorageStatus(statusCode);

    // 状态机联动根据要求更新显示
    if (currentSrc !== 3) {
      if (statusCode === '0') {
        // USB/TF 未插卡：显示“未检测到存储卡”
        setPlayerStatus('NO_CARD');
      } else if (statusCode === '02' && !isPlaying) {
        // USB/TF 就绪未播放：显示“等待播放”“选择歌曲开始播放”
        setPlayerStatus('READY_WAITING');
      } else if (statusCode === '01') {
        setPlayerStatus('PLAYING');
      }
    }

    const statusMap: Record<StorageStatusCode, string> = {
      '0': '0: 未插卡',
      '01': '01: 正在播放',
      '02': '02: 就绪未播放',
    };

    const rxHex = `AA 55 B0 02 0${currentSrc} ${statusCode.padStart(2, '0')} ED`;
    addLog(
      'RX',
      'RESP_STORAGE_STATUS',
      rxHex,
      {
        source: currentSrc,
        statusCode,
        statusText: statusMap[statusCode],
        inserted: statusCode !== '0',
      },
      `设备上报: 存储介质状态为 [${statusMap[statusCode]}]`,
      statusMap[statusCode]
    );
  }, [addLog, hardware.latencyMs, hardware.tfCardInserted, hardware.usbInserted, isPlaying, source]);

  // =========================================================================
  // 6. 获取文件总数
  // =========================================================================
  const getTotalFiles = useCallback(async () => {
    audioSynth.playClickBeep(850);
    const txHex = `AA 55 31 00 ED`;
    addLog('TX', 'GET_TOTAL_FILES', txHex, {}, '指令下发: 获取存储介质中的音频文件总数');

    await delay(hardware.latencyMs);

    const count = storageStatus === '0' ? 0 : MOCK_SONGS.length;
    setTotalFiles(count);

    const hexCount = count.toString(16).padStart(4, '0').toUpperCase();
    const rxHex = `AA 55 B1 02 ${hexCount.slice(0, 2)} ${hexCount.slice(2, 4)} ED`;
    addLog(
      'RX',
      'RESP_TOTAL_FILES',
      rxHex,
      { totalFiles: count, hex: `0x${hexCount}` },
      `设备上报: 音频文件总计 ${count} 首`,
      `${count} 首音频`
    );
  }, [addLog, hardware.latencyMs, storageStatus]);

  // 刷新曲库列表指令
  const refreshSongLibrary = useCallback(async () => {
    audioSynth.playClickBeep(880);
    const txHex = `AA 55 42 00 ED`;
    addLog('TX', 'REFRESH_SONG_LIBRARY', txHex, {}, '指令下发: 刷新存储介质曲库列表');

    await delay(hardware.latencyMs);

    const count = storageStatus === '0' ? 0 : MOCK_SONGS.length;
    setTotalFiles(count);

    const rxHex = `AA 55 C2 01 00 ED`;
    addLog(
      'RX',
      'RESP_REFRESH_LIBRARY',
      rxHex,
      { code: 0, totalSongs: count, status: 'SYNCED' },
      `设备应答: 曲库已成功刷新同步 (当前共 ${count} 首曲目)`,
      '曲库已刷新'
    );
    return count;
  }, [addLog, hardware.latencyMs, storageStatus]);

  // =========================================================================
  // 7. 获取播放歌曲的id以及名称 (查询失败: 显示“播放信息暂不可用”，保留播放控制)
  // =========================================================================
  const getCurrentSongInfo = useCallback(
    async (simulateFailure: boolean = false) => {
      audioSynth.playClickBeep(780);
      const txHex = `AA 55 40 00 ED`;
      addLog('TX', 'GET_CURRENT_SONG', txHex, {}, '指令下发: 获取当前播放歌曲的ID以及名称');

      await delay(hardware.latencyMs);

      if (simulateFailure || (!currentSong && playerStatus !== 'PLAYING')) {
        // 查询失败：显示“播放信息暂不可用”，保留播放控制
        setPlayerStatus('QUERY_FAILED');
        const rxHex = `AA 55 C0 01 FF ED`;
        addLog(
          'RX',
          'RESP_CURRENT_SONG_FAIL',
          rxHex,
          { code: 0xff, error: 'QUERY_TIMEOUT_OR_UNAVAILABLE' },
          `设备上报: 曲目信息查询失败 (暂不可用)，保留基础播放控制`,
          '查询失败'
        );
        return;
      }

      const activeSong = currentSong || MOCK_SONGS[0];
      const songIdHex = activeSong.id.padStart(4, '0');
      const rxHex = `AA 55 C0 10 ${songIdHex.slice(0, 2)} ${songIdHex.slice(2, 4)} ... ED`;
      addLog(
        'RX',
        'RESP_CURRENT_SONG',
        rxHex,
        {
          id: activeSong.id,
          name: activeSong.name,
          artist: activeSong.artist,
          folder: activeSong.folder,
          duration: activeSong.duration,
        },
        `设备上报: 当前曲目 ID=[${activeSong.id}] 《${activeSong.name}》`,
        `ID:${activeSong.id}`
      );

      // 成功查到歌曲后恢复播放中状态
      if (isPlaying) {
        setPlayerStatus('PLAYING');
      }
    },
    [addLog, currentSong, hardware.latencyMs, isPlaying, playerStatus]
  );

  // =========================================================================
  // 8. 指定歌曲id播放歌曲
  // 用户点击歌曲后：立即显示刚刚选择的歌曲名称，同时标记“播放中”
  // =========================================================================
  const playSongById = useCallback(
    async (songId: string) => {
      audioSynth.playClickBeep(920);
      const target =
        MOCK_SONGS.find((s) => s.id === songId.trim()) || {
          id: songId,
          name: `曲目_${songId}`,
          artist: '本地艺术家',
          album: '存储介质曲目',
          folder: selectedFolder,
          duration: 210,
          bpm: 96,
          noteFrequency: 440,
        };

      // 规则: 用户点击歌曲后：立即显示刚刚选择的歌曲名称，同时标记“播放中”
      setCurrentSong(target);
      setIsPlaying(true);
      setPlayerStatus('PLAYING');
      setStorageStatus('01');
      setCurrentTime(0);
      audioSynth.playTrack(target.noteFrequency, target.bpm);

      const cleanId = songId.padStart(3, '0');
      const txHex = `AA 55 41 02 ${cleanId.slice(0, 2)} ${cleanId.slice(2, 4)} ED`;
      addLog(
        'TX',
        'PLAY_BY_ID',
        txHex,
        { songId: cleanId, songName: target.name },
        `指令下发: 指定歌曲ID [${cleanId}] 播放歌曲 《${target.name}》`
      );

      await delay(hardware.latencyMs);

      const rxHex = `AA 55 C1 01 00 ED`;
      addLog(
        'RX',
        'RESP_PLAY_BY_ID',
        rxHex,
        { code: 0, id: target.id, name: target.name },
        `设备应答: 已开始播放曲目 ID=[${target.id}] 《${target.name}》`,
        '播放中'
      );
    },
    [addLog, hardware.latencyMs, selectedFolder]
  );

  // =========================================================================
  // 9. 指定歌曲名播放歌曲
  // 用户点击歌曲后：立即显示刚刚选择的歌曲名称，同时标记“播放中”
  // =========================================================================
  const playSongByName = useCallback(
    async (songName: string) => {
      audioSynth.playClickBeep(920);
      const query = songName.trim().toLowerCase();
      const target =
        MOCK_SONGS.find(
          (s) => s.name.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
        ) || {
          id: '099',
          name: songName.trim(),
          artist: '点播艺术家',
          album: '点播专辑',
          folder: selectedFolder,
          duration: 198,
          bpm: 100,
          noteFrequency: 523,
        };

      // 规则: 用户点击歌曲后：立即显示刚刚选择的歌曲名称，同时标记“播放中”
      setCurrentSong(target);
      setIsPlaying(true);
      setPlayerStatus('PLAYING');
      setStorageStatus('01');
      setCurrentTime(0);
      audioSynth.playTrack(target.noteFrequency, target.bpm);

      const txHex = `AA 55 42 10 [NAME_STR] ED`;
      addLog(
        'TX',
        'PLAY_BY_NAME',
        txHex,
        { searchKeyword: songName, matchedName: target.name },
        `指令下发: 指定歌曲名 [${songName}] 播放歌曲`
      );

      await delay(hardware.latencyMs);

      const rxHex = `AA 55 C2 01 00 ED`;
      addLog(
        'RX',
        'RESP_PLAY_BY_NAME',
        rxHex,
        { code: 0, matchedId: target.id, name: target.name },
        `设备应答: 找到曲目 ID=[${target.id}] 《${target.name}》并起播`,
        '播放中'
      );
    },
    [addLog, hardware.latencyMs, selectedFolder]
  );

  // =========================================================================
  // 10. 指定文件夹播放: 下拉选择文件夹; 选择播放通道 (1-4 可多选)
  // 规则: 文件夹播放：显示“文件夹播放中”，查到当前歌曲后再替换成歌曲名称
  // =========================================================================
  const playFolderWithChannels = useCallback(
    async (folderPath: string, targetChannels: AudioChannel[]) => {
      audioSynth.playClickBeep(900);
      if (folderTimerRef.current) {
        clearTimeout(folderTimerRef.current);
      }

      setSelectedFolder(folderPath);
      setSelectedChannels(targetChannels);

      // 1. 立即标记“文件夹播放中”，开始发声并更新通道
      setIsPlaying(true);
      setStorageStatus('01');
      setPlayerStatus('FOLDER_PLAYING');
      setCurrentTime(0);

      // 更新分区通道开关
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          power: targetChannels.includes(c.id),
        }))
      );

      let channelMask = 0;
      targetChannels.forEach((ch) => {
        channelMask |= 1 << (ch - 1);
      });
      const hexMask = channelMask.toString(16).padStart(2, '0').toUpperCase();

      const folderObj = MOCK_FOLDERS.find((f) => f.path === folderPath);
      const folderName = folderObj ? folderObj.name : folderPath;

      const txHex = `AA 55 43 08 ${hexMask} [FOLDER] ED`;
      addLog(
        'TX',
        'PLAY_FOLDER_CHANNELS',
        txHex,
        {
          folder: folderPath,
          folderName,
          channels: targetChannels,
          channelMask: `0x${hexMask}`,
        },
        `指令下发: 指定文件夹 [${folderName}]，指定通道 [${targetChannels.map((c) => `通道${c}`).join(', ')}] 播放`
      );

      await delay(hardware.latencyMs);

      const folderSongs = MOCK_SONGS.filter((s) => s.folder === folderPath);
      const songToPlay = folderSongs[0] || MOCK_SONGS[0];

      const rxHex = `AA 55 C3 02 00 ${hexMask} ED`;
      addLog(
        'RX',
        'RESP_PLAY_FOLDER',
        rxHex,
        {
          code: 0,
          folder: folderPath,
          activeChannels: targetChannels,
        },
        `设备应答: 已开始执行文件夹多通道播放 (显示: 文件夹播放中)`,
        '文件夹播放中'
      );

      // 2. 查到当前歌曲后再替换成歌曲名称 (模拟设备上报曲目耗时 1.2 秒)
      folderTimerRef.current = setTimeout(() => {
        setCurrentSong(songToPlay);
        setPlayerStatus('PLAYING');
        audioSynth.playTrack(songToPlay.noteFrequency, songToPlay.bpm);

        addLog(
          'RX',
          'RESP_CURRENT_SONG',
          `AA 55 C0 10 00 01 ED`,
          { id: songToPlay.id, name: songToPlay.name },
          `设备上报当前播放曲目: ID=[${songToPlay.id}] 《${songToPlay.name}》，标题已自动替换`,
          '已获取曲目'
        );
      }, 1200);
    },
    [addLog, hardware.latencyMs]
  );

  // 查询文件夹指令
  const queryFolder = useCallback(
    async (folderPath: string) => {
      audioSynth.playClickBeep(750);
      const target = MOCK_FOLDERS.find((f) => f.path === folderPath) || MOCK_FOLDERS[0];
      const txHex = `AA 55 21 00 ED`;
      addLog(
        'TX',
        'QUERY_FOLDER',
        txHex,
        { folder: folderPath, name: target.name },
        `指令下发: 查询目标文件夹 [${target.name}]`
      );
      await delay(hardware.latencyMs);
      const rxHex = `AA 55 A1 01 00 ED`;
      addLog(
        'RX',
        'RESP_QUERY_FOLDER',
        rxHex,
        { folder: target.name, path: target.path },
        `设备应答: 目标文件夹 [${target.name}] 已就绪`,
        '目录就绪'
      );
      return target;
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 3 大核心歌曲播放状态切换 (1.有歌曲信息 2.播放信息获取中 3.暂无播放歌曲)
  // =========================================================================

  // ① 切换为【有歌曲信息】
  const setSongStatusHasInfo = useCallback(() => {
    audioSynth.playClickBeep(920);
    const targetSong = currentSong || MOCK_SONGS[0];
    setCurrentSong(targetSong);
    setPlayerStatus('HAS_SONG');
    setIsPlaying(true);
    setStorageStatus('01');
    audioSynth.playTrack(targetSong.noteFrequency, targetSong.bpm);
    addLog(
      'SYS',
      'SET_STATUS_HAS_SONG',
      'AA 55 C0 10 ... ED',
      { status: 'HAS_SONG', songName: targetSong.name, artist: targetSong.artist },
      `状态切换: 【有歌曲信息】 《${targetSong.name}》`,
      '有歌曲信息'
    );
  }, [addLog, currentSong]);

  // ② 切换为【播放信息获取中】
  const setSongStatusFetching = useCallback(() => {
    audioSynth.playClickBeep(860);
    setPlayerStatus('FETCHING_INFO');
    addLog(
      'SYS',
      'SET_STATUS_FETCHING',
      'AA 55 40 00 ED',
      { status: 'FETCHING_INFO' },
      '状态切换: 【播放信息获取中】 正在获取硬件解码芯片曲目信息...',
      '信息获取中'
    );
  }, [addLog]);

  // ③ 切换为【暂无播放歌曲】
  const setSongStatusNoSong = useCallback(() => {
    audioSynth.pause();
    setIsPlaying(false);
    setCurrentSong(null);
    setCurrentTime(0);
    setPlayerStatus('NO_SONG');
    setStorageStatus('02');
    addLog(
      'SYS',
      'SET_STATUS_NO_SONG',
      '--',
      { status: 'NO_SONG' },
      '状态切换: 【暂无播放歌曲】 显示“暂无播放歌曲”“请选择歌曲开始播放”',
      '暂无播放歌曲'
    );
  }, [addLog]);

  // 下发播放后暂时查不到歌曲：显示“播放信息获取中”
  const simulateFetchingInfo = useCallback(() => {
    setSongStatusFetching();
  }, [setSongStatusFetching]);

  // 模拟查询失败：显示“播放信息暂不可用”，保留播放控制
  const simulateQueryFailed = useCallback(() => {
    audioSynth.playClickBeep(620);
    setPlayerStatus('QUERY_FAILED');
    addLog(
      'SYS',
      'SIMULATE_QUERY_FAIL',
      'AA 55 C0 01 FF ED',
      { error: 'QUERY_FAILED', controlRetained: true },
      '模拟状态: 查询失败，显示“播放信息暂不可用”，保留播放控制',
      '信息暂不可用'
    );
  }, [addLog]);

  // 重置回刚进入页面的初始状态: 显示“暂无播放歌曲”“请选择歌曲开始播放”
  const resetToInitialState = useCallback(() => {
    setSongStatusNoSong();
  }, [setSongStatusNoSong]);

  // =========================================================================
  // 11. 播放 & 暂停 (即使在 QUERY_FAILED 下，保留播放控制依然可点)
  // =========================================================================
  const play = useCallback(async () => {
    audioSynth.playClickBeep(880);
    const txHex = `AA 55 50 00 ED`;
    addLog('TX', 'CMD_PLAY', txHex, {}, '指令下发: 播放');

    await delay(hardware.latencyMs);

    setIsPlaying(true);
    setStorageStatus('01');

    // 如果还没有选择过歌曲，默认载入曲目或标记播放中
    if (!currentSong) {
      const defaultSong = MOCK_SONGS[0];
      setCurrentSong(defaultSong);
      setPlayerStatus('PLAYING');
      audioSynth.playTrack(defaultSong.noteFrequency, defaultSong.bpm);
    } else {
      if (playerStatus !== 'QUERY_FAILED' && playerStatus !== 'BLUETOOTH') {
        setPlayerStatus('PLAYING');
      }
      audioSynth.playTrack(currentSong.noteFrequency, currentSong.bpm);
    }

    const rxHex = `AA 55 D0 01 00 ED`;
    addLog(
      'RX',
      'RESP_PLAY',
      rxHex,
      { code: 0, status: 'PLAYING' },
      `设备应答: 开始播放`,
      '播放中'
    );
  }, [addLog, currentSong, hardware.latencyMs, playerStatus]);

  const pause = useCallback(async () => {
    audioSynth.playClickBeep(650);
    const txHex = `AA 55 51 00 ED`;
    addLog('TX', 'CMD_PAUSE', txHex, {}, '指令下发: 暂停');

    await delay(hardware.latencyMs);

    setIsPlaying(false);
    if (storageStatus !== '0') {
      setStorageStatus('02');
    }
    audioSynth.pause();

    if (playerStatus === 'PLAYING') {
      setPlayerStatus('PAUSED');
    }

    const rxHex = `AA 55 D1 01 00 ED`;
    addLog(
      'RX',
      'RESP_PAUSE',
      rxHex,
      { code: 0, status: 'PAUSED' },
      '设备应答: 已暂停',
      '已暂停'
    );
  }, [addLog, hardware.latencyMs, playerStatus, storageStatus]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // =========================================================================
  // 12. 设置音乐播放模式
  // 0: 单次播放, 1: 单曲循环, 2: 顺序播放(播放一轮), 3: 列表循环, 4: 随机播放
  // =========================================================================
  const setMusicPlayMode = useCallback(
    async (targetMode: PlayMode) => {
      audioSynth.playClickBeep(760);
      const modeNames = ['单次播放', '单曲循环', '顺序播放(播放一轮)', '列表循环', '随机播放'];
      const modeName = modeNames[targetMode] || '未知模式';

      const txHex = `AA 55 52 01 0${targetMode} ED`;
      addLog(
        'TX',
        'SET_PLAY_MODE',
        txHex,
        { mode: targetMode, modeName },
        `指令下发: 设置播放模式为 [${modeName}] (代码: ${targetMode})`
      );

      await delay(hardware.latencyMs);

      setPlayMode(targetMode);

      const rxHex = `AA 55 D2 01 00 ED`;
      addLog(
        'RX',
        'RESP_PLAY_MODE',
        rxHex,
        { code: 0, activeMode: targetMode, modeName },
        `设备应答: 播放模式已设置为 [${modeName}]`,
        modeName
      );
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 13. 切换歌曲 (上一首 / 下一首) - 保留播放控制支持
  // =========================================================================
  const prevTrack = useCallback(async () => {
    audioSynth.playClickBeep(820);
    const txHex = `AA 55 53 00 ED`;
    addLog('TX', 'PREV_TRACK', txHex, {}, '指令下发: 切换上一首');

    await delay(hardware.latencyMs);

    const activeId = currentSong ? currentSong.id : MOCK_SONGS[0].id;
    const currentIndex = MOCK_SONGS.findIndex((s) => s.id === activeId);
    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) nextIndex = MOCK_SONGS.length - 1;

    const nextSong = MOCK_SONGS[nextIndex];
    setCurrentSong(nextSong);
    setCurrentTime(0);
    setPlayerStatus('PLAYING');
    setIsPlaying(true);
    setStorageStatus('01');
    audioSynth.playTrack(nextSong.noteFrequency, nextSong.bpm);

    const rxHex = `AA 55 D3 02 ${nextSong.id.slice(0, 2)} ${nextSong.id.slice(2, 4)} ED`;
    addLog(
      'RX',
      'RESP_PREV_TRACK',
      rxHex,
      { songId: nextSong.id, songName: nextSong.name },
      `设备应答: 已切换上一首 ID=[${nextSong.id}] 《${nextSong.name}》`,
      `上一曲`
    );
  }, [addLog, currentSong, hardware.latencyMs]);

  const nextTrack = useCallback(async () => {
    audioSynth.playClickBeep(840);
    const txHex = `AA 55 54 00 ED`;
    addLog('TX', 'NEXT_TRACK', txHex, {}, '指令下发: 切换下一首');

    await delay(hardware.latencyMs);

    let nextSong: SongItem;
    const activeId = currentSong ? currentSong.id : MOCK_SONGS[0].id;
    if (playMode === 4) {
      const randomIndex = Math.floor(Math.random() * MOCK_SONGS.length);
      nextSong = MOCK_SONGS[randomIndex];
    } else {
      const currentIndex = MOCK_SONGS.findIndex((s) => s.id === activeId);
      const nextIndex = (currentIndex + 1) % MOCK_SONGS.length;
      nextSong = MOCK_SONGS[nextIndex];
    }

    setCurrentSong(nextSong);
    setCurrentTime(0);
    setPlayerStatus('PLAYING');
    setIsPlaying(true);
    setStorageStatus('01');
    audioSynth.playTrack(nextSong.noteFrequency, nextSong.bpm);

    const rxHex = `AA 55 D4 02 ${nextSong.id.slice(0, 2)} ${nextSong.id.slice(2, 4)} ED`;
    addLog(
      'RX',
      'RESP_NEXT_TRACK',
      rxHex,
      { songId: nextSong.id, songName: nextSong.name },
      `设备应答: 已切换下一首 ID=[${nextSong.id}] 《${nextSong.name}》`,
      `下一曲`
    );
  }, [addLog, currentSong, hardware.latencyMs, playMode]);

  // 静音
  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSynth.setMute(nextMuted);
  }, [isMuted]);

  // 通道开关
  const toggleChannel = useCallback((chId: AudioChannel) => {
    audioSynth.playClickBeep(720);
    setSelectedChannels((prev) => {
      const exists = prev.includes(chId);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== chId);
      } else {
        return [...prev, chId].sort();
      }
    });

    setChannels((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, power: !c.power } : c))
    );
  }, []);

  // 播放进度计时器
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const duration = currentSong ? currentSong.duration : 180;
        if (prev >= duration) {
          if (playMode === 1) {
            return 0;
          } else if (playMode === 0) {
            setIsPlaying(false);
            setStorageStatus('02');
            setPlayerStatus('PAUSED');
            audioSynth.pause();
            return 0;
          } else {
            nextTrack();
            return 0;
          }
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentSong, playMode, nextTrack]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    playerStatus,
    setPlayerStatus,
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
    setHardware,
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
    play,
    pause,
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
    queryFolder,
    refreshSongLibrary,
  };
}
