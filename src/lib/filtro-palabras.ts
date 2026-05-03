/** Simple profanity filter for Spanish content */
const BLOCKED: string[] = [
  "puta", "puto", "mierda", "hijueputa", "marica", "malparido", "gonorrea",
  "culo", "verga", "pendejo", "cabrón", "cabron", "coño", "cono", "joder",
  "maldito", "estupido", "estúpido", "imbecil", "imbécil", "idiota",
  "hp", "hdp", "ctm", "ptm", "mrd", "hpta", "mkda", "careculo",
  "perra", "zorra", "bastardo", "desgraciado", "mamón", "mamaguevo",
  "fuck", "shit", "bitch", "asshole", "dick", "damn", "crap",
  "ass", "bastard", "slut", "whore",
];

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const containsProfanity = (text: string): boolean => {
  const clean = normalize(text);
  return BLOCKED.some((w) => {
    const re = new RegExp(`\\b${w}\\b`, "i");
    return re.test(clean);
  });
};

export const filterProfanity = (text: string): string => {
  let result = text;
  const cleanText = normalize(text);
  for (const word of BLOCKED) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    const normalizedResult = normalize(result);
    let match;
    const tempRe = new RegExp(`\\b${word}\\b`, "gi");
    while ((match = tempRe.exec(normalizedResult)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      result = result.substring(0, start) + "*".repeat(end - start) + result.substring(end);
    }
  }
  return result;
};
