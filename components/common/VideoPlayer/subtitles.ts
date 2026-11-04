export interface SubtitleCue {
  id?: number | string;
  start: number;
  end: number;
  text: string;
}

export function parseTimestampToSeconds(ts: string): number | null {
  if (!ts) return null;
  const cleaned = ts.trim().replace(',', '.');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]);
    const m = parseFloat(parts[1]);
    const s = parseFloat(parts[2]);
    if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
      return h * 3600 + m * 60 + s;
    }
  } else if (parts.length === 2) {
    const m = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    if (!isNaN(m) && !isNaN(s)) {
      return m * 60 + s;
    }
  } else if (parts.length === 1) {
    const s = parseFloat(parts[0]);
    if (!isNaN(s)) return s;
  }
  return null;
}

interface RawParsedCue {
  start: number;
  end: number | null;
  hasExplicitEnd: boolean;
  lines: string[];
}

const TIME_TOKEN = '(?:\\d{1,2}:)?\\d{1,2}:\\d{2}(?:[.,]\\d{1,3})?';
const bracketRegex = new RegExp(
  `^\\[\\s*(${TIME_TOKEN})(?:\\s*(?:-|-->|to)\\s*(${TIME_TOKEN}))?\\s*\\]\\s*(.*)$`
);
const parenRegex = new RegExp(
  `^\\(\\s*(${TIME_TOKEN})(?:\\s*(?:-|-->|to)\\s*(${TIME_TOKEN}))?\\s*\\)\\s*(.*)$`
);
const arrowRegex = new RegExp(
  `^(${TIME_TOKEN})\\s*-->\\s*(${TIME_TOKEN})(?:\\s+.*)?$`
);
const standaloneTimeRegex = new RegExp(
  `^(${TIME_TOKEN})(?:\\s*(?:-|-->|to)\\s*(${TIME_TOKEN}))?(?:\\s*[-:]\\s*|\\s+)(.+)$`
);

export function parseSubtitles(
  rawText: string | null | undefined,
  videoDuration = 0
): SubtitleCue[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const rawCues: RawParsedCue[] = [];
  let currentCue: RawParsedCue | null = null;
  const fallbackLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let isTimestampLine = false;
    let start: number | null = null;
    let end: number | null = null;
    let trailingText = '';

    let m = line.match(bracketRegex);
    if (m) {
      isTimestampLine = true;
      start = parseTimestampToSeconds(m[1]);
      end = m[2] ? parseTimestampToSeconds(m[2]) : null;
      trailingText = m[3] ? m[3].trim() : '';
    } else {
      m = line.match(parenRegex);
      if (m) {
        isTimestampLine = true;
        start = parseTimestampToSeconds(m[1]);
        end = m[2] ? parseTimestampToSeconds(m[2]) : null;
        trailingText = m[3] ? m[3].trim() : '';
      } else {
        m = line.match(arrowRegex);
        if (m) {
          isTimestampLine = true;
          start = parseTimestampToSeconds(m[1]);
          end = parseTimestampToSeconds(m[2]);
          trailingText = '';
        } else {
          m = line.match(standaloneTimeRegex);
          if (
            m &&
            (line.startsWith('0') ||
              line.startsWith('1') ||
              line.startsWith('2'))
          ) {
            isTimestampLine = true;
            start = parseTimestampToSeconds(m[1]);
            end = m[2] ? parseTimestampToSeconds(m[2]) : null;
            trailingText = m[3] ? m[3].trim() : '';
          }
        }
      }
    }

    if (isTimestampLine && start !== null) {
      if (currentCue && currentCue.lines.length > 0) {
        rawCues.push(currentCue);
      }
      currentCue = {
        start,
        end,
        hasExplicitEnd: end !== null,
        lines: trailingText ? [trailingText] : [],
      };
      continue;
    }

    if (line === 'WEBVTT' || line.startsWith('NOTE') || /^\d+$/.test(line)) {
      continue;
    }

    if (currentCue) {
      currentCue.lines.push(line);
    } else {
      fallbackLines.push(line);
    }
  }

  if (currentCue && currentCue.lines.length > 0) {
    rawCues.push(currentCue);
  }

  if (rawCues.length > 0) {
    const cues = rawCues
      .map((c) => ({
        start: c.start,
        end: c.end !== null ? c.end : 0,
        hasExplicitEnd: c.hasExplicitEnd,
        text: c.lines.filter(Boolean).join('\n').trim(),
      }))
      .filter((c) => c.text.length > 0)
      .sort((a, b) => a.start - b.start);

    for (let i = 0; i < cues.length; i++) {
      const current = cues[i];
      const next = cues[i + 1];

      if (!current.hasExplicitEnd || current.end <= current.start) {
        if (next && next.start > current.start) {
          const gap = next.start - current.start;
          current.end = gap > 7 ? current.start + 5 : next.start;
        } else {
          let remaining = 4;
          if (videoDuration > current.start) {
            remaining = videoDuration - current.start;
          }
          current.end = current.start + Math.max(3, Math.min(6, remaining));
        }
      } else if (
        next &&
        next.start > current.start &&
        current.end > next.start
      ) {
        current.end = next.start;
      }
    }

    return cues.map((c) => ({
      start: c.start,
      end: c.end,
      text: c.text,
    }));
  }

  if (fallbackLines.length === 0) return [];
  const fullText = fallbackLines.join(' ').trim();
  const sentences = fullText
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return [];

  const effectiveDuration =
    videoDuration > 0 ? videoDuration : sentences.length * 4;
  const cueDuration = Math.max(2, effectiveDuration / sentences.length);

  return sentences.map((sentence, idx) => ({
    start: idx * cueDuration,
    end: Math.min(effectiveDuration, (idx + 1) * cueDuration),
    text: sentence,
  }));
}

export function getActiveCueText(
  cues: SubtitleCue[],
  currentTime: number
): string | null {
  if (!cues || cues.length === 0) return null;
  for (let i = cues.length - 1; i >= 0; i--) {
    const cue = cues[i];
    if (currentTime >= cue.start && currentTime < cue.end) {
      return cue.text;
    }
  }
  return null;
}
