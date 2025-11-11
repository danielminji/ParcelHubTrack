/**
 * Admin Dashboard Page (alias route)
 * Redirects to main admin page
 */

import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  redirect('/admin');
}
