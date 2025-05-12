// Function to detect if the device can handle 3D rendering
export function canRender3D() {
  if (typeof window === "undefined") return false;

  // Check if this is a mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Check if device has enough memory (rough estimate)
  const hasEnoughMemory =
    !isMobile ||
    (navigator.deviceMemory !== undefined && navigator.deviceMemory >= 4);

  // Check if browser supports WebGL
  let supportsWebGL = false;
  try {
    const canvas = document.createElement("canvas");
    supportsWebGL = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    supportsWebGL = false;
  }

  return supportsWebGL && hasEnoughMemory;
}
