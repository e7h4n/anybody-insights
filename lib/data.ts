// <SUBJECT> knowledge graph — 0 opinions · 0 data points
// Replace the empty arrays below with your extracted data.
// See README.md for the full extraction + deployment workflow.

export type Opinion = {
  id: number;
  sp: string;  // speaker
  tp: string;  // topic
  st: string;  // stance (≤150 chars)
  cf: "h" | "m" | "l"; // confidence: h=assertive, m=hedged, l=speculative
  bk: string;  // bucket (one of TOPIC_COLORS keys)
  dt: string;  // source date YYYY-MM or YYYY-MM-DD
};

export type DataPoint = {
  dt: string;  // date
  ep: string;  // episode / source title
  cl: string;  // claim (≤120 chars)
  cx: string;  // context (≤80 chars)
  sp: string;  // speaker
};

export const OPINIONS: Opinion[] = [];

export const DATA_POINTS: DataPoint[] = [];

export const TOPIC_COLORS: Record<string, string> = {
  // Example buckets — rename / replace to fit your subject's domain.
  // Keep these stable across reloads; do not hash at runtime.
  // "AI Timelines & AGI":    "#ef4444",
  // "Scaling & Architecture":"#f59e0b",
  // "Alignment & Safety":    "#eab308",
  // "Economy & Labour":      "#22c55e",
  // "Biology & Longevity":   "#10b981",
  // "Science & Knowledge":   "#06b6d4",
  // "Robotics & Physical AI":"#3b82f6",
  // "Energy & Climate":      "#84cc16",
  // "AI Agents & Software":  "#f97316",
  // "Cognition & Intelligence":"#a78bfa",
  // "Other":                 "#6b7280",
};
