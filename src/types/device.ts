/**
 * 智能家居背景音乐设备通信与状态类型定义
 */

// 音频输入源: 1: USB, 2: TF卡, 3: 蓝牙
export type AudioSource = 1 | 2 | 3;

export const AUDIO_SOURCES = {
  1: { id: 1, name: 'USB', label: 'USB 移动存储', icon: 'Usb' },
  2: { id: 2, name: 'TF_CARD', label: 'TF卡 (Micro SD)', icon: 'SdCard' },
  3: { id: 3, name: 'BLUETOOTH', label: '蓝牙 (Bluetooth 5.3)', icon: 'Bluetooth' },
} as const;

// USB/TF卡状态: 0: 未插卡, 01: 正在播放, 02: 就绪未播放
export type StorageStatusCode = '0' | '01' | '02';

export const STORAGE_STATUS_MAP: Record<StorageStatusCode, { text: string; desc: string; color: string }> = {
  '0': { text: '未插卡', desc: '设备插槽未检测到介质', color: 'text-rose-500' },
  '01': { text: '正在播放', desc: '介质就绪且正在解码音频流', color: 'text-emerald-500' },
  '02': { text: '就绪未播放', desc: '介质识别完毕，待命中', color: 'text-amber-500' },
};

// 音乐播放模式: 0: 单次播放, 1: 单曲循环, 2: 顺序播放 (播放一轮), 3: 列表循环, 4: 随机播放
export type PlayMode = 0 | 1 | 2 | 3 | 4;

export const PLAY_MODES = [
  { id: 0, name: '单次播放', desc: '当前曲目播放完即停止', icon: 'PlayCircle' },
  { id: 1, name: '单曲循环', desc: '反复循环当前曲目', icon: 'Repeat1' },
  { id: 2, name: '顺序播放', desc: '顺序播放一轮后停止', icon: 'ListOrdered' },
  { id: 3, name: '列表循环', desc: '列表无休止循环播放', icon: 'Repeat' },
  { id: 4, name: '随机播放', desc: '随机穿插播放所有曲目', icon: 'Shuffle' },
] as const;

// 播放通道 (1-4 可多选)
export type AudioChannel = 1 | 2 | 3 | 4;

export interface ChannelInfo {
  id: AudioChannel;
  name: string;
  zone: string;
  power: boolean;
  gain: number; // 增益比例
}

// 歌曲信息
export interface SongItem {
  id: string; // 如 "001", "042"
  name: string;
  artist: string;
  album: string;
  folder: string;
  duration: number; // 秒数
  coverUrl?: string;
  bpm?: number;
  noteFrequency?: number; // 用于合成音频演示
}

// 文件夹信息
export interface FolderItem {
  path: string;
  name: string;
  description: string;
  count: number;
}

// 协议日志类型 (TX: 发送指令, RX: 接收上报, AUTO: 自动联动指令, ERR: 异常)
export type LogDirection = 'TX' | 'RX' | 'AUTO' | 'SYS';

export interface ProtocolLog {
  id: string;
  timestamp: string;
  direction: LogDirection;
  command: string;
  rawHex: string;
  payload: Record<string, unknown> | string;
  description: string;
  statusBadge?: string;
  isAutoTrigger?: boolean;
}

// 硬件仿真状态
export interface HardwareState {
  usbInserted: boolean;
  tfCardInserted: boolean;
  bluetoothPaired: boolean;
  bluetoothDeviceName: string;
  firmwareVersion: string;
  deviceMac: string;
  online: boolean;
  latencyMs: number;
}
