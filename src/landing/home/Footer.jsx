import { Facebook, Twitter, Youtube } from 'lucide-react';
import LogoPrincipal2 from "../../assets/LogoPrincipal2.png";

export default function Footer() {
  return (
    <footer className="bg-[#0b0d11] text-white pt-12 pb-6 px-8 border-t border-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Logo */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white">
             <img src={LogoPrincipal2} alt="Logo" className="h-12 w-auto" />
          </h2>
          
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-10 text-sm">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Information</h4>
            <ul className="space-y-1 text-slate-400">
              <li><a href="#">Our services</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Track parcel</a></li>
              <li><a href="#">Calculator</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Contact us</h4>
            <p className="text-slate-400 leading-relaxed">
              25509 Industrial Blvd, Hayward CA<br />
              94545 Suite E3<br />
              341-208-9445
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Find us</h4>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="bg-white text-black p-2 rounded-full hover:opacity-80">
                <Facebook size={16} />
              </a>
              <a href="#" className="bg-white text-black p-2 rounded-full hover:opacity-80">
                <Twitter size={16} />
              </a>
              <a href="#" className="bg-white text-black p-2 rounded-full hover:opacity-80">
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t border-slate-700 pt-4 text-center text-slate-500 text-xs">
        ©2023 camps. All rights reserved
      </div>
    </footer>
  );
}
