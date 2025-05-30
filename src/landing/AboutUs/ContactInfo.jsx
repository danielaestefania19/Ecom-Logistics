import { Phone, Mail, MapPin } from 'lucide-react';

const ContactInfo = () => {
    return (
        <section className="bg-white w-full py-24 px-6">
            <div className="max-w-xs mx-auto bg-white text-black flex flex-col gap-6">
                <div className="flex items-center  gap-4">
                    <div className="bg-third p-3 rounded-full">
                        <Phone className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-base lg:text-lg">+1 (341) 208 9445</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-third p-3 rounded-full">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-base lg:text-lg">info@ecomlogisticsus.com</p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-third p-3 rounded-full mt-1">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-base lg:text-lg">
                        25509 Industrial Blvd,<br />
                        Hayward CA 94545 Suite E3
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ContactInfo;
