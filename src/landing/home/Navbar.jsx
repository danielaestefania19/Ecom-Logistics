import React from 'react';
import {
  Navbar as HerouiNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu as HerouiNavbarMenu,
  NavbarMenuItem,
  useNavbarContext,
} from "@heroui/react";
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'; // Usamos Link de react-router-dom
import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";
import Banner from "./Banner.jsx";

const menuItems = ["Home", "About us", "Services", "Pricing", "Contact"];

function NavbarMenu() {
  const { setIsMenuOpen } = useNavbarContext();
  const location = useLocation();

  return (
    <HerouiNavbarMenu className="bg-primary text-white">
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-white text-3xl font-bold focus:outline-none hover:text-gray-300"
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>
      {menuItems.map((item, index) => (
        <NavbarMenuItem key={`${item}-${index}`}>
          <Link
            as={ReactRouterLink}
            to={`/${item.toLowerCase().replace(' ', '')}`}
            className={`w-full text-white ${location.pathname === `/${item.toLowerCase().replace(' ', '')}`
                ? item === "Home" ? "text-third" : "text-white"
                : "text-white"
              }`}
            size="lg"
          >
            {item}
          </Link>
        </NavbarMenuItem>
      ))}
    </HerouiNavbarMenu>
  );
}

const Navbar = () => {
  const location = useLocation();
  return (
    <div>
      <Banner />
      <HerouiNavbar
        position="static"
        className="bg-primary text-white px-8 h-20"
      >
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle />
        </NavbarContent>
        <NavbarItem className="sm:hidden">
          <NavbarBrand>
            <img src={LogoPrincipal2} alt="Logo" className="h-8 w-auto" />
          </NavbarBrand>
        </NavbarItem>
        <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarItem>
          <NavbarBrand>
            <img src={LogoPrincipal2} alt="Logo" className="h-12 w-auto" />
          </NavbarBrand>
        </NavbarItem>
          <div className="flex gap-x-6 ml-auto">
            {menuItems.map((item, i) => (
              <NavbarItem key={i} isActive={item === "Home"}>
                <Link
                  as={ReactRouterLink}
                  to={`/${item.toLowerCase().replace(' ', '')}`}
                  className={
                    `text-white ${location.pathname === `/${item.toLowerCase().replace(' ', '')}`
                      ? item === "Home"
                        ? "text-third"
                        : "text-white"
                      : "text-white"
                    }`
                  }
                >
                  {item}
                </Link>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        <NavbarMenu />
      </HerouiNavbar>
    </div>
  );
}

export default Navbar;
