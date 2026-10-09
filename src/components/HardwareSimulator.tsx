import { Cpu, Usb, HardDrive, Bluetooth, Volume2, VolumeX, Gauge } from 'lucide-react';
import { HardwareState } from '../types/device';
import { audioSynth } from '../utils/audioSynth';
import { useState } from 'react';

interface HardwareSimulatorProps {
  hardware: HardwareState;
  onToggleUsb: () => void;
  onToggleTf: () => void;
  onToggleBluetooth: () => void;
}

export function HardwareSimulator({
  hardware,
  onToggleUsb,
  onToggleTf,
  onToggleBluetooth,
}: HardwareSimulatorProps) {
  const [isSynthMuted, setIsSynthMuted] = useState<boolean>(audioSynth.getMuted());

  const handleToggleSynthSound = () => {
    const next = !isSynthMuted;
    audioSynth.setMute(next);
    setIsSynthMuted(next);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-gray-800" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            家庭硬件工装仿真 (PM 物理测试台)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          固件: {hardware.firmwareVersion}
        </span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        可在此模拟拔掉U盘、弹出TF卡或断开手机蓝牙等物理插槽事件，方便测试产品在“未插卡”与“就绪”不同状态下的指令响应。
      </p>

      {/* 硬件开关切换网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* USB 状态切换 */}
        <button
          type="button"
          onClick={onToggleUsb}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
            hardware.usbInserted
              ? 'bg-gray-50 border-gray-300 text-gray-900 shadow-2xs'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Usb className="w-4 h-4 text-gray-700" />
            <div>
              <p className="text-xs font-bold">USB 插槽</p>
              <p className="text-[10px] text-gray-500">
                {hardware.usbInserted ? '已插 (就绪)' : '未插卡 (代码0)'}
              </p>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hardware.usbInserted ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </button>

        {/* TF 卡状态切换 */}
        <button
          type="button"
          onClick={onToggleTf}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
            hardware.tfCardInserted
              ? 'bg-gray-50 border-gray-300 text-gray-900 shadow-2xs'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-gray-700" />
            <div>
              <p className="text-xs font-bold">TF卡 插槽</p>
              <p className="text-[10px] text-gray-500">
                {hardware.tfCardInserted ? '已插 (就绪)' : '未插卡 (代码0)'}
              </p>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hardware.tfCardInserted ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </button>

        {/* 蓝牙配对模拟 */}
        <button
          type="button"
          onClick={onToggleBluetooth}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
            hardware.bluetoothPaired
              ? 'bg-gray-50 border-gray-300 text-gray-900 shadow-2xs'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bluetooth className="w-4 h-4 text-gray-700" />
            <div>
              <p className="text-xs font-bold">蓝牙配对</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[80px]">
                {hardware.bluetoothPaired ? '已连手机' : '未连接'}
              </p>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hardware.bluetoothPaired ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
        </button>

        {/* 发声引擎 */}
        <button
          type="button"
          onClick={handleToggleSynthSound}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
            !isSynthMuted
              ? 'bg-gray-50 border-gray-300 text-gray-900 shadow-2xs'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
          title="开启或静音网页仿真发声"
        >
          <div className="flex items-center gap-2.5">
            {!isSynthMuted ? (
              <Volume2 className="w-4 h-4 text-gray-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            <div>
              <p className="text-xs font-bold">仿真声音</p>
              <p className="text-[10px] text-gray-500">
                {!isSynthMuted ? '发声中' : '静音模式'}
              </p>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              !isSynthMuted ? 'bg-emerald-500' : 'bg-gray-400'
            }`}
          />
        </button>
      </div>

      {/* 底部物理参数 */}
      <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-gray-400" />
          <span>MCU 通信时延: ~{hardware.latencyMs}ms</span>
        </div>
        <span>主机 MAC: {hardware.deviceMac}</span>
      </div>
    </section>
  );
}
