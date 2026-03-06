import { describe, expect, it } from "vitest";
import { generateAccentColor } from "../src/utils/color.js";

describe("generateAccentColor", () => {
  it("returns a valid hsl string", () => {
    const color = generateAccentColor("Kanban");
    expect(color.startsWith("hsl(")).toBe(true);
  });

  it("is stable for the same input", () => {
    const colorA = generateAccentColor("Karte");
    const colorB = generateAccentColor("Karte");
    expect(colorA).toBe(colorB);
  });
});

