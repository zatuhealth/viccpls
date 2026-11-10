import { describe, expect, it } from "vitest";
import { bmi, bmiLabel } from "@/lib/data";
describe("bmi", () => {
  it("computes kg/m² from kg and cm", () => expect(bmi("70", "175")).toBe(22.9));
  it("returns null when missing", () => expect(bmi("", "170")).toBeNull());
  it("labels categories", () => { expect(bmiLabel(17)).toBe("Underweight"); expect(bmiLabel(27)).toBe("Overweight"); });
});
