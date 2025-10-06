import { useState } from "react";
import { HeaderMenu } from "../component/Menu";
import { Drawer } from "../component/Drawer";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="main">
      <HeaderMenu handleToggleDrawer={handleToggleDrawer} isDrawerOpen={isDrawerOpen} />
      <Drawer isOpen={isDrawerOpen} onClose={handleToggleDrawer} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}