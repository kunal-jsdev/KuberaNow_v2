import * as Yup from 'yup';

export const applyJobValidationSchema = Yup.object().shape({
  city: Yup.string(),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  experience: Yup.string(),
  linkedin: Yup.string().url('Invalid URL'),
  name: Yup.string().required('Name is required'),
  note: Yup.string(),
  phone: Yup.string()
    .matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number')
    .required('Phone number is required'),
  portfolio: Yup.string().url('Invalid URL'),
  resume: Yup.mixed()
    .required('Resume is required')
    .test('fileType', 'Please upload a PDF or DOC file.', (value) => {
      if (!value) return true;
      const file = value as File;
      const isValidType =
        file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const ext = file.name.split('.').pop()?.toLowerCase();
      return isValidType || ext === 'pdf' || ext === 'doc' || ext === 'docx';
    })
    .test('fileSize', 'File size must be less than 5MB.', (value) => {
      if (!value) return true;
      const file = value as File;
      return file.size <= 10 * 1024 * 1024;
    }),
});
