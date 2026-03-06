const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const hashString = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const IMPORTANCE_COLORS = {
  low: "hsl(142 60% 45%)",
  medium: "hsl(45 90% 50%)",
  high: "hsl(0 72% 52%)",
};

export const generateAccentColor = (text) => {
  const hash = hashString(text || "card");
  const hue = hash % 360;
  const saturation = 64;
  const lightness = clamp(54 + (hash % 18) - 9, 45, 62);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

export const generateRandomAccentColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 62 + Math.floor(Math.random() * 16);
  const lightness = 48 + Math.floor(Math.random() * 12);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};
