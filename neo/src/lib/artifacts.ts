export interface Artifact {
  language: string;
  code: string;
  title: string;
}

const FENCE = /```(\w+)?\n([\s\S]*?)```/g;

export function extractArtifacts(markdown: string): Artifact[] {
  const found: Artifact[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(FENCE.source, 'g');
  while ((match = re.exec(markdown))) {
    const language = (match[1] || 'txt').toLowerCase();
    const code = match[2].trim();
    if (code.length < 40) continue;
    found.push({
      language,
      code,
      title: language === 'html' ? 'Canvas HTML' : `snippet.${language}`,
    });
  }
  return found;
}

export function htmlFromArtifacts(artifacts: Artifact[]) {
  const html = artifacts.find((item) => item.language === 'html');
  if (html) return html.code;
  const css = artifacts.find((item) => item.language === 'css')?.code ?? '';
  const js = artifacts.find((item) => item.language === 'js' || item.language === 'javascript')?.code ?? '';
  if (!css && !js) return null;
  return `<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div><script>${js}<\/script></body></html>`;
}
