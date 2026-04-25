import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DISCOURAGED_SPECIAL_CHARS = /[!"#$%&/()=]/g;

export function cleanVisibleText(value: string) {
  return value.replace(DISCOURAGED_SPECIAL_CHARS, "").replace(/\s{2,}/g, " ").trim();
}
