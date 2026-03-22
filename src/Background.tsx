import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const STAR_COUNT = 90;

export const Starfield: React.FC<{
  frame: number;
  fps: number;
}> = ({ frame, fps }) => {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const seed = i + 1;
      const x = ((Math.sin(seed * 91.137) + 1) / 2) * 100;
      const y = ((Math.sin(seed * 47.923) + 1) / 2) * 100;
      const size = 1 + (((Math.sin(seed * 13.37) + 1) / 2) * 2.2);
      const phase = ((Math.sin(seed * 7.77) + 1) / 2) * Math.PI * 2;

      return { x, y, size, phase };
    });
  }, []);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {stars.map((star, index) => {
        const twinkle = 0.3 + Math.abs(Math.sin((frame / fps) * 1.5 + star.phase)) * 0.7;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: "#ffe4e6",
              opacity: twinkle,
              boxShadow: "0 0 8px rgba(255, 163, 163, 0.9)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const MainBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 颜色渐变
  const bgTop = interpolateColors(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    ["#140404", "#24070a", "#120203"],
  );
  const bgBottom = interpolateColors(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    ["#020202", "#0a0506", "#000000"],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle at 20% 10%, rgba(255, 47, 87, 0.22), transparent 45%), radial-gradient(circle at 80% 18%, rgba(195, 16, 61, 0.16), transparent 38%), linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)`,
      }}
    >
      <Starfield frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
