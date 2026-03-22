import React, { useEffect, useState } from "react";
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
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { TerminalScene } from "./TerminalScene";
import { BrowserScene } from "./BrowserScene";

import { MainBackground } from "./Background";

const OPENCLAW_MODEL_FILE = "open-claw/source/Armature.glb";
const OPENCLAW_TEXTURE_DIR = "open-claw/textures/";

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

const IntroScene: React.FC = () => {
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

  const textEntrance1 = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const textEntrance2 = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const bob = Math.sin((frame / fps) * Math.PI * 1.5) * 0.25;
  const sceneScale = interpolate(entrance, [0, 1], [0.6, 1]);

  const cameraZ = interpolate(frame, [0, 90, 180], [8, 5.2, 7], {
    easing: Easing.inOut(Easing.cubic),
  });

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
    <AbsoluteFill>
      <MainBackground />

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
            opacity: textEntrance1,
            transform: `translateY(${interpolate(textEntrance1, [0, 1], [190, 150])}px)`,
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
            opacity: textEntrance2,
            transform: `translateY(${interpolate(textEntrance2, [0, 1], [220, 180])}px)`,
            textShadow: "0 0 26px rgba(255, 102, 128, 0.25)",
          }}
        >
          如何养殖小龙虾？
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ThreeDemo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={180}>
        <IntroScene />
      </TransitionSeries.Sequence>
      
      <TransitionSeries.Transition
        presentation={slide()}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      
      <TransitionSeries.Sequence durationInFrames={150}>
        <BrowserScene />
      </TransitionSeries.Sequence>
      
      <TransitionSeries.Transition
        presentation={slide()}
        timing={linearTiming({ durationInFrames: 30 })}
      />
      
      <TransitionSeries.Sequence durationInFrames={150}>
        <TerminalScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

export default ThreeDemo;