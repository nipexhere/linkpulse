import { headers } from "next/headers";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export const formatDate = (value: Date | string) => dateFormat.format(new Date(value));
export const formatDay = (value: string) => dayFormat.format(new Date(`${value}T00:00:00Z`));
export const formatCount = (value: number) => value.toLocaleString("en-GB");

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// "NG" -> "Nigeria"; leaves "Unknown" and unrecognised codes as they are.
export function formatCountry(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function timeAgo(value: Date | string | null, now = Date.now()): string {
  if (!value) return "Never";
  const seconds = Math.max(0, Math.round((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "Just now";
}

// The public origin of this deployment, used to display short links.
export async function getOrigin(): Promise<string> {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
