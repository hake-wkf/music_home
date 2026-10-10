import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { WifiOff } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface OfflineOverlayProps {
  onReconnect?: () => Promise<void> | void;
}

export function OfflineOverlay({ onReconnect: _onReconnect }: OfflineOverlayProps) {
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastCount, setToastCount] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const handleMaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 播放低频按键拦截反馈
    audioSynth.playClickBeep(320);

    // 触发设备离线提示 (点击提示设备离线)
    setToastVisible(true);
    setToastCount((c) => c + 1);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 1600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="absolute inset-x-0 bottom-0 top-[64px] z-40 bg-gray-900/40 backdrop-blur-[1.5px] cursor-not-allowed select-none flex items-center justify-center p-4 transition-all"
      onClick={handleMaskClick}
    >
      {/* 点击提示设备离线：无弹窗卡片，仅在点击遮罩层时浮现微信风格轻量 Toast */}
      {toastVisible && (
        <div
          key={toastCount}
          className="pointer-events-none px-4 py-2.5 bg-black/85 backdrop-blur-md text-white text-xs font-medium rounded-full shadow-2xl flex items-center gap-2 border border-white/10 animate-toast"
        >
          <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>设备已离线</span>
        </div>
      )}
    </div>
  );
}
