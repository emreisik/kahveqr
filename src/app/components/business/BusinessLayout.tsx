import { Outlet } from 'react-router-dom';
import { BusinessSidebar } from './BusinessSidebar';

export function BusinessLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <BusinessSidebar />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}

