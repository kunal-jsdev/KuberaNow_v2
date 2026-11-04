import { createServerFeature } from '@payloadcms/richtext-lexical';

export const WordCountFeature = createServerFeature({
  feature: {
    ClientFeature:
      '@/Payload/components/WordCount/feature.client#WordCountFeatureClient',
  },
  key: 'wordCount',
});
