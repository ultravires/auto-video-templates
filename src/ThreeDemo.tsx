import React, { useEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const OPENCLAW_MODEL_FILE = "open-claw/source/Armature.glb";
const OPENCLAW_TEXTURE_DIR = "open-claw/textures/";
const STAR_COUNT = 90;

const Starfield: React.FC<{
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

const OpenclawLogoModel: React.FC<{
  scale: number;
  yOffset: number;
  model: Object3D | null;
}> = ({ scale, yOffset, model }) => {
  if (!model) return null;

  return (
    <group
      position={[0, yOffset, 0]}
      scale={scale}
    >
      <primitive object={model} />
    </group>
  );
};

export const ThreeDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const [model, setModel] = useState<Object3D | null>(null);
  const [loading, setLoading] = useState(true);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      setWebglAvailable(false);
      return;
    }

    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2", { antialias: false }) ??
      canvas.getContext("webgl", { antialias: false });
    setWebglAvailable(Boolean(context));
  }, []);

  useEffect(() => {
    if (webglAvailable === false) {
      setLoading(false);
      return;
    }

    if (webglAvailable === null) {
      return;
    }

    const loader = new GLTFLoader();
    const modelPath = staticFile(OPENCLAW_MODEL_FILE);
    const texturePath = staticFile(OPENCLAW_TEXTURE_DIR);

    loader.setResourcePath(texturePath);

    loader.load(
      modelPath,
      (gltf) => {
        const obj = gltf.scene;
        obj.scale.set(1, 1, 1);
        setModel(obj);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("模型加载失败", err);
        setLoading(false);
      }
    );
  }, [webglAvailable]);

  // 动画逻辑
  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 120 },
  });

  const bob = Math.sin((frame / fps) * Math.PI * 1.5) * 0.25;
  const sceneScale = interpolate(entrance, [0, 1], [0.6, 1]);

  const cameraZ = interpolate(frame, [0, 90, 180], [8, 5.2, 7], {
    easing: Easing.inOut(Easing.cubic),
  });

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
  const textColorA = interpolateColors(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    ["#ff6b7d", "#ff9a5a", "#ff6b7d"],
  );
  const textColorB = interpolateColors(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    ["#ffd9df", "#ffe6b8", "#ffd9df"],
  );
  const gradientShift = (frame * 1.2) % 200;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle at 20% 10%, rgba(255, 47, 87, 0.22), transparent 45%), radial-gradient(circle at 80% 18%, rgba(195, 16, 61, 0.16), transparent 38%), linear-gradient(180deg, ${bgTop} 0%, ${bgBottom} 100%)`,
      }}
    >
      <Starfield frame={frame} fps={fps} />

      {webglAvailable ? (
        <ThreeCanvas
          width={width}
          height={height}
          camera={{ position: [0, 0, cameraZ], fov: 42 }}
        >
          <ambientLight intensity={0.22} color="#3a1116" />
          <directionalLight position={[0, 1.2, 6]} intensity={1.25} color="#ffe2e7" />
          <pointLight position={[-3.5, -2.8, 2.2]} intensity={0.35} color="#7f1d1d" />

          {!loading && <OpenclawLogoModel
            model={model}
            scale={sceneScale}
            yOffset={bob + 0.2}
          />}
        </ThreeCanvas>
      ) : null}

      {/* 文字 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 86,
            letterSpacing: 4,
            lineHeight: 1,
            backgroundImage: `linear-gradient(90deg, ${textColorA} 0%, ${textColorB} 50%, ${textColorA} 100%)`,
            backgroundSize: "200% 100%",
            backgroundPositionX: `${gradientShift}%`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: "translateY(150px)",
            textShadow: "0 0 26px rgba(255, 102, 128, 0.25)",
          }}
        >
          OpenClaw
        </div>
        <div
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 86,
            letterSpacing: 4,
            lineHeight: 1,
            backgroundImage: `linear-gradient(90deg, ${textColorB} 0%, ${textColorA} 50%, ${textColorB} 100%)`,
            backgroundSize: "200% 100%",
            backgroundPositionX: `${gradientShift}%`,
            WebkitBackgroundClip: "text",
            color: "transparent",
            transform: "translateY(180px)",
            textShadow: "0 0 26px rgba(255, 102, 128, 0.25)",
          }}
        >
          如何养殖小龙虾？
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ThreeDemo;