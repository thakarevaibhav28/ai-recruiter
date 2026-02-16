import React, { ReactNode } from 'react';
import Sidebar from './AdminSidebar';
import Header from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  heading?: string;
  subheading?: string;  // Added this
  showSearch?: boolean;
  userName?: string;
  userInitial?: string;
  activeMenuItem?: string;
  onMenuItemClick?: (item: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  heading = "Hi, John",
  subheading,  // Added this
  showSearch = true,
  userName = "John",
  userInitial = "H",
  activeMenuItem = "Dashboard",
  onMenuItemClick
}) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar 
        activeItem={activeMenuItem}
        onItemClick={onMenuItemClick}
      />
      
      <div className="flex flex-1 flex-col ml-60">
        <Header 
          heading={heading}
          subheading={subheading}  // Added this
          showSearch={showSearch}
          userName={userName}
          userInitial={userInitial}
        />
        
        <main className="flex-1 overflow-auto px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;