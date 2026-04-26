import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DISCOURAGED_SPECIAL_CHARS = /[!"#$%&/()=]/g;

export function cleanVisibleText(value: string, trim = false) {
  const cleaned = value.replace(DISCOURAGED_SPECIAL_CHARS, "").replace(/[ \t]{2,}/g, " ");
  return trim ? cleaned.trim() : cleaned;
}
