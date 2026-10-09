import { useState } from 'react';
import { Terminal, Copy, Trash2, ArrowUpRight, ArrowDownLeft, Check, Filter } from 'lucide-react';
import { ProtocolLog } from '../types/device';

interface ProtocolMonitorProps {
  logs: ProtocolLog[];
  onClearLogs: () => void;
}

export function ProtocolMonitor({ logs, onClearLogs }: ProtocolMonitorProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'TX' | 'RX'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'ALL' && log.direction !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.command.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.rawHex.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyAll = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.direction}] ${l.command} | HEX: ${l.rawHex} | ${l.description} | Payload: ${JSON.stringify(
            l.payload
          )}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl flex flex-col h-full overflow-hidden shadow-xs">
      {/* 监视器头部控制条 */}
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-800" />
          <h2 className="text-xs font-bold text-gray-900">
            设备通信指令监视器 (IoT Command Stream)
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-white text-gray-600 rounded-md border border-gray-200">
            {logs.length} 条记录
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 复制全部 */}
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-2xs"
            title="复制通信协议日志"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>复制日志</span>
              </>
            )}
          </button>

          {/* 清空日志 */}
          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="清空监视器日志"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 过滤控制栏 */}
      <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
        {/* 过滤按键 */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-white text-gray-900 font-bold shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            全部 ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('TX')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
              filterType === 'TX'
                ? 'bg-gray-900 text-white font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            TX 发送
          </button>
          <button
            type="button"
            onClick={() => setFilterType('RX')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
              filterType === 'RX'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowDownLeft className="w-3 h-3" />
            RX 上报
          </button>
        </div>

        {/* 关键字搜索 */}
        <div className="relative w-40">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索指令/十六进制"
            className="w-full bg-gray-50 text-gray-900 text-[11px] rounded-xl px-2.5 py-1.5 border border-gray-200 focus:outline-hidden focus:bg-white focus:border-gray-900 font-mono shadow-2xs"
          />
        </div>
      </div>

      {/* 日志流列表 */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs font-mono select-text custom-scrollbar bg-gray-50/40">
        {filteredLogs.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Filter className="w-7 h-7 text-gray-300" />
            <p className="text-xs">暂无指令交互记录</p>
            <p className="text-[11px] text-gray-400">操作任意功能即可实时记录通信数据</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isTx = log.direction === 'TX';
            const isRx = log.direction === 'RX';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isTx
                    ? 'bg-white border-gray-200 shadow-2xs'
                    : isRx
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* 顶栏: 标签 / 命令名 / 时间戳 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isTx
                          ? 'bg-gray-100 text-gray-900 border border-gray-300'
                          : isRx
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isTx && <ArrowUpRight className="w-2.5 h-2.5" />}
                      {isRx && <ArrowDownLeft className="w-2.5 h-2.5" />}
                      {log.direction}
                    </span>

                    <span className="font-bold text-gray-900 text-xs">
                      {log.command}
                    </span>

                    {log.statusBadge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-emerald-700 rounded border border-gray-200 font-medium">
                        {log.statusBadge}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono">
                    {log.timestamp}
                  </span>
                </div>

                {/* 业务描述 */}
                <p className="text-xs text-gray-700 font-sans my-1 font-medium">
                  {log.description}
                </p>

                {/* 十六进制帧与负载 */}
                <div className="bg-gray-50 rounded-xl p-2 mt-1.5 border border-gray-200 text-[11px] space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400 text-[10px] font-sans">RAW HEX:</span>
                    <span className="text-gray-900 font-mono tracking-wider font-bold">
                      {log.rawHex}
                    </span>
                  </div>

                  {typeof log.payload === 'object' && Object.keys(log.payload).length > 0 && (
                    <div className="flex items-start gap-2 text-gray-600 border-t border-gray-200 pt-1">
                      <span className="text-gray-400 text-[10px] font-sans shrink-0">DATA:</span>
                      <pre className="text-[11px] text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">
                        {JSON.stringify(log.payload)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
