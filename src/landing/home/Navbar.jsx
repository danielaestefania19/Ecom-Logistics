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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";
import Banner from "./Banner.jsx";

const menuItems = ["Home", "Services", "Pricing", "About us"];

const servicesItems = [
  { key: 'Amazon', label: 'Amazon Partner (LTL & FTL)', path: '/Amazon Partner'},
  { key: 'FBA', label: 'FBA Prep Center', path: '/prepservices' },
  { key: 'TikTok', label: 'TikTok Shop 3PL', path: '/TikTok' },
  { key: 'StorageService', label: 'Storage Service', path: '/Storage Service' },
  { key: 'LocalMoving', label: 'Local Moving', path: '/Local Moving' },
  { key: 'BrandManagement', label: 'Brand Management', path: '/Brand Management' },
];


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
      <HerouiNavbar position="static" className="bg-primary text-white px-8 h-20">
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle />
        </NavbarContent>
        <NavbarItem className="sm:hidden">
          <NavbarBrand>
            <img src={LogoPrincipal2} alt="Logo" className="h-8 w-auto" />
          </NavbarBrand>
        </NavbarItem>
        <NavbarContent className="hidden sm:flex gap-4" justify="start">
          <NavbarBrand>
            <img src={LogoPrincipal2} alt="Logo" className="h-12 w-auto" />
          </NavbarBrand>

          <div className="flex gap-x-6 ml-auto">
            {menuItems.map((item, i) => {
              if (item === "Services") {
                return (
                  <Dropdown 
                  classNames={{
                    base: "before:bg-primary", 
                    content:
                      "bg-primary",
                  }}
                  key="services">
                  <NavbarItem>
                    <DropdownTrigger>
                      <Button
                        variant="light"
                        disableRipple
                        size='lg'
                        radius="sm"
                        className="p-0 bg-transparent text-white hover:text-gray-300 data-[hover=true]:bg-transparent -mt-4"
                        endContent={<ChevronDownIcon className="w-4 h-4" />}
                      >
                        Services
                      </Button>
                    </DropdownTrigger>
                  </NavbarItem>
                  <DropdownMenu variant='light'
                   itemClasses={{
                    base: [
                      "rounded-md",
                      "text-white",
                      "transition-opacity",
                      "data-[hover=true]:bg-white-100",
                      "data-[hover=true]:text-gray-300",
                    ],
                  }}
                    aria-label="Servicios disponibles"
                    items={servicesItems}
                  >
                    {(item) => (
                      <DropdownItem
                        key={item.key}
                        description={item.description}
                      >
                        <ReactRouterLink to={item.path} className="w-full block">
                          {item.label}
                        </ReactRouterLink>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
                

                );
              }

              return (
                <NavbarItem key={i} isActive={item === "Home"}>
                  <Link
                    as={ReactRouterLink}
                    to={`/${item.toLowerCase().replace(' ', '')}`}
                    className={`text-white ${location.pathname === `/${item.toLowerCase().replace(' ', '')}`
                        ? item === "Home"
                          ? "text-third"
                          : "text-white"
                        : "text-white"
                      }`}
                  >
                    {item}
                  </Link>
                </NavbarItem>
              );
            })}
          </div>
        </NavbarContent>

        <NavbarMenu />
      </HerouiNavbar>
    </div>
  );
}

export default Navbar;
