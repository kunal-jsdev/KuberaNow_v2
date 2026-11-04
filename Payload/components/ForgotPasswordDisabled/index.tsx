import { redirect } from 'next/navigation';

export default function ForgotPasswordDisabled() {
  redirect('/admin/login');
}
