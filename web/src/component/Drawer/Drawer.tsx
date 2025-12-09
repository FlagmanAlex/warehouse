import { useNavigate } from 'react-router-dom';
import styles from './Drawer.module.css';
import { useEffect, useState } from 'react';
import { Icon } from '../../shared/Icon';
import { useAuth } from '../Screens/AuthScreen/AuthContext';

export const Drawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const { logout, user } = useAuth();

  const menuItems = [
    {
      label: 'Документы',
      path: '/docs',
    },
    {
      label: 'Справочники',
      path: '',
      children: [
        { label: 'Клиенты', path: '/customers' },
        { label: 'Продукция', path: '/products' },
      ],
    },
    {
      label: 'Отчеты',
      path: '',
      children: [
        { label: 'В работе', path: '/inprogress-report' },
        { label: 'По клиентам', path: '/inprogress-report-by-customer' },
        { label: 'В доставке', path: '/indelivery-report-by-customer' },

      ],
    },
    {
      label: 'Инструменты',
      path: '',
      children: [
        { label: 'Планирование доставки', path: '/delivery-planning' },
      ],
    },
    {
      label: `${user ? user?.username + ' / Выход' || '' : '' }`,
      path: '',
      onClick() {
        logout();
        navigate('/login');
      },
    }

  ];


  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleLinkClick = (path?: string, hasChildren?: boolean) => {
    if (hasChildren) return;
    if (path) {
      navigate(path);
      onClose();
    }
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
      onClick={onClose}
    >
      <div className={styles.overlay} />
      <div
        className={styles.content}
        onClick={(e) => e.stopPropagation()}
      >
        <ul className={styles.menu}>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) {
                    item.onClick();
                    return;
                  }
                  handleLinkClick(item.path, !!item.children);
                  if (item.children) {
                    toggleSubmenu(item.label);
                  }
                }}
                className={styles.menuLink}
              >
                {item.label}
                {item.children && (
                  <Icon
                    className={`${styles.arrow} ${openSubmenus.has(item.label) ? styles.arrowOpen : ''}`}
                    name="FaRegCircleUp"
                    size={16}
                  />
                )}
              </a>

              {item.children && openSubmenus.has(item.label) && (
                <ul className={styles.submenu}>
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(child.path);
                        }}
                        className={styles.submenuLink}
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};