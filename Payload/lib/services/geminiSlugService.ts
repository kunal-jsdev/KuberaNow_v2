import { cleanSlugString } from '@/Payload/lib/utilities/slugify';

export interface GenerateSlugOptions {
  title: string;
  model?: string;
}

export function sanitizeAiSlug(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let cleaned = raw.trim();

  cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```$/i, '');
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '').trim();

  const slugified = cleanSlugString(cleaned);
  let finalSlug = slugified
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (finalSlug.length > 100) {
    const trimmed = finalSlug.slice(0, 100);
    const lastHyphen = trimmed.lastIndexOf('-');
    finalSlug =
      lastHyphen > 30
        ? trimmed.slice(0, lastHyphen)
        : trimmed.replace(/-+$/, '');
  }

  return finalSlug;
}

export async function generateAiSlug({
  title,
  model,
}: GenerateSlugOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables.'
    );
  }

  const selectedModel =
    model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  const systemPrompt = `You are an expert news SEO editor for an Indian financial and business news website. Your task is to generate a concise, meaningful, and SEO-friendly URL slug from an article title.

Strict Rules:
1. Ideal length: 4-10 words. Never exceed 12 words.
2. Character limit: aim for under 70 characters. Hard cap at 100 characters.
3. Put the primary subject, company name, person, or core topic within the FIRST 3 WORDS.
4. Remove unnecessary, repetitive, or filler words (e.g. "has a massive impact", "across the country", "today", "breaking news", "in business").
5. ALWAYS preserve important keywords, names, numbers, and relevant context from the title. Do NOT drop key entities like event names, company names, or financial figures.
6. Convert written numbers into digits (e.g. "twenty-five" -> "25", "forty thousand" -> "40000").
7. Preserve financial units and entity names (e.g. "40000-crore", "janmashtami", "ipo", "sensex", "nifty").
8. If the title is in Gujarati or another Indian language, translate or transliterate key concepts into concise English keywords.
9. Output format: Return ONLY the lowercase, hyphen-separated slug string. No explanations, no quotes, no markdown backticks, no punctuation.

Examples:
- Title: "Vocal for Local Has a Massive Impact, Estimated to Generate Over ₹40,000 Crore in Business Across the Country on Janmashtami"
  Output: vocal-for-local-to-generate-40000-crore-business-on-janmashtami
- Title: "Sensex Falls 470 Points, Nifty Drops 170 Points as Asian Markets Weaken Today"
  Output: sensex-falls-470-nifty-drops-170-asian-markets-weaken
- Title: "India Pushes To Produce 70% Of LPG Domestically To Cut Import Dependence"
  Output: india-pushes-70-percent-lpg-domestic-production-cut-import
- Title: "Vadodara 35000 Crore Infrastructure Projects Dedicated Freight Corridor"
  Output: vadodara-35000-crore-freight-corridor-infrastructure`;

  const userContent = `Article Title: "${title}"\nGenerate the SEO slug:`;

  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 80,
    },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestBody,
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Gemini API error ${res.status}: ${errorText.slice(0, 300)}`
    );
  }

  let data: {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw new Error('Failed to parse Gemini API response as JSON.');
  }

  const candidateText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!candidateText) {
    throw new Error('Gemini did not return any candidate text.');
  }

  return sanitizeAiSlug(candidateText);
}
