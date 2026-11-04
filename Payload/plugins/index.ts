import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { searchPlugin } from '@payloadcms/plugin-search';
import { seoPlugin } from '@payloadcms/plugin-seo';
import {
  GenerateDescription,
  GenerateImage,
  GenerateTitle,
  GenerateURL,
} from '@payloadcms/plugin-seo/types';
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import { Plugin } from 'payload';
import { cloudinaryStorage } from 'payload-storage-cloudinary';

import { MORNING_BRIEF_FORM_TITLE } from '@/constants/forms';
import { adminOrSeniorEditor } from '@/Payload/access/adminOrSeniorEditor';
// import { revalidateRedirects } from '@/Payload/hooks/revalidateRedirects';
import { isEditorUser } from '@/Payload/lib/Auth/roles';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';

type SeoDoc = {
  title?: string;
  slug?: string;
  summary?: string;
  description?: string;
  heroImage?: string | { id: string } | null;
};

const generateTitle: GenerateTitle<SeoDoc> = ({ doc }) => {
  return doc?.title ? doc.title : 'KuberaNow';
};

const generateDescription: GenerateDescription<SeoDoc> = ({ doc }) => {
  // eslint-disable-next-line no-nested-ternary
  return doc?.summary ? doc.summary : doc?.description ? doc.description : '';
};

// Use the article's hero image as the SEO image (same source as populateMetaImage).
const generateImage: GenerateImage<SeoDoc> = ({ doc }) => {
  const image = doc?.heroImage;
  if (!image) return '';
  return typeof image === 'object' ? image.id : image;
};

const generateURL: GenerateURL<SeoDoc> = ({ doc }) => {
  const url = getServerSideURL().replace(/\/+$/, '');

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

// Collections that define their own SEO `meta` fields.
const SEO_COLLECTIONS = ['news', 'news-categories', 'pages', 'tags'];

const seoPluginWithOwnFields: Plugin = async (config) => {
  const result = await seoPlugin({
    collections: SEO_COLLECTIONS,
    generateTitle,
    generateDescription,
    generateImage,
    generateURL,
  })(config);

  return { ...result, collections: config.collections };
};

export const plugins: Plugin[] = [
  cloudinaryStorage({
    cloudConfig: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    collections: {
      media: true,
      'lottie-files': true,
      disableLocalStorage: true,
    },
  }),
  seoPluginWithOwnFields,
  seoPlugin({
    generateTitle,
    generateDescription,
    generateURL,
    fields: ({ defaultFields }) =>
      defaultFields.map((field) => {
        if ('name' in field) {
          if (field.name === 'title') {
            return {
              ...field,
              label: 'SEO Meta Title',
            };
          }
          if (field.name === 'description') {
            return {
              ...field,
              label: 'SEO Meta Description',
            };
          }
        }
        return field;
      }),
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        create: ({ req: { user } }) => !user,
        read: adminOrSeniorEditor,
        update: () => false,
        delete: adminOrSeniorEditor,
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'whatsappNumber',
          type: 'text',
          label: 'WhatsApp Number',
          virtual: true,
          admin: { readOnly: true },
          hooks: {
            afterRead: [
              ({ siblingData }) =>
                (
                  siblingData?.submissionData as
                    { field?: string; value?: unknown }[] | undefined
                )?.find((row) =>
                  ['whatsappNumber', 'whatsapp-number'].includes(
                    row.field ?? ''
                  )
                )?.value ?? '',
            ],
          },
        },
      ],
      labels: {
        singular: 'Morning Brief Subscriber',
        plural: 'Morning Brief Subscribers',
      },
      admin: {
        hidden: ({ user }) =>
          process.env.NEXT_PAYLOAD_FORM_SUBMISSION_HIDDEN === 'true' ||
          isEditorUser(user as { role?: string | null }),
        defaultColumns: ['whatsappNumber'],
        description:
          'WhatsApp numbers submitted through the Morning Brief signup.',
        baseListFilter: async ({ req }) => {
          const { docs } = await req.payload.find({
            collection: 'forms',
            where: { title: { equals: MORNING_BRIEF_FORM_TITLE } },
            limit: 1,
            depth: 0,
            pagination: false,
            overrideAccess: true,
          });

          const formId = docs[0]?.id;
          return { form: { equals: formId ?? '__no_form__' } };
        },
      },
    },
    formOverrides: {
      // Forms stay publicly readable so the frontend can look up the Morning
      // Brief form; managing them is kept away from plain editors.
      access: {
        create: adminOrSeniorEditor,
        update: adminOrSeniorEditor,
        delete: adminOrSeniorEditor,
      },
      admin: {
        hidden: ({ user }) =>
          process.env.NEXT_PAYLOAD_FORM_HIDDEN === 'true' ||
          isEditorUser(user as { role?: string | null }),
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({
                      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
                    }),
                  ];
                },
              }),
            };
          }
          return field;
        });
      },
    },
  }),
  searchPlugin({
    collections: ['news'],
    beforeSync: ({ originalDoc, searchDoc }) => ({
      ...searchDoc,
      title: originalDoc.title,
      content: originalDoc.content
        ? convertLexicalToPlaintext({ data: originalDoc.content })
        : '',
    }),
    searchOverrides: {
      admin: {
        hidden: process.env.NEXT_PAYLOAD_SEARCH_RESULT_HIDDEN === 'true',
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'content',
          type: 'textarea',
          admin: {
            readOnly: true,
          },
          index: true,
        },
      ],
    },
  }),
];
