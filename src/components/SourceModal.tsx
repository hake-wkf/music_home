import { X, Usb, HardDrive, Bluetooth, RefreshCw, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { AudioSource, StorageStatusCode, STORAGE_STATUS_MAP } from '../types/device';

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: AudioSource;
  storageStatus: StorageStatusCode;
  totalFiles: number;
  onSelectSource: (src: AudioSource) => void;
  onQuerySource: () => void;
  onQueryStorageStatus: () => void;
  onGetTotalFiles: () => void;
}

export function SourceModal({
  isOpen,
  onClose,
  source,
  storageStatus,
  totalFiles,
  onSelectSource,
  onQuerySource,
  onQueryStorageStatus,
  onGetTotalFiles,
}: SourceModalProps) {
  if (!isOpen) return null;

  const sources = [
    {
      id: 1 as AudioSource,
      name: 'USB 移动存储',
      sub: 'U盘 / 移动硬盘无损音乐',
      icon: Usb,
      code: '模式 1',
    },
    {
      id: 2 as AudioSource,
      name: 'TF 存储卡',
      sub: '内置 MicroSD 本地曲库',
      icon: HardDrive,
      code: '模式 2',
    },
    {
      id: 3 as AudioSource,
      name: '蓝牙无线音乐',
      sub: '手机 / 平板流媒体无线串流',
      icon: Bluetooth,
      code: '模式 3',
    },
  ];

  const statusInfo = STORAGE_STATUS_MAP[storageStatus] || {
    text: '未知状态',
    desc: '',
    color: 'text-gray-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-semibold">
              <HardDrive className="w-4 h-4 text-gray-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                音乐输入源与介质
              </h2>
              <p className="text-[11px] text-gray-500">
                切换主机音源通道与介质状态诊断
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="关闭弹窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 弹窗主体 */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* 输入源切换 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                选择音频输入源
              </span>
              <button
                type="button"
                onClick={onQuerySource}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-lg border border-gray-200 transition-colors active:scale-95 cursor-pointer"
                title="发送指令: 查询音乐输入源"
              >
                <RefreshCw className="w-3 h-3 text-gray-500" />
                <span>查询输入源</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {sources.map((item) => {
                const Icon = item.icon;
                const isActive = source === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSource(item.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all active:scale-98 cursor-pointer ${
                      isActive
                        ? 'bg-gray-50 border-gray-900 text-gray-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                            {item.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isActive
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 存储卡状态与曲库总数查询 */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-800">
              存储卡状态与文件总数
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 状态查询 */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">USB/TF 状态</span>
                  <button
                    type="button"
                    onClick={onQueryStorageStatus}
                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                    title="发送指令: 查询 USB/TF卡状态"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 my-1">
                  {storageStatus === '0' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ({storageStatus})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onQueryStorageStatus}
                  className="mt-1 w-full py-1.5 text-[11px] font-bold text-gray-800 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-center cursor-pointer shadow-2xs"
                >
                  查询介质状态
                </button>
              </div>

              {/* 文件总数查询 */}
              <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">曲库文件数</span>
                  <button
                    type="button"
                    onClick={onGetTotalFiles}
                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                    title="发送指令: 获取文件总数"
                  >
                    <FileText className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-base font-bold text-gray-900 tabular-nums font-mono">
                    {totalFiles}
                  </span>
                  <span className="text-xs text-gray-500">首曲目</span>
                </div>

                <button
                  type="button"
                  onClick={onGetTotalFiles}
                  className="mt-1 w-full py-1.5 text-[11px] font-bold text-gray-800 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-center cursor-pointer shadow-2xs"
                >
                  获取文件总数
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-500 flex items-start gap-1.5 border border-gray-100">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span>
                状态定义：0: 未插卡 · 01: 正在播放 · 02: 就绪未播放。
              </span>
            </div>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/80 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
