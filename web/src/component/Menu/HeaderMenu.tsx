import { Icon } from '../../shared/Icon'
import style from './HeaderMenu.module.css'
export const HeaderMenu = ({isDrawerOpen, handleToggleDrawer}: {isDrawerOpen: boolean, handleToggleDrawer: () => void}) => {
  return (
    <header className={style.header}>
        <Icon className={style.drawerToggle} name={isDrawerOpen ? "FaOutdent" : "FaIndent"} size={32} color="black" onClick={handleToggleDrawer}/>
    </header>
  )
}

