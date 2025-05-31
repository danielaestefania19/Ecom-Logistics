import React, { useState } from "react";
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
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link as ReactRouterLink, useLocation } from "react-router-dom";
import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";
import Banner from "./Banner.jsx";
import PriceList from "../../assets/PriceList.pdf";
import { useLanguage } from "../i18n/LanguageContext";

const servicesItems = [
  { key: "Amazon", labelKey: "ltlTitle", path: "/amazon-partner" },
  { key: "FBA", labelKey: "fbaTitle", path: "/prep-center" },
  { key: "TikTok", labelKey: "tiktokTitle", path: "/tiktok-shop" },
];

function getRoutePath(label, t) {
  switch (label) {
    case t("home"):
      return "/home";
    case t("aboutUs"):
      return "/about-us";
    default:
      return "/";
  }
}

function NavbarMenu() {
  const { setIsMenuOpen } = useNavbarContext();
  const location = useLocation();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const menuItems = [t("home"), t("services"), t("pricing"), t("aboutUs")];

  const getFlag = (lang) => (lang === "es" ? "🇪🇸" : "🇺🇸");

  return (
    <HerouiNavbarMenu className="bg-primary text-white">
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-white text-3xl font-bold focus:outline-none hover:text-gray-300"
          aria-label="Cerrar menú"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>
      </div>

      {menuItems.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {item === t("services") ? (
            <>
              <NavbarMenuItem>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full -mt-2 -mb-4 text-white text-lg pr-2 py-2 flex justify-between items-center"
                >
                  {t("services")}
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </button>
              </NavbarMenuItem>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isServicesOpen ? "max-h-96" : "max-h-0"}`}
              >
                {servicesItems.map((service) => (
                  <NavbarMenuItem key={service.key}>
                    <Link
                      as={ReactRouterLink}
                      to={service.path}
                      className="w-full text-white text-base pl-6 py-1"
                      onPress={() => setIsMenuOpen(false)}
                    >
                      {t(service.labelKey)}
                    </Link>
                  </NavbarMenuItem>
                ))}
              </div>
            </>
          ) : item === t("pricing") ? (
            <NavbarMenuItem>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.open(PriceList, "_blank");
                }}
                className="w-full text-white text-lg text-left py-2 hover:text-gray-300"
              >
                {item}
              </button>
            </NavbarMenuItem>
          ) : (
            <NavbarMenuItem>
              <Link
                as={ReactRouterLink}
                to={getRoutePath(item, t)}
                className={`w-full text-white text-lg ${location.pathname === getRoutePath(item, t) ? "text-third" : ""}`}
                onPress={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            </NavbarMenuItem>
          )}
        </React.Fragment>
      ))}

      <NavbarMenuItem>
        <button
          onClick={() => setIsLanguageOpen((prev) => !prev)}
          className="w-full -mt-2 -mb-4 text-white text-lg pr-2 py-2 flex justify-between items-center"
        >
          {getFlag(language)} {language.toUpperCase()}
          <ChevronDownIcon
            className={`h-5 w-5 transition-transform duration-300 ${isLanguageOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        <div
          className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${isLanguageOpen ? "max-h-40" : "max-h-0"}`}
        >
          <NavbarMenuItem>
            <button
              onClick={() => {
                setLanguage("en");
                setIsMenuOpen(false);
              }}
              className="w-full text-white text-base pl-6 py-1 text-left"
            >
              🇺🇸 EN
            </button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <button
              onClick={() => {
                setLanguage("es");
                setIsMenuOpen(false);
              }}
              className="w-full text-white text-base pl-6 py-1 text-left"
            >
              🇪🇸 ES
            </button>
          </NavbarMenuItem>
        </div>
      </NavbarMenuItem>
    </HerouiNavbarMenu>
  );
}

const Navbar = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const getFlag = (lang) => (lang === "es" ? "🇪🇸" : "🇺🇸");

  const menuItems = [t("home"), t("services"), t("pricing"), t("aboutUs")];

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

          <div className="flex gap-x-6 ml-auto items-center">
            {menuItems.map((item, i) => {
              if (item === t("services")) {
                return (
                  <Dropdown key="services" classNames={{ base: "before:bg-primary", content: "bg-primary" }}>
                    <NavbarItem>
                      <DropdownTrigger>
                        <Button
                          variant="light"
                          disableRipple
                          size="lg"
                          radius="sm"
                          className="p-0 bg-transparent text-white hover:text-gray-300 data-[hover=true]:bg-transparent"
                          endContent={
                            <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                          }
                        >
                          {t("services")}
                        </Button>
                      </DropdownTrigger>
                    </NavbarItem>
                    <DropdownMenu
                      variant="light"
                      aria-label="Servicios disponibles"
                      itemClasses={{
                        base: [
                          "rounded-md",
                          "text-white",
                          "transition-opacity",
                          "data-[hover=true]:bg-white-100",
                          "data-[hover=true]:text-gray-300",
                        ],
                      }}
                    >
                      {servicesItems.map((item) => (
                        <DropdownItem key={item.key}>
                          <ReactRouterLink to={item.path} className="w-full block">
                            {t(item.labelKey)}
                          </ReactRouterLink>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                );
              }

              if (item === t("pricing")) {
                return (
                  <NavbarItem key={i}>
                    <button
                      onClick={() => window.open(PriceList, "_blank")}
                      className="p-0 bg-transparent text-white hover:text-gray-300"
                    >
                      {item}
                    </button>
                  </NavbarItem>
                );
              }

              return (
                <NavbarItem key={i}>
                  <Link
                    as={ReactRouterLink}
                    to={getRoutePath(item, t)}
                    className={`text-white hover:text-gray-300 transition-colors ${location.pathname === getRoutePath(item, t) ? "text-third" : ""
                      }`}
                  >
                    {item}
                  </Link>
                </NavbarItem>
              );
            })}

            <Dropdown classNames={{ content: "bg-primary" }}>
              <NavbarItem>
                <DropdownTrigger>
                  <Button
                    variant="light"
                    disableRipple
                    size="lg"
                    radius="sm"
                    className="p-0 bg-transparent text-white hover:text-gray-300 data-[hover=true]:bg-transparent"
                    endContent={<ChevronDownIcon className="w-4 h-4" aria-hidden="true" />}
                  >
                    {getFlag(language)} {language.toUpperCase()}
                  </Button>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu
                variant="light"
                aria-label="Selector de idioma"
                itemClasses={{
                  base: [
                    "rounded-md",
                    "text-white",
                    "transition-opacity",
                    "data-[hover=true]:bg-white-100",
                    "data-[hover=true]:text-gray-300",
                  ],
                }}
              >
                <DropdownItem onPress={() => setLanguage("en")}>🇺🇸 EN</DropdownItem>
                <DropdownItem onPress={() => setLanguage("es")}>🇪🇸 ES</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </NavbarContent>

        <NavbarMenu />
      </HerouiNavbar>
    </div>
  );
};

export default Navbar;
