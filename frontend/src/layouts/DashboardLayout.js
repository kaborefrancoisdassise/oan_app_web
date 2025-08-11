import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Dashboard.css';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newArchiveCount, setNewArchiveCount] = useState(0);
  const [tables, setTables] = useState([]);
  const [settingOpen, setSettingOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Nav items hors Paramètres (on retire Paramètres ici, on le gère en dessous)
  const navItems = [
    { icon: 'bi-house-fill', label: 'Accueil', path: '/dashboard' },
    { icon: 'bi-file-earmark-plus-fill', label: 'Ajout Infos', path: '/dashboard/ajout' },
    { icon: 'bi-archive-fill', label: 'Mes archives', path: '/dashboard/archives', hasBadge: true },
    { icon: 'bi-file-earmark-text-fill', label: 'Historique connexion', path: '/dashboard/rapports' },
    { icon: 'bi-people-fill', label: 'Utilisateurs', path: '/dashboard/utilisateurs' },
    { icon: 'bi-map-fill', label: 'Exploration régionale', path: '/dashboard/exploration' },
    { icon: 'bi-hdd-rack-fill', label: 'Sites', path: '/dashboard/sites' },
  ];

  const logoutItem = {
    icon: 'bi-box-arrow-right',
    label: 'Déconnexion',
    path: '/'
  };

  // Charger les tables (sous-menus Paramètres)
  useEffect(() => {
    fetch("http://localhost/app-web/backend/api/list_tables.php")
      .then(res => res.json())
      .then(data => setTables(data.tables || []))
      .catch(console.error);
  }, []);

  // Ouvrir le sous-menu "Paramètres" si on est sur une route setting
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/setting')) {
      setSettingOpen(true);
    } else {
      setSettingOpen(false);
    }
  }, [location.pathname]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost/app-web/backend/logout.php", {
        withCredentials: true
      });
      navigate('/');
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  };

  // Naviguer + fermer sidebar (optionnel)
  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex dashboard-wrapper">
      {/* === SIDEBAR === */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-inner d-flex flex-column h-100">
          <div className="sidebar-header d-flex align-items-center justify-content-center py-3">
            <i className="bi bi-geo-fill text-white me-2 fs-5"></i>
            {sidebarOpen && <span className="fw-bold text-white fs-6">Couverture360</span>}
          </div>

          <div className="sidebar-content flex-grow-1">
            {/* Nav items classiques */}
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`sidebar-item small-text ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
                style={{ position: 'relative' }}
              >
                <i className={`bi ${item.icon} icon`}></i>
                {sidebarOpen && <span className="label-text">{item.label}</span>}

                {item.hasBadge && newArchiveCount > 0 && (
                  <span className="badge bg-danger text-white rounded-circle position-absolute top-0 end-0 translate-middle p-1 small">
                    {newArchiveCount}
                  </span>
                )}
              </div>
            ))}

            {/* Paramètres avec sous-menu */}
            <div
              className={`sidebar-item small-text ${location.pathname.startsWith('/dashboard/setting') ? 'active' : ''}`}
              onClick={() => setSettingOpen(!settingOpen)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <i className="bi bi-gear-fill icon"></i>
              {sidebarOpen && (
                <>
                  <span className="label-text">Paramètres</span>
                  <i
                    className={`bi ms-auto transition-icon ${settingOpen ? 'bi-caret-down-fill' : 'bi-caret-right-fill'}`}
                    style={{ fontSize: '1rem' }}
                  />
                </>
              )}
            </div>

            {/* Sous-menu des tables, visible si sidebar ouvert & settingOpen true */}
            {sidebarOpen && settingOpen && (
              <div className="submenu ps-4">
                {tables.length === 0 && (
                  <div className="text-muted small">Chargement...</div>
                )}
                {tables.map((t) => {
                  const path = `/dashboard/setting/${t}`;
                  const active = location.pathname === path;
                  return (
                    <div
                      key={t}
                      className={`sidebar-item small-text submenu-item ${active ? 'active' : ''}`}
                      onClick={() => handleNavigate(path)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="bi bi-table icon"></i>
                      <span className="label-text">{t}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sidebar-footer mt-auto">
            <div className="sidebar-item small-text" onClick={handleLogout}>
              <i className={`bi ${logoutItem.icon} icon`}></i>
              {sidebarOpen && <span className="label-text">{logoutItem.label}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* === MAIN + TOPBAR === */}
      <div className="main-area d-flex flex-column flex-grow-1">
        <div className="topbar d-flex justify-content-between align-items-center px-4 py-2">
          <h5 className="m-0 fw-bold text-white">
            Bienvenu(e)
          </h5>

          <div className="d-flex align-items-center gap-3">
            <button className="btn text-white position-relative">
              <i className="bi bi-bell fs-5"></i>
              {newArchiveCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {newArchiveCount}
                </span>
              )}
            </button>

            <div className="dropdown">
              <button
                className="btn text-white dropdown-toggle d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle fs-4"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item" onClick={() => navigate('/dashboard/exploration')}>
                    Exploration
                  </span>
                </li>

                <li><hr className="dropdown-divider" /></li>
                <li>
                  <span className="dropdown-item text-danger" onClick={handleLogout}>
                    Déconnexion
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="content-wrapper p-3 bg-light flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
