"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useAutoFlyToSlot } from "./hooks/useAutoFlyToSlot";

type Props = {
  src: string;
  toId: string;
  visible: boolean;
  onDone?: () => void;
};

export default function BigCardOverlay({ src, toId, visible, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useAutoFlyToSlot({
    bigRef: ref,
    toId,
    autoDelayMs: 2000, // coincide con overlay hold
    onDone,
    options: { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", rotate: -2, reparentMode: "move" },
  });

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="reveal-fly-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        perspective: "1000px",
      }}
    >
      <Image
        src={src}
        alt="card"
        width={420}
        height={560}
        style={{ transform: "translateZ(0) scale(1.06) rotate(-2deg) rotateY(-6deg)", filter: "drop-shadow(0 20px 40px rgba(0,0,0,.35))", borderRadius: 12 }}
        unoptimized
      />
    </div>
  );
}


