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
} from '../types/device';
import { MOCK_FOLDERS, MOCK_SONGS } from '../mock/songs';
import { audioSynth } from '../utils/audioSynth';

export function useDeviceController() {
  // 当前输入源: 1: USB, 2: TF卡, 3: 蓝牙
  const [source, setSource] = useState<AudioSource>(2); // 默认TF卡
  // 存储卡状态: '0': 未插卡, '01': 正在播放, '02': 就绪未播放
  const [storageStatus, setStorageStatus] = useState<StorageStatusCode>('02');
  // 文件总数
  const [totalFiles, setTotalFiles] = useState<number>(MOCK_SONGS.length);
  // 当前音量 (0-100)
  const [volume, setVolume] = useState<number>(45);
  // 是否静音
  const [isMuted, setIsMuted] = useState<boolean>(false);
  // 播放状态
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // 当前播放歌曲
  const [currentSong, setCurrentSong] = useState<SongItem>(MOCK_SONGS[0]);
  // 当前播放进度 (秒)
  const [currentTime, setCurrentTime] = useState<number>(38);
  // 播放模式: 0: 单次, 1: 单曲循环, 2: 顺序播放, 3: 列表循环, 4: 随机播放
  const [playMode, setPlayMode] = useState<PlayMode>(3); // 默认列表循环
  // 选中的文件夹
  const [selectedFolder, setSelectedFolder] = useState<string>(MOCK_FOLDERS[0].path);
  // 选中的通道 (1-4 可多选)
  const [selectedChannels, setSelectedChannels] = useState<AudioChannel[]>([1, 2]);

  // 通道状态配置
  const [channels, setChannels] = useState<ChannelInfo[]>([
    { id: 1, name: '客厅主分区', zone: 'Zone 1', power: true, gain: 1.0 },
    { id: 2, name: '主卧温馨区', zone: 'Zone 2', power: true, gain: 0.8 },
    { id: 3, name: '静心书房', zone: 'Zone 3', power: false, gain: 0.7 },
    { id: 4, name: '休闲阳台', zone: 'Zone 4', power: false, gain: 0.9 },
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
  // 独立指令，不强制自动触发其他指令
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
    },
    [addLog, hardware.latencyMs]
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
  // 5. 查询 USB/TF卡状态
  // 0: 未插卡, 01: 正在播放, 02: 就绪未播放
  // 独立指令，不强制自动触发
  // =========================================================================
  const queryStorageStatus = useCallback(async () => {
    audioSynth.playClickBeep(820);
    const currentSrc = source;
    const txHex = `AA 55 30 01 0${currentSrc} ED`;
    addLog(
      'TX',
      'QUERY_STORAGE_STATUS',
      txHex,
      { targetMedium: currentSrc === 1 ? 'USB' : currentSrc === 2 ? 'TF' : 'BT' },
      `指令下发: 查询 ${currentSrc === 1 ? 'USB' : currentSrc === 2 ? 'TF卡' : '蓝牙'} 存储状态`
    );

    await delay(hardware.latencyMs);

    let statusCode: StorageStatusCode = '02';
    if (currentSrc === 1) {
      statusCode = hardware.usbInserted ? (isPlaying ? '01' : '02') : '0';
    } else if (currentSrc === 2) {
      statusCode = hardware.tfCardInserted ? (isPlaying ? '01' : '02') : '0';
    } else {
      statusCode = isPlaying ? '01' : '02';
    }

    setStorageStatus(statusCode);

    const statusMap = {
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

  // =========================================================================
  // 7. 获取播放歌曲的id以及名称
  // =========================================================================
  const getCurrentSongInfo = useCallback(async () => {
    audioSynth.playClickBeep(780);
    const txHex = `AA 55 40 00 ED`;
    addLog('TX', 'GET_CURRENT_SONG', txHex, {}, '指令下发: 获取当前播放歌曲的ID以及名称');

    await delay(hardware.latencyMs);

    const songIdHex = currentSong.id.padStart(4, '0');
    const rxHex = `AA 55 C0 10 ${songIdHex.slice(0, 2)} ${songIdHex.slice(2, 4)} ... ED`;
    addLog(
      'RX',
      'RESP_CURRENT_SONG',
      rxHex,
      {
        id: currentSong.id,
        name: currentSong.name,
        artist: currentSong.artist,
        folder: currentSong.folder,
        duration: currentSong.duration,
      },
      `设备上报: 当前曲目 ID=[${currentSong.id}] 《${currentSong.name}》`,
      `ID:${currentSong.id}`
    );
  }, [addLog, currentSong, hardware.latencyMs]);

  // =========================================================================
  // 8. 指定歌曲id播放歌曲
  // =========================================================================
  const playSongById = useCallback(
    async (songId: string) => {
      audioSynth.playClickBeep(920);
      const target = MOCK_SONGS.find((s) => s.id === songId.trim());
      const cleanId = songId.padStart(3, '0');

      const txHex = `AA 55 41 02 ${cleanId.slice(0, 2)} ${cleanId.slice(2, 4)} ED`;
      addLog(
        'TX',
        'PLAY_BY_ID',
        txHex,
        { songId: cleanId },
        `指令下发: 指定歌曲ID [${cleanId}] 播放歌曲`
      );

      await delay(hardware.latencyMs);

      if (target) {
        setCurrentSong(target);
        setIsPlaying(true);
        setCurrentTime(0);
        setStorageStatus('01');
        audioSynth.playTrack(target.noteFrequency, target.bpm);

        const rxHex = `AA 55 C1 01 00 ED`;
        addLog(
          'RX',
          'RESP_PLAY_BY_ID',
          rxHex,
          { code: 0, id: target.id, name: target.name },
          `设备应答: 已开始播放曲目 ID=[${target.id}] 《${target.name}》`,
          '解码播放中'
        );
      } else {
        const rxHex = `AA 55 C1 01 FF ED`;
        addLog(
          'RX',
          'RESP_PLAY_BY_ID_ERR',
          rxHex,
          { code: 0xff, error: 'ID_NOT_FOUND', songId: cleanId },
          `设备报错: 歌曲ID [${cleanId}] 不存在`,
          '未找到曲目'
        );
      }
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 9. 指定歌曲名播放歌曲
  // =========================================================================
  const playSongByName = useCallback(
    async (songName: string) => {
      audioSynth.playClickBeep(920);
      const query = songName.trim().toLowerCase();
      const target = MOCK_SONGS.find(
        (s) => s.name.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
      );

      const txHex = `AA 55 42 10 [NAME_STR] ED`;
      addLog(
        'TX',
        'PLAY_BY_NAME',
        txHex,
        { searchKeyword: songName },
        `指令下发: 指定歌曲名 [${songName}] 播放歌曲`
      );

      await delay(hardware.latencyMs);

      if (target) {
        setCurrentSong(target);
        setIsPlaying(true);
        setCurrentTime(0);
        setStorageStatus('01');
        audioSynth.playTrack(target.noteFrequency, target.bpm);

        const rxHex = `AA 55 C2 01 00 ED`;
        addLog(
          'RX',
          'RESP_PLAY_BY_NAME',
          rxHex,
          { code: 0, matchedId: target.id, name: target.name },
          `设备应答: 找到曲目 ID=[${target.id}] 《${target.name}》并起播`,
          '播放成功'
        );
      } else {
        const rxHex = `AA 55 C2 01 FF ED`;
        addLog(
          'RX',
          'RESP_PLAY_BY_NAME_ERR',
          rxHex,
          { code: 0xff, error: 'NAME_NOT_FOUND', searchKeyword: songName },
          `设备报错: 未能搜索到匹配歌曲 [${songName}]`,
          '未找到曲目'
        );
      }
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 10. 指定文件夹播放: 下拉选择文件夹; 选择播放通道 (1-4 可多选)
  // =========================================================================
  const playFolderWithChannels = useCallback(
    async (folderPath: string, targetChannels: AudioChannel[]) => {
      audioSynth.playClickBeep(900);
      setSelectedFolder(folderPath);
      setSelectedChannels(targetChannels);

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

      // 更新分区通道开关
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          power: targetChannels.includes(c.id),
        }))
      );

      const folderSongs = MOCK_SONGS.filter((s) => s.folder === folderPath);
      const songToPlay = folderSongs[0] || MOCK_SONGS[0];

      setCurrentSong(songToPlay);
      setIsPlaying(true);
      setCurrentTime(0);
      setStorageStatus('01');
      audioSynth.playTrack(songToPlay.noteFrequency, songToPlay.bpm);

      const rxHex = `AA 55 C3 02 00 ${hexMask} ED`;
      addLog(
        'RX',
        'RESP_PLAY_FOLDER',
        rxHex,
        {
          code: 0,
          folder: folderPath,
          song: songToPlay.name,
          activeChannels: targetChannels,
        },
        `设备应答: 已切换至文件夹播放，开启通道 [${targetChannels.join(',')}], 开始播放《${songToPlay.name}》`,
        '分区播放中'
      );
    },
    [addLog, hardware.latencyMs]
  );

  // =========================================================================
  // 11. 播放 & 暂停
  // =========================================================================
  const play = useCallback(async () => {
    audioSynth.playClickBeep(880);
    const txHex = `AA 55 50 00 ED`;
    addLog('TX', 'CMD_PLAY', txHex, {}, '指令下发: 播放');

    await delay(hardware.latencyMs);

    setIsPlaying(true);
    setStorageStatus('01');
    audioSynth.playTrack(currentSong.noteFrequency, currentSong.bpm);

    const rxHex = `AA 55 D0 01 00 ED`;
    addLog(
      'RX',
      'RESP_PLAY',
      rxHex,
      { code: 0, status: 'PLAYING', songId: currentSong.id },
      `设备应答: 开始播放`,
      '播放中'
    );
  }, [addLog, currentSong, hardware.latencyMs]);

  const pause = useCallback(async () => {
    audioSynth.playClickBeep(650);
    const txHex = `AA 55 51 00 ED`;
    addLog('TX', 'CMD_PAUSE', txHex, {}, '指令下发: 暂停');

    await delay(hardware.latencyMs);

    setIsPlaying(false);
    setStorageStatus('02');
    audioSynth.pause();

    const rxHex = `AA 55 D1 01 00 ED`;
    addLog(
      'RX',
      'RESP_PAUSE',
      rxHex,
      { code: 0, status: 'PAUSED' },
      '设备应答: 已暂停',
      '已暂停'
    );
  }, [addLog, hardware.latencyMs]);

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
  // 13. 切换歌曲 (上一首 / 下一首)
  // =========================================================================
  const prevTrack = useCallback(async () => {
    audioSynth.playClickBeep(820);
    const txHex = `AA 55 53 00 ED`;
    addLog('TX', 'PREV_TRACK', txHex, {}, '指令下发: 切换上一首');

    await delay(hardware.latencyMs);

    const currentIndex = MOCK_SONGS.findIndex((s) => s.id === currentSong.id);
    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) nextIndex = MOCK_SONGS.length - 1;

    const nextSong = MOCK_SONGS[nextIndex];
    setCurrentSong(nextSong);
    setCurrentTime(0);
    if (isPlaying) {
      audioSynth.playTrack(nextSong.noteFrequency, nextSong.bpm);
    }

    const rxHex = `AA 55 D3 02 ${nextSong.id.slice(0, 2)} ${nextSong.id.slice(2, 4)} ED`;
    addLog(
      'RX',
      'RESP_PREV_TRACK',
      rxHex,
      { songId: nextSong.id, songName: nextSong.name },
      `设备应答: 已切换上一首 ID=[${nextSong.id}] 《${nextSong.name}》`,
      `上一曲`
    );
  }, [addLog, currentSong.id, hardware.latencyMs, isPlaying]);

  const nextTrack = useCallback(async () => {
    audioSynth.playClickBeep(840);
    const txHex = `AA 55 54 00 ED`;
    addLog('TX', 'NEXT_TRACK', txHex, {}, '指令下发: 切换下一首');

    await delay(hardware.latencyMs);

    let nextSong: SongItem;
    if (playMode === 4) {
      const randomIndex = Math.floor(Math.random() * MOCK_SONGS.length);
      nextSong = MOCK_SONGS[randomIndex];
    } else {
      const currentIndex = MOCK_SONGS.findIndex((s) => s.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % MOCK_SONGS.length;
      nextSong = MOCK_SONGS[nextIndex];
    }

    setCurrentSong(nextSong);
    setCurrentTime(0);
    if (isPlaying) {
      audioSynth.playTrack(nextSong.noteFrequency, nextSong.bpm);
    }

    const rxHex = `AA 55 D4 02 ${nextSong.id.slice(0, 2)} ${nextSong.id.slice(2, 4)} ED`;
    addLog(
      'RX',
      'RESP_NEXT_TRACK',
      rxHex,
      { songId: nextSong.id, songName: nextSong.name },
      `设备应答: 已切换下一首 ID=[${nextSong.id}] 《${nextSong.name}》`,
      `下一曲`
    );
  }, [addLog, currentSong.id, hardware.latencyMs, isPlaying, playMode]);

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

  // 播放进度
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= currentSong.duration) {
          if (playMode === 1) {
            return 0;
          } else if (playMode === 0) {
            setIsPlaying(false);
            setStorageStatus('02');
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
  }, [isPlaying, currentSong.duration, playMode, nextTrack]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleUsbInserted = useCallback(() => {
    setHardware((prev) => {
      const next = !prev.usbInserted;
      addLog('SYS', 'HARDWARE_EVENT', '00 00', { usbInserted: next }, `[仿真硬件] USB设备 ${next ? '插入' : '拔出'}`);
      return { ...prev, usbInserted: next };
    });
  }, [addLog]);

  const toggleTfCardInserted = useCallback(() => {
    setHardware((prev) => {
      const next = !prev.tfCardInserted;
      addLog('SYS', 'HARDWARE_EVENT', '00 00', { tfCardInserted: next }, `[仿真硬件] TF存储卡 ${next ? '插入' : '弹出'}`);
      return { ...prev, tfCardInserted: next };
    });
  }, [addLog]);

  const toggleBluetoothPaired = useCallback(() => {
    setHardware((prev) => {
      const next = !prev.bluetoothPaired;
      addLog('SYS', 'HARDWARE_EVENT', '00 00', { bluetoothPaired: next }, `[仿真硬件] 蓝牙手机 ${next ? '已连接' : '已断开'}`);
      return { ...prev, bluetoothPaired: next };
    });
  }, [addLog]);

  return {
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
    play,
    pause,
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
  };
}
