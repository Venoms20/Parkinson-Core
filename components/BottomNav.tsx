import React from 'react';
import { Page } from '../types';
import { UserIcon, PillIcon, CalendarIcon, BookOpenIcon, SparklesIcon } from './Icons';
import { triggerHaptic } from '../utils/haptic';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (page: Page) => void;
}> = ({ page, label, icon, isActive, onClick }) => {
  const activeClasses = 'text-primary';
  const inactiveClasses = 'text-neutral/40';

  const handleClick = () => {
    triggerHaptic();
    onClick(page);
  }

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center flex-1 gap-1 p-2 transition-colors duration-200 relative ${isActive ? activeClasses : inactiveClasses}`}
    >
      {isActive && <div className="absolute top-0 h-1 w-8 bg-primary rounded-full" />}
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { page: 'MEDS' as Page, label: 'Remédios', icon: <PillIcon /> },
    { page: 'APPOINTMENTS' as Page, label: 'Consultas', icon: <CalendarIcon /> },
    { page: 'MESSAGE' as Page, label: 'Mensagem', icon: <SparklesIcon /> },
    { page: 'DIARY' as Page, label: 'Diário', icon: <BookOpenIcon /> },
    { page: 'PROFILE' as Page, label: 'Perfil', icon: <UserIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 flex justify-around">
      {navItems.map(item => (
        <NavItem
          key={item.page}
          page={item.page}
          label={item.label}
          icon={item.icon}
          isActive={currentPage === item.page}
          onClick={setCurrentPage}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
