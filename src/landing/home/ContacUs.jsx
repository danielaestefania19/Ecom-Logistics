import { useState } from "react";
import { Button, addToast } from "@heroui/react";

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Email format is invalid";
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
        addToast({
            title: "Submitted Successfully",
            description: "Thanks for reaching out! We'll get back to you shortly.",
            color: "primary",
          });
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
        
        <section id="contact" className="w-full bg-primary py-16 px-4 flex justify-center">
            <div className="bg-white rounded-2xl w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-20 py-12 shadow-md">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">Contact Us</h2>
                <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                    We would like to hear from you! Fill out your contact information below. When we receive your inquiry, we will contact you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="E.g. Juan Diego"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2 flex justify-center mt-4">
                        <Button
                            radius="full"
                            className="w-full sm:w-auto px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-blue text-white font-semibold"
                            type="submit"
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
};    

export default ContactUs;
