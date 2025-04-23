import { Phone, Mail, MapPin } from 'lucide-react';

const ContactInfo = () => {
  return (
    <section className="bg-white w-full py-24 px-6">
      <div className="max-w-xs mx-auto bg-white text-black flex flex-col gap-6">
        {/* Teléfono */}
        <div className="flex items-center  gap-4">
          <div className="bg-third p-3 rounded-full">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <p className="text-base lg:text-lg font-mono">+1 (833) 762-3436</p>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <div className="bg-third p-3 rounded-full">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <p className="text-base lg:text-lg font-mono">info@dclogisticsus.com</p>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-4">
          <div className="bg-third p-3 rounded-full mt-1">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <p className="text-base lg:text-lg font-mono">
            9550 Satellite Blvd, Suite 150<br />
            Orlando, FL 32837
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
