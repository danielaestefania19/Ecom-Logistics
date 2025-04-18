import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import check from "../../assets/check.png";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        message: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
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
        const toastId = toast.loading("Sending your message...", {
            icon: <Spinner size="sm" />,
            progressStyle: {
              background: "#19203C",
            },
          });          
        setIsLoading(true)
        try {
            const response = await fetch("https://function-bun-production-ba48.up.railway.app/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, address, message }),
            });
            if (response.ok) {
                toast.update(toastId, {
                    render: "Information sent successfully. We will contact you within a few minutes.",
                    isLoading: false,
                    autoClose: 4000,
                    icon: <img src={check} alt="Success Icon" />,
                    closeButton: true,
                    hideProgressBar: true,
                    style: {
                      background: '#ffffff',
                      color: '#19203C',
                    },

                });                            
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    address: "",
                    message: ""
                });
                setErrors({});
            } else {
                toast.update(toastId, {
                    render: "Something went wrong while sending your information. Please try again later.",
                    type: "error",
                    isLoading: false,
                    autoClose: 4000,
                    icon: null,
                    closeButton: true,
                });
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.update(toastId, {
                render: "Something went wrong while sending your information. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000,
                icon: null,
                closeButton: true,
            });
        } finally {
            setIsLoading(false);
        }
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

                    <div className="md:col-span-2 flex justify-center mt-4">
                        <Button
                            radius="full"
                            className="w-full sm:w-auto px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-blue text-white font-semibold disabled:opacity-60"
                            type="submit"
                            isDisabled={isLoading}
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
