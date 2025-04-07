import { useState } from "react";
import { Button } from "@heroui/react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        message: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, phone, email, address, message } = formData;
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
            setErrors(newErrors);
            return;
        }

        if (!phone.trim()) {
            newErrors.phone = "Phone is required";
            setErrors(newErrors);
            return;
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
            setErrors(newErrors);
            return;
        }
        if (!address.trim()) {
            newErrors.address = "Address is required";
            setErrors(newErrors);
            return;
        }

        if (!message.trim()) {
            newErrors.message = "Message is required";
            setErrors(newErrors);
            return;
        }

        toast("¡Mensaje enviado con éxito!", {
            className: "custom-toast-success",
            icon: "✔️",
            position: "top-right",
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          

        // Limpiar formulario
        setFormData({
            name: "",
            phone: "",
            email: "",
            address: "",
            message: ""
        });

        setErrors({});
    };

    return (
        <section className="w-full bg-primary py-16 px-4 md:px-0 flex justify-center">
            <div className="bg-white rounded-2xl max-w-6xl w-full px-20 py-12 shadow-md">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Contact Us</h2>
                <p className="text-center text-gray-500 mb-8 max-w-md mx-auto text-sm">
                    We would like to hear from you! Fill out your contact information below. When we receive your inquiry, we will contact you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="E.g. Juan Diego"
                            className="w-full h-[55px] border border-black p-3 rounded-xl"
                        />
                        {errors.name && <p className="text-third text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Phone:</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ej: +1 12345678"
                            className="w-full h-[55px] border border-black p-3 rounded-xl"
                        />
                        {errors.phone && <p className="text-third text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Email Address:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="E.g. juandiego@gmail.com"
                            className="w-full h-[55px] border border-black p-3 rounded-xl"
                        />
                        {errors.email && <p className="text-third text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Ej: 25509 Industrial Blvd..."
                            className="w-full h-[55px] border border-black p-3 rounded-xl"
                        />
                         {errors.address && <p className="text-third text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* Message */}
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-medium text-gray-800">Message:</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any additional information..."
                            className="w-full rounded-md min-h-[120px] border border-black p-3"
                        />
                        {errors.message && <p className="text-third text-sm mt-1">{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2 flex justify-center mt-2">
                        <Button
                            radius="full"
                            className="px-10 py-6 rounded-full bg-blue text-white font-semibold text-lg md:text-xl hover:bg-black"
                            type="submit"
                        >
                            Submit →
                        </Button>
                    </div>
                </form>

                {/* Toast container */}
                <ToastContainer />
            </div>
        </section>
    );
};

export default ContactUs;
