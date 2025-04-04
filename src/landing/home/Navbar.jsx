import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  useNavbarContext,
} from "@heroui/react";
import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";

const menuItems = ["Home", "About us", "Services", "Pricing", "Contact"];

function NavbarMenuWithCloseButton() {
  const { setIsMenuOpen } = useNavbarContext();

  return (
    <NavbarMenu className="bg-primary text-white">
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-white text-2xl font-bold focus:outline-none"
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>
      {menuItems.map((item, index) => (
        <NavbarMenuItem key={`${item}-${index}`}>
          <Link
            className="w-full text-white"
            color={
              index === 2
                ? "warning"
                : index === menuItems.length - 1
                ? "danger"
                : "foreground"
            }
            href="#"
            size="lg"
          >
            {item}
          </Link>
        </NavbarMenuItem>
      ))}
    </NavbarMenu>
  );
}

export default function App() {
  return (
    <Navbar
      disableAnimation
      isBordered
      position="static"
      className="bg-primary text-white px-8 h-20 mt-[68px]"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand className="flex items-center">
          <img src={LogoPrincipal2} alt="Logo" className="h-16 w-auto" />
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-10 ml-auto justify-end">
        <NavbarBrand>
          <img src={LogoPrincipal2} alt="Logo" className="h-16 w-auto" />
        </NavbarBrand>
        {menuItems.map((item, i) => (
          <NavbarItem key={i} isActive={item === "Home"}>
            <Link href="#" className="text-white">
              {item}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarMenuWithCloseButton />
    </Navbar>
  );
}
