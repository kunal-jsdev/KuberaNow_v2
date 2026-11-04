import fs from 'node:fs/promises';
import path from 'node:path';

export async function getTermsOfUseContent() {
  const filePath = path.join(process.cwd(), 'content/terms-of-use.md');
  return fs.readFile(filePath, 'utf8');
}

export const normalizeEnv = (value?: string) => value?.trim().toLowerCase();

export const isStagingEnvironment = (): boolean => {
  const env = normalizeEnv(process.env.NEXT_PUBLIC_ENV);
  if (env === 'staging') return true;
  if (env === 'production') return false;

  const serverUrl = normalizeEnv(process.env.NEXT_PUBLIC_SERVER_URL) ?? '';
  if (serverUrl.includes('staging') || serverUrl.includes('netlify.app'))
    return true;

  const netlifyContext = normalizeEnv(process.env.CONTEXT);
  if (netlifyContext === 'deploy-preview' || netlifyContext === 'branch-deploy')
    return true;

  return false;
};

export const robotsMetadata = isStagingEnvironment()
  ? {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    }
  : {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    };
