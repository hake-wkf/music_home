import { useState } from 'react';
import { X, Terminal, Cpu, BookOpen } from 'lucide-react';
import { ProtocolLog, HardwareState } from '../types/device';
import { ProtocolMonitor } from './ProtocolMonitor';
import { HardwareSimulator } from './HardwareSimulator';
import { ProtocolSpecDoc } from './ProtocolSpecDoc';

interface DebugSheetProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ProtocolLog[];
  hardware: HardwareState;
  onClearLogs: () => void;
  onToggleUsb: () => void;
  onToggleTf: () => void;
  onToggleBluetooth: () => void;
}

export function DebugSheet({
  isOpen,
  onClose,
  logs,
  hardware,
  onClearLogs,
  onToggleUsb,
  onToggleTf,
  onToggleBluetooth,
}: DebugSheetProps) {
  const [activeTab, setActiveTab] = useState<'monitor' | 'hardware' | 'spec'>('monitor');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部导航与关闭 */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('monitor')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'monitor'
                  ? 'bg-white text-gray-900 font-bold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>指令日志 ({logs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hardware')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hardware'
                  ? 'bg-white text-gray-900 font-bold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>硬件仿真</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'spec'
                  ? 'bg-white text-gray-900 font-bold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PRD规格</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="关闭调试面板"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 主体切换区域 */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
          {activeTab === 'monitor' && (
            <div className="h-full min-h-[460px]">
              <ProtocolMonitor logs={logs} onClearLogs={onClearLogs} />
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <HardwareSimulator
                hardware={hardware}
                onToggleUsb={onToggleUsb}
                onToggleTf={onToggleTf}
                onToggleBluetooth={onToggleBluetooth}
              />
              <div className="h-[360px]">
                <ProtocolMonitor logs={logs} onClearLogs={onClearLogs} />
              </div>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-4">
              <ProtocolSpecDoc />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
