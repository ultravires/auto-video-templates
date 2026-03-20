import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLOR_BG = "#ffffff";
const COLOR_TERMINAL_BG = "#ffffff";
const COLOR_TEXT = "#000000";
const FULL_TEXT = "npm add openclaw@latest";
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

  // 1. 光标路径动画
  const mouseX = interpolate(frame, [0, 25, 120], [700, 100, 150], {
    easing: Easing.out(Easing.exp),
  });
  const mouseY = interpolate(frame, [0, 25, 120], [400, 80, 80], {
    easing: Easing.out(Easing.exp),
  });
  const mouseOpacity = interpolate(frame, [0, 10, durationInFrames - 10, durationInFrames], [0, 1, 1, 0]);

  // 2. 镜头跟随动画 - 更快且由快到慢
  const zoom = interpolate(frame, [0, 30, durationInFrames], [1, 1.4, 1.5], {
    easing: Easing.out(Easing.exp),
  });

  const charsToShow = Math.floor(Math.max(0, frame - 25) / CHAR_FRAMES);
  const typedText = FULL_TEXT.slice(0, charsToShow);

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
          width: 900,
          height: 500,
          backgroundColor: COLOR_TERMINAL_BG,
          borderRadius: 12,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          // 关键修改：设置缩放中心为左上角，位置固定，仅拉近
          transform: `scale(${entrance * zoom})`,
          transformOrigin: "0 0",
          border: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        <MousePointer x={mouseX} y={mouseY} opacity={mouseOpacity} />
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
