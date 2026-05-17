import { useEffect, useRef, useCallback } from "react";

const SHAKE_THRESHOLD = 15;
const SHAKE_TIMEOUT = 1000; // ms between shake events

export const useShakeDetection = (onShake) => {
  const lastShake = useRef(0);
  const lastAcc = useRef({ x: 0, y: 0, z: 0 });

  const handleMotion = useCallback(
    (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const deltaX = Math.abs(acc.x - lastAcc.current.x);
      const deltaY = Math.abs(acc.y - lastAcc.current.y);
      const deltaZ = Math.abs(acc.z - lastAcc.current.z);

      lastAcc.current = { x: acc.x, y: acc.y, z: acc.z };

      const total = deltaX + deltaY + deltaZ;
      const now = Date.now();

      if (total > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_TIMEOUT) {
        lastShake.current = now;
        onShake?.();
      }
    },
    [onShake]
  );

  useEffect(() => {
    if (!window.DeviceMotionEvent) return;
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [handleMotion]);
};