// Function to detect if the device can handle 3D rendering
export function canRender3D() {
  if (typeof window === "undefined") return false;

  // Check if this is a mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // We're being more conservative with mobile devices to prevent errors
  if (isMobile) return false;

  // Check if device has enough memory (rough estimate)
  let hasEnoughMemory = true;
  if (navigator.deviceMemory !== undefined) {
    hasEnoughMemory = navigator.deviceMemory >= 2;
  }

  // Check if browser supports WebGL
  let supportsWebGL = false;
  try {
    const canvas = document.createElement("canvas");
    // We're checking for both WebGL1 and WebGL2 support
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      canvas.getContext("webgl2");

    supportsWebGL = !!gl;

    // If we have a GL context, we can also check for limits
    if (gl) {
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      // If texture size is too small, device might struggle with 3D
      if (maxTextureSize < 2048) {
        return false;
      }
    }
  } catch (e) {
    console.warn("Error detecting WebGL support:", e);
    supportsWebGL = false;
  }

  return supportsWebGL && hasEnoughMemory;
}
