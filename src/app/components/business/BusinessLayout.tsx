import { Outlet } from 'react-router-dom';
import { BusinessSidebar } from './BusinessSidebar';

export function BusinessLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <BusinessSidebar />
      <main className="flex-1 lg:ml-64 w-full min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

