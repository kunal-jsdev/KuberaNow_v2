import * as Yup from 'yup';

export const advertiseValidationSchema = Yup.object().shape({
  companyName: Yup.string().required('Company Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email Address is required'),
  name: Yup.string().required('Name is required'),
  note: Yup.string(),
  phone: Yup.string()
    .matches(/^[0-9+ ]+$/, 'Phone number can only contain digits, + and spaces')
    .min(10, 'Phone number must be at least 10 characters')
    .required('Phone Number is required'),
  website: Yup.string(),
});
