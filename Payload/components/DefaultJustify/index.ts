import { createServerFeature } from '@payloadcms/richtext-lexical';

export const DefaultJustifyFeature = createServerFeature({
  feature: {
    ClientFeature:
      '@/Payload/components/DefaultJustify/feature.client#DefaultJustifyFeatureClient',
  },
  key: 'defaultJustify',
});
