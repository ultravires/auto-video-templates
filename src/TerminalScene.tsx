import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLOR_BG = "#ffffff";
const COLOR_TERMINAL_BG = "#ffffff";
const COLOR_TEXT = "#000000";
const FULL_TEXT = "pnpm add openclaw@latest";
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
        width: "12px",
        height: "24px",
        backgroundColor: COLOR_TEXT,
        marginLeft: "2px",
        verticalAlign: "middle",
        opacity,
      }}
    />
  );
};

export const TerminalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 12,
    },
  });

  // 镜头推进效果 (Camera Zoom-in)
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  const charsToShow = Math.floor(frame / CHAR_FRAMES);
  const typedText = FULL_TEXT.slice(0, charsToShow);

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
          width: 900,
          height: 500,
          backgroundColor: COLOR_TERMINAL_BG,
          borderRadius: 12,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transform: `scale(${entrance * zoom})`,
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Mac Terminal Header */}
        <div
          style={{
            height: 40,
            backgroundColor: "#f6f6f6",
            display: "flex",
            alignItems: "center",
            padding: "0 15px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 14,
              color: "#666",
              fontFamily: "sans-serif",
            }}
          >
            zsh — 80×24
          </div>
        </div>

        {/* Terminal Content */}
        <div
          style={{
            flex: 1,
            padding: 25,
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            fontSize: 24,
            lineHeight: 1.5,
            color: COLOR_TEXT,
          }}
        >
          <span style={{ color: "#27c93f", marginRight: 10 }}>➜</span>
          <span style={{ color: "#27c93f", fontWeight: "bold", marginRight: 10 }}>~</span>
          <span>{typedText}</span>
          <Cursor frame={frame} blinkFrames={CURSOR_BLINK_FRAMES} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
