import { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';

export function ProtocolSpecDoc() {
  const [copied, setCopied] = useState<boolean>(false);

  const markdownSpec = `# 智能家居背景音乐设备接入需求与协议规格书 (PRD)

## 1. 业务功能需求矩阵

| 功能点 | 指令名称 | 方向 | 参数定义 | 页面交互形式 |
| :--- | :--- | :--- | :--- | :--- |
| **设置音乐输入源** | \`SET_SOURCE\` | App ➔ 设备 | \`1\`: USB<br>\`2\`: TF卡<br>\`3\`: 蓝牙 | 弹窗中选择并切换 |
| **查询音乐输入源** | \`QUERY_SOURCE\` | App ➔ 设备 | 无 | 弹窗中点击查询，返回当前有效源 (\`1\`/\`2\`/\`3\`) |
| **设置音乐播放音量** | \`SET_VOLUME\` | App ➔ 设备 | \`0 ~ 100\` (百分比) | 调节硬件功放主增益 |
| **查询音乐播放音量** | \`QUERY_VOLUME\` | App ➔ 设备 | 无 | 设备上报当前主音量 |
| **查询 USB/TF卡状态** | \`QUERY_STORAGE_STATUS\` | App ➔ 设备 | 返回: \`0\`: 未插卡<br>\`01\`: 正在播放<br>\`02\`: 就绪未播放 | 弹窗中点击查询介质状态 |
| **获取文件总数** | \`GET_TOTAL_FILES\` | App ➔ 设备 | 无 | 弹窗中点击获取，返回总音频曲目数 |
| **获取播放歌曲ID及名称** | \`GET_CURRENT_SONG\` | App ➔ 设备 | 无 | 返回当前曲目 ID、歌名、艺术家、总时长 |
| **指定歌曲ID播放** | \`PLAY_BY_ID\` | App ➔ 设备 | \`song_id\` (如 "001") | 弹窗中输入或快捷点击 ID 播放 |
| **指定歌曲名播放** | \`PLAY_BY_NAME\` | App ➔ 设备 | \`song_name\` (字符串) | 弹窗中输入歌名模糊检索并播放 |
| **指定文件夹播放** | \`PLAY_FOLDER_CHANNELS\`| App ➔ 设备 | \`folder_path\`, 通道掩码(1-4多选) | 弹窗中下拉选文件夹并多选1~4通道播放 |
| **播放** | \`CMD_PLAY\` | App ➔ 设备 | 无 | 启动DAC解码与功放输出 |
| **暂停** | \`CMD_PAUSE\` | App ➔ 设备 | 无 | 暂停解码，状态切为 02 (就绪未播放) |
| **设置音乐播放模式** | \`SET_PLAY_MODE\` | App ➔ 设备 | \`0\`: 单次播放<br>\`1\`: 单曲循环<br>\`2\`: 顺序播放 (播放一轮)<br>\`3\`: 列表循环<br>\`4\`: 随机播放 | 切换内置播放器循环策略 |
| **切换上一首 / 下一首** | \`PREV_TRACK\` / \`NEXT_TRACK\` | App ➔ 设备 | 无 | 按照当前播放模式切歌 |
`;

  const handleCopySpec = () => {
    navigator.clipboard.writeText(markdownSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-800" />
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
            产品经理 PRD · 设备功能接入与通信指令表
          </h2>
        </div>
        <button
          type="button"
          onClick={handleCopySpec}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-300 transition-colors cursor-pointer shadow-2xs"
          title="复制 Markdown 格式 PRD 协议规范文档"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">已复制PRD</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              <span>复制规范文档</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-600">
        已将输入源管理、文件夹通道选择及指定歌曲点播整理为独立弹窗模态，指令独立清晰，无强制自动联动。
      </p>

      {/* 协议参数对照表 */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-800 border-b border-gray-200 font-bold">
              <th className="py-2.5 px-3">功能项</th>
              <th className="py-2.5 px-3">指令CMD</th>
              <th className="py-2.5 px-3">参数规范 / 返回码</th>
              <th className="py-2.5 px-3">页面交互形式</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">设置音乐输入源</td>
              <td className="py-2.5 px-3 text-gray-900 font-bold">SET_SOURCE</td>
              <td className="py-2.5 px-3 text-gray-700">1: USB, 2: TF卡, 3: 蓝牙</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">输入源管理弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">查询音乐输入源</td>
              <td className="py-2.5 px-3 text-gray-900">QUERY_SOURCE</td>
              <td className="py-2.5 px-3 text-gray-700">返回当前有效源 (1 / 2 / 3)</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">输入源管理弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">设置音乐播放音量</td>
              <td className="py-2.5 px-3 text-gray-900">SET_VOLUME</td>
              <td className="py-2.5 px-3 text-gray-700">0 - 100 (0x00 - 0x64)</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">主页面滑块</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">查询音乐播放音量</td>
              <td className="py-2.5 px-3 text-gray-900">QUERY_VOLUME</td>
              <td className="py-2.5 px-3 text-gray-700">返回当前音量值</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">主页面“查询音量”</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">查询 USB/TF卡状态</td>
              <td className="py-2.5 px-3 text-gray-900 font-bold">QUERY_STORAGE_STATUS</td>
              <td className="py-2.5 px-3 text-gray-700">
                0: 未插卡 | 01: 正在播放 | 02: 就绪未播放
              </td>
              <td className="py-2.5 px-3 font-sans text-gray-700">输入源管理弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">获取文件总数</td>
              <td className="py-2.5 px-3 text-gray-900 font-bold">GET_TOTAL_FILES</td>
              <td className="py-2.5 px-3 text-gray-700">返回音频文件总数 (uint16)</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">输入源管理弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">获取播放歌曲ID及名称</td>
              <td className="py-2.5 px-3 text-gray-900">GET_CURRENT_SONG</td>
              <td className="py-2.5 px-3 text-gray-700">返回歌曲 ID、名称、歌手</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">播放器卡片查询</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">指定歌曲ID播放</td>
              <td className="py-2.5 px-3 text-gray-900">PLAY_BY_ID</td>
              <td className="py-2.5 px-3 text-gray-700">歌曲ID: 如 001, 010</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">指定歌曲点播弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">指定歌曲名播放</td>
              <td className="py-2.5 px-3 text-gray-900">PLAY_BY_NAME</td>
              <td className="py-2.5 px-3 text-gray-700">歌曲名称字符串</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">指定歌曲点播弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">指定文件夹与通道</td>
              <td className="py-2.5 px-3 text-gray-900">PLAY_FOLDER_CHANNELS</td>
              <td className="py-2.5 px-3 text-gray-700">文件夹路径 + 1~4通道掩码</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">文件夹与通道弹窗</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">播放 / 暂停</td>
              <td className="py-2.5 px-3 text-gray-900">CMD_PLAY / CMD_PAUSE</td>
              <td className="py-2.5 px-3 text-gray-700">播放 ➔ 01, 暂停 ➔ 02</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">主卡片圆形主按键</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">设置播放模式</td>
              <td className="py-2.5 px-3 text-gray-900">SET_PLAY_MODE</td>
              <td className="py-2.5 px-3 text-gray-700">
                0:单次, 1:单曲, 2:顺序(一轮), 3:列表, 4:随机
              </td>
              <td className="py-2.5 px-3 font-sans text-gray-700">模式按键 / 下拉菜单</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-2.5 px-3 font-sans font-medium text-gray-900">切歌 (上一首/下一首)</td>
              <td className="py-2.5 px-3 text-gray-900">PREV_TRACK / NEXT_TRACK</td>
              <td className="py-2.5 px-3 text-gray-700">无额外参数</td>
              <td className="py-2.5 px-3 font-sans text-gray-700">切歌功能按键</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
