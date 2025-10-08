'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      title: 'Registrations',
      path: '/admin/registrations',
    },
    {
      title: 'Race',
      path: '/admin/race',
    },
    {
      title: 'Referral Codes',
      path: '/admin/referral-codes',
    },
    {
      title: 'WhatsApp Sessions',
      path: '/admin/whatsapp-sessions',
    },
    {
      title: 'Settings',
      path: '/admin/settings',
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/admin/logout"
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 