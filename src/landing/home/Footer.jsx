import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";
import facebook from '../../assets/facebook.png';
import instagram from '../../assets/instagram.png';
import tiktokicono from '../../assets/tiktokicono.png'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Logo */}
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-6 flex justify-center md:justify-start">
        <img src={LogoPrincipal2} alt="e-com LOGISTICS" className="h-12" />
      </div>

      {/* Línea superior */}
      <div className="flex justify-center">
        <div className="border-t border-slate-600 w-3/4" />
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-end">
    <div className="w-full md:w-1/2 flex flex-col sm:flex-row flex-wrap gap-y-10 gap-x-12 text-sm items-start justify-start text-left sm:justify-between sm:text-left" >
      {/* Information */}
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">Information</h4>
            <ul className="space-y-1">
              <li><a href="#">Our services</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <p className="leading-relaxed">
              25509 Industrial<br />
              Blvd, Hayward CA<br />
              94545 Suite E3<br />
              +1 341-208-9445
            </p>
          </div>

          {/* Social */}
          <div className="w-full sm:w-auto">
            <h4 className="font-semibold mb-3">Find Us</h4>
            <div className="flex justify-start gap-4 mt-2">
              <img src={facebook} alt="Facebook" className="h-8" />
              <img src={instagram} alt="Instagram" className="h-8" />
              <img src={tiktokicono} alt="Instagram" className="h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="flex justify-center">
        <div className="border-t border-slate-600 w-3/4" />
      </div>

      {/* Copyright */}
      <div className="text-center text-xs py-6">
        ©2023 camps. All right reserved
      </div>
    </footer>
  );
}
