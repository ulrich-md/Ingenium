/**
 * Exam diagrams described as data, so question generators can draw them with the
 * question's own numbers (a ramp at the given angle, a circuit with its resistors, a graph
 * of the given motion). Rendered by components/FigView.tsx in black on white, like a
 * printed IB paper.
 *
 * Coordinates are in the figure's own units: a viewBox of `w` × `h` (y grows downward).
 * Keep figures around 300–420 wide; text is about 13 units tall. Use Unicode for
 * subscripts and superscripts in labels (m s⁻¹, F₁, 10³).
 */
export type Arrow = "end" | "start" | "both";

export type FigItem =
  /** straight line; `arrow` adds arrowheads (forces, velocities, field lines) */
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; w?: number; dash?: boolean; arrow?: Arrow; gray?: boolean }
  /** polyline or polygon through x,y pairs */
  | { t: "poly"; pts: number[]; close?: boolean; fill?: "none" | "light" | "dark"; w?: number; dash?: boolean; arrow?: Arrow }
  /** any SVG path (arcs, curves): `d` in figure units */
  | { t: "path"; d: string; fill?: "none" | "light" | "dark"; w?: number; dash?: boolean; arrow?: Arrow }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill?: "none" | "light" | "dark"; r?: number; sw?: number; dash?: boolean }
  | { t: "circle"; cx: number; cy: number; r: number; fill?: "none" | "light" | "dark"; sw?: number; dash?: boolean }
  /** a label; `size` default 13; anchor default "middle" */
  | { t: "text"; x: number; y: number; s: string; size?: number; anchor?: "start" | "middle" | "end"; italic?: boolean; bold?: boolean }
  /** angle mark: arc of radius r at (x, y) from angle a1 to a2 (degrees, 0 = right, counter-clockwise), with a label */
  | { t: "angle"; x: number; y: number; r: number; a1: number; a2: number; label?: string }
  /** hatched surface (ground, wall, ceiling) along a segment; hatching on the side given by `side` (+1/−1) */
  | { t: "ground"; x1: number; y1: number; x2: number; y2: number; side?: 1 | -1 }
  /** a spring (zig-zag) between two points */
  | { t: "spring"; x1: number; y1: number; x2: number; y2: number; coils?: number; width?: number }
  /** a circuit component centred on the segment (x1,y1)–(x2,y2), with wire for the rest of it */
  | { t: "comp"; kind: CompKind; x1: number; y1: number; x2: number; y2: number; label?: string }
  /** a junction dot on a wire */
  | { t: "dot"; x: number; y: number; r?: number }
  /** a graph: axes from (x, y) = top-left of the plot area, size w × h, in data ranges xr, yr */
  | {
      t: "graph"; x: number; y: number; w: number; h: number;
      xr: [number, number]; yr: [number, number];
      xlabel: string; ylabel: string;
      xticks?: number[]; yticks?: number[]; grid?: boolean;
      series: { pts: [number, number][]; dash?: boolean; dots?: boolean; smooth?: boolean; label?: string }[];
    };

export type CompKind = "resistor" | "variable" | "cell" | "battery" | "lamp" | "switch" | "ammeter" | "voltmeter" | "diode" | "ldr" | "thermistor";

export interface Fig {
  w: number;
  h: number;
  /** what the figure shows, in words (screen readers and the AI marker) */
  alt: string;
  items: FigItem[];
}
