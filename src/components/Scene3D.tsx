import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { SATELLITES, type Satellite } from "../lib/mockData";
import { useStore } from "../store/useStore";
import { useTopRisk } from "../hooks/useRiskData";
import type { RiskSummary } from "../api/riskApi";
import { riskTier } from "./risk/RiskVisuals";
import SatelliteDrawer from "./risk/SatelliteDrawer";

const TIER_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

// ---------------------------------------------------------------------------
// Procedural Earth — stylized blue/green gradient via a custom shader.
// No external textures (competition rules: no external services).
// ---------------------------------------------------------------------------
function EarthMaterial() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorOcean: { value: new THREE.Color("#0a3d62") },
        uColorLand: { value: new THREE.Color("#1a6b3a") },
        uColorAtmo: { value: new THREE.Color("#3b82f6") },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        uniform vec3 uColorOcean;
        uniform vec3 uColorLand;
        uniform vec3 uColorAtmo;

        // cheap hash-based noise for landmass splotches
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        void main() {
          vec3 p = normalize(vPos) * 3.0;
          float n = noise(p) * 0.6 + noise(p * 2.0) * 0.3 + noise(p * 4.0) * 0.1;
          float land = smoothstep(0.45, 0.55, n);
          vec3 base = mix(uColorOcean, uColorLand, land);

          // fresnel atmosphere rim
          float fres = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
          vec3 color = mix(base, uColorAtmo, fres * 0.7);

          // subtle day/night via a fake light dir
          float light = max(dot(vNormal, normalize(vec3(0.6, 0.3, 0.8))), 0.0);
          color *= 0.35 + light * 0.85;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  return material;
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = EarthMaterial();

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[2, 48, 48]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Atmosphere glow shell — slightly larger transparent sphere with fresnel.
// ---------------------------------------------------------------------------
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        uniforms: { uColor: { value: new THREE.Color("#3b82f6") } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(uColor, 1.0) * intensity;
          }
        `,
      }),
    []
  );

  return (
    <mesh material={material} scale={1.15}>
      <sphereGeometry args={[2, 32, 32]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Satellite — low-poly box body + two thin plane solar panels.
// Orbits at a radius derived from its altitude, with its own inclination.
// ---------------------------------------------------------------------------
interface SatProps {
  satellite: Satellite;
  orbitRadius: number;
  speed: number;
  inclination: number;
  phase: number;
  selected: boolean;
  onSelect: () => void;
  risk?: RiskSummary;
  positionRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
}

function SatelliteModel({
  satellite,
  orbitRadius,
  speed,
  inclination,
  phase,
  selected,
  onSelect,
  risk,
  positionRef,
}: SatProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const tier = risk ? riskTier(risk.risk_probability) : null;
  const isHighRisk = tier === "high";
  const scale = risk ? 0.85 + risk.risk_probability * 0.9 : 1;
  const markerColor = tier ? TIER_COLOR[tier] : satellite.color;

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (groupRef.current) {
      // orbit in the XZ plane, then tilt by inclination
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      const y = Math.sin(t) * orbitRadius * Math.sin(inclination);
      groupRef.current.position.set(x, y, z);
      positionRef.current[satellite.id] = groupRef.current.position.clone();
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.02;
    }
    if (ringRef.current && isHighRisk) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      ringRef.current.scale.setScalar(pulse);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
    }
  });

  const color = new THREE.Color(markerColor);

  return (
    <group ref={groupRef} scale={scale}>
      <mesh
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[0.18, 0.14, 0.22]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.9 : isHighRisk ? 0.7 : 0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* solar panels */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.2} side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.2} side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* high-risk pulsing warning ring */}
      {isHighRisk && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.4, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.34, 32]} />
          <meshBasicMaterial color={markerColor} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* hover tooltip */}
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.35, 0]} center>
          <div className="pointer-events-none whitespace-nowrap rounded-lg border border-space-border bg-space-panel/95 backdrop-blur-md px-3 py-2 text-[11px] font-mono text-slate-200 shadow-lg">
            <div className="font-semibold text-white">{satellite.name}</div>
            {risk && (
              <>
                <div className="text-slate-400">NORAD {risk.norad_id}</div>
                <div className="text-slate-400">
                  {(risk.risk_probability * 100).toFixed(1)}% ·{" "}
                  <span style={{ color: markerColor }}>{tier?.toUpperCase()}</span>
                </div>
                {risk.altitude_km && (
                  <div className="text-slate-400">{risk.altitude_km.toFixed(0)} km</div>
                )}
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Orbit ring line for visual clarity.
// ---------------------------------------------------------------------------
function OrbitRing({
  radius,
  inclination,
  color,
  glow,
}: {
  radius: number;
  inclination: number;
  color: string;
  glow?: boolean;
}) {
  const line = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const y = Math.sin(a) * radius * Math.sin(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: glow ? 0.45 : 0.15,
    });
    return new THREE.Line(geometry, material);
  }, [radius, inclination, color, glow]);

  return <primitive object={line} />;
}

// ---------------------------------------------------------------------------
// Camera rig — smoothly zooms toward the selected satellite's live position,
// and eases back to the default framing when deselected.
// ---------------------------------------------------------------------------
function CameraRig({
  selectedId,
  positionRef,
  isTouch,
}: {
  selectedId: string | null;
  positionRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  isTouch: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const defaultCamPos = useMemo(() => new THREE.Vector3(0, 1.5, 6), []);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (selectedId && positionRef.current[selectedId]) {
      const satPos = positionRef.current[selectedId];
      controls.target.lerp(satPos, 0.06);
      const desiredCamPos = satPos.clone().normalize().multiplyScalar(satPos.length() + 1.6);
      camera.position.lerp(desiredCamPos, 0.04);
    } else {
      controls.target.lerp(defaultTarget, 0.05);
      camera.position.lerp(defaultCamPos, 0.03);
    }
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef as any}
      enablePan={false}
      enableZoom={!isTouch}
      enableRotate={!isTouch}
      minDistance={3.2}
      maxDistance={12}
      autoRotate={isTouch && !selectedId}
      autoRotateSpeed={0.4}
    />
  );
}

// ---------------------------------------------------------------------------
// Scene contents
// ---------------------------------------------------------------------------
function SceneContents({
  onOpenDrawer,
}: {
  onOpenDrawer: (noradId: number) => void;
}) {
  const { selectedSatelliteId, setSelectedSatelliteId } = useStore();
  const [isTouch, setIsTouch] = useState(false);
  const positionRef = useRef<Record<string, THREE.Vector3>>({});

  // Live top-risk predictions, mapped onto the existing mock satellite roster
  // by rank order (the demo fleet and the tracked catalog use different IDs).
  const { data: topRisk } = useTopRisk(SATELLITES.length);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const riskBySatId = useMemo(() => {
    const map: Record<string, RiskSummary> = {};
    if (!topRisk) return map;
    SATELLITES.forEach((s, i) => {
      if (topRisk[i]) map[s.id] = topRisk[i];
    });
    return map;
  }, [topRisk]);

  // Map satellite altitudes to orbit radii in scene units (Earth radius = 2).
  // GEO is huge in reality; compress for visibility.
  const satConfigs = useMemo(
    () =>
      SATELLITES.map((s) => {
        const alt = s.altitudeKm;
        // LEO ~2.4, MEO ~3.2, GEO ~4.2 (compressed, not to scale)
        const radius = alt < 1000 ? 2.6 : alt < 20000 ? 3.4 : 4.4;
        const speed = alt < 1000 ? 0.35 : alt < 20000 ? 0.12 : 0.05;
        const inclination = (s.inclinationDeg * Math.PI) / 180;
        const phase = SATELLITES.indexOf(s) * 2.1;
        return { satellite: s, radius, speed, inclination, phase };
      }),
    []
  );

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 3, 5]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-5, -2, -3]} intensity={0.4} color="#3b82f6" />

      <Earth />
      <Atmosphere />

      {satConfigs.map(({ satellite, radius, speed, inclination, phase }) => {
        const risk = riskBySatId[satellite.id];
        const tier = risk ? riskTier(risk.risk_probability) : null;
        return (
          <group key={satellite.id}>
            <OrbitRing
              radius={radius}
              inclination={inclination}
              color={tier ? TIER_COLOR[tier] : satellite.color}
              glow={tier === "high"}
            />
            <SatelliteModel
              satellite={satellite}
              orbitRadius={radius}
              speed={speed}
              inclination={inclination}
              phase={phase}
              selected={selectedSatelliteId === satellite.id}
              risk={risk}
              positionRef={positionRef}
              onSelect={() => {
                const next = selectedSatelliteId === satellite.id ? null : satellite.id;
                setSelectedSatelliteId(next);
                if (next && risk) onOpenDrawer(risk.norad_id);
              }}
            />
          </group>
        );
      })}

      {/* star dust */}
      <Stars />

      <CameraRig selectedId={selectedSatelliteId} positionRef={positionRef} isTouch={isTouch} />
    </>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const r = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Exported canvas wrapper
// ---------------------------------------------------------------------------
export default function Scene3D() {
  const [drawerNoradId, setDrawerNoradId] = useState<number | null>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.5, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => useStore.getState().setSelectedSatelliteId(null)}
      >
        <Suspense fallback={null}>
          <SceneContents onOpenDrawer={setDrawerNoradId} />
        </Suspense>
      </Canvas>
      <SatelliteDrawer noradId={drawerNoradId} onClose={() => setDrawerNoradId(null)} />
    </div>
  );
}
