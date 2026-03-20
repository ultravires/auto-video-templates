import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLOR_BG = "#f4f4f5";
const COLOR_BROWSER_BG = "#ffffff";
const COLOR_TEXT = "#3f3f46";
const URL_TEXT = "https://nodejs.org/";
const CHAR_FRAMES = 3;
const CURSOR_BLINK_FRAMES = 20;

const Cursor: React.FC<{
  frame: number;
  blinkFrames: number;
}> = ({ frame, blinkFrames }) => {
  const opacity = Math.floor((frame / (blinkFrames / 2)) % 2) === 0 ? 1 : 0;

  return (
    <span
      style={{
        display: "inline-block",
        width: "2px",
        height: "20px",
        backgroundColor: "#3b82f6",
        marginLeft: "2px",
        verticalAlign: "middle",
        opacity,
      }}
    />
  );
};

const MousePointer: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      transform: `translate(${x}px, ${y}px)`,
      opacity,
      zIndex: 100,
      pointerEvents: "none",
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill="white"
        stroke="black"
        strokeWidth="1"
      />
    </svg>
  </div>
);

export const BrowserScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // 1. 光标路径动画
  const mouseX = interpolate(frame, [0, 25, 120], [800, 300, 350], {
    easing: Easing.out(Easing.exp),
  });
  const mouseY = interpolate(frame, [0, 25, 120], [500, 48, 48], {
    easing: Easing.out(Easing.exp),
  });
  const mouseOpacity = interpolate(frame, [0, 10, durationInFrames - 10, durationInFrames], [0, 1, 1, 0]);

  // 2. 镜头跟随动画 - 更快且由快到慢
  const zoom = interpolate(frame, [0, 30, durationInFrames], [1, 1.4, 1.5], {
    easing: Easing.out(Easing.exp),
  });

  const charsToShow = Math.floor(Math.max(0, frame - 25) / CHAR_FRAMES);
  const typedText = URL_TEXT.slice(0, charsToShow);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 1000,
          height: 600,
          backgroundColor: COLOR_BROWSER_BG,
          borderRadius: 12,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // 关键修改：设置缩放中心为左上角，位置固定，仅拉近
          transform: `scale(${entrance * zoom})`,
          transformOrigin: "0 0",
          border: "1px solid #e4e4e7",
          position: "relative",
        }}
      >
        <MousePointer x={mouseX} y={mouseY} opacity={mouseOpacity} />
        {/* Browser Header */}
        <div
          style={{
            height: 60,
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid #e4e4e7",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
          </div>
          
          {/* Address Bar */}
          <div
            style={{
              flex: 1,
              height: 36,
              backgroundColor: "#f1f5f9",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              padding: "0 15px",
              fontSize: 16,
              color: COLOR_TEXT,
              fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
              border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ marginRight: 8, opacity: 0.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <span style={{ color: "#0f172a" }}>{typedText}</span>
            <Cursor frame={frame} blinkFrames={CURSOR_BLINK_FRAMES} />
          </div>

          <div style={{ width: 30, opacity: 0.3 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>
        </div>

        {/* Browser Content Placeholder */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            padding: 40,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ height: 40, width: "60%", backgroundColor: "#f1f5f9", borderRadius: 4 }} />
          <div style={{ height: 200, width: "100%", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #e2e8f0" }} />
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ height: 100, flex: 1, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
            <div style={{ height: 100, flex: 1, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
            <div style={{ height: 100, flex: 1, backgroundColor: "#f1f5f9", borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
