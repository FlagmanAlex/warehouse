import { useNavigate } from 'react-router-dom';
import styles from './Drawer.module.css';

export const Drawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }

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
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('/docs'); }}>
              Документы
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('/clients'); }}>
              Клиенты
            </a>
          </li>
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('/products'); }}>
              Продукция
            </a>
          </li>
          <li>
            <a href='#' onClick={(e) => { e.preventDefault(); handleLinkClick('/stock-warehouse'); }}>
              Остатки по складу
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};