import { Outlet } from 'react-router-dom';
import { AppLayout } from '../components/layout/app-layout';

export function SuperAdminLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
