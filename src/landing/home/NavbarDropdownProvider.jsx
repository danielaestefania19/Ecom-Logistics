/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const NavbarDropdownContext = createContext(null);

/**
 * Hook que se debe usar dentro del proveedor para acceder al estado del dropdown
 */
export function useNavbarDropdown() {
  return useContext(NavbarDropdownContext);
}

/**
 * Componente Provider que envuelve la app y gestiona el dropdown global
 */
function NavbarDropdownProvider({ children }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <NavbarDropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </NavbarDropdownContext.Provider>
  );
}

export default NavbarDropdownProvider;
