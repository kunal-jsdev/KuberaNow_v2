import { z } from 'zod';

export const applicationSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.coerce.number().int().positive('Invalid phone number'),
  currentCity: z.string().optional(),
  totalExperience: z.string().optional(),
  linkedinUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Invalid URL',
    }),
  portfolioUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Invalid URL',
    }),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const serverSideSchema = z.object({
  applicationId: z.string().min(1),
  position: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.coerce.number().int().positive('Invalid phone number'),
  currentCity: z.string().optional(),
  totalExperience: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  notes: z.string().max(1000).optional(),
  resumeFileName: z.string().min(1, 'Resume filename is required'),
  resumeMimeType: z
    .string()
    .refine(
      (val) =>
        ALLOWED_MIME_TYPES.includes(val as (typeof ALLOWED_MIME_TYPES)[number]),
      { message: 'Invalid resume file type' }
    ),
  resumeBase64: z.string().min(1, 'Resume data is required'),
  secret: z.string().min(1, 'Secret is required'),
});

export type ServerSidePayload = z.infer<typeof serverSideSchema>;
