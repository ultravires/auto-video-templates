import React from "react";
import {
  AbsoluteFill,
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

export const BrowserScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  // 镜头推进效果
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1]);

  const charsToShow = Math.floor(frame / CHAR_FRAMES);
  const typedText = URL_TEXT.slice(0, charsToShow);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
          transform: `scale(${entrance * zoom})`,
          border: "1px solid #e4e4e7",
        }}
      >
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
