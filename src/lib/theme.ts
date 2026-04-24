export type ThemeMode = "light" | "dark";

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};