import React from 'react';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  onToggleRightSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleRightSidebar }) => {
  const { user, activeTab, setActiveTab } = useApp();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'clientes', label: 'Clientes', icon: 'groups' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: 'request_quote' },
    { id: 'envios', label: 'Envíos Masivos', icon: 'send' },
    { id: 'bases', label: 'Bases de Datos', icon: 'database' },
  ];

  return (
    <header className=\"h-16 bg-[#141414] border-b border-white/5 flex items-center justify-between px-6 z-20\">
      {/* Left: Branding or Title */}
      <div className=\"flex items-center gap-4\">
        <div className=\"w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white\">R</div>
        <div className=\"hidden md:block\">
          <h1 className=\"text-sm font-bold text-white tracking-wide\">CRM PRO</h1>
          <p className=\"text-[10px] text-gray-500 font-mono\">v2.4.0</p>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className=\"flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-white/5\">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <span className=\"material-symbols-outlined text-[18px]\">{item.icon}</span>
            <span className=\"hidden lg:inline\">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Right: User Profile & Actions */}
      <div className=\"flex items-center gap-4\">
        <div className=\"flex items-center gap-3 pl-4 border-l border-white/5\">
          <div className=\"hidden md:block text-right\">
            <div className=\"text-sm font-bold text-white\">{user?.name || 'Usuario'}</div>
            <div className=\"text-[10px] text-gray-500\">{user?.email}</div>
          </div>
          <div className=\"w-8 h-8 rounded-full bg-gray-700 border border-white/10 overflow-hidden relative group cursor-pointer\">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt=\"Avatar\" className=\"w-full h-full object-cover\" />
          </div>
          <button 
            className=\"text-gray-400 hover:text-red-400 transition-colors\"
            title=\"Cerrar Sesión\"
          >
            <span className=\"material-symbols-outlined text-[20px]\">logout</span>
          </button>

          {/* Mobile History Button - Only for Sales View */}
          {activeTab === 'ventas' && (
            <button
              onClick={onToggleRightSidebar}
              className=\"lg:hidden text-gray-400 hover:text-white p-1 -mr-1 transition-colors\"
            >
              <span className=\"material-symbols-outlined\">history</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
