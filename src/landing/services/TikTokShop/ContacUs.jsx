import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import check from "../../../assets/check.png";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        companyWebsite: "",
        email: "",
        phone: "",
        serviceType: "",
        unitsPerMonth: "",
        shipmentsPerMonth: "",
        message: "",
        language: ""
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
        const { firstName, email, phone } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 1. Validación individual con retorno inmediato
        if (!firstName.trim()) {
            setErrors({ firstName: "First name is required" });
            return;
        }

        if (!phone.trim()) {
            setErrors({ phone: "Phone is required" });
            return;
        }

        if (!email.trim()) {
            setErrors({ email: "Email is required" });
            return;
        } else if (!emailRegex.test(email)) {
            setErrors({ email: "Invalid email format" });
            return;
        }

        // Limpia errores si no hay ninguno
        setErrors({});


        const toastId = toast.loading("Sending your message...", {
            icon: <Spinner size="sm" />,
            progressStyle: { background: "#19203C" },
        });

        setIsLoading(true);
        try {
            const response = await fetch("https://function-bun-production-ba48.up.railway.app/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.update(toastId, {
                    render: "Information sent successfully. We will contact you within a few minutes.",
                    isLoading: false,
                    autoClose: 4000,
                    icon: <img src={check} alt="Success Icon" />,
                    closeButton: true,
                    hideProgressBar: true,
                    style: { background: '#ffffff', color: '#19203C' },
                });

                setFormData({
                    firstName: "",
                    lastName: "",
                    companyName: "",
                    companyWebsite: "",
                    email: "",
                    phone: "",
                    serviceType: "",
                    unitsPerMonth: "",
                    shipmentsPerMonth: "",
                    message: "",
                    language: ""
                });
                setErrors({});
            } else {
                throw new Error();
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
                <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">
                    Ready to optimize your logistics? <br />Get a logistics quote in less than 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* First Name */}
                    <div>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>

                    {/* Company Name */}
                    <div>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Company Name"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    {/* Language */}
                    <div>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className={`w-full h-[50px] border bg-white border-black p-3 rounded-xl ${formData.language === "" ? "text-gray-400" : "text-black"}`}
                        >
                            <option value="" disabled hidden>
                                Select Language
                            </option>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </div>

                    {/* Units per Month */}
                    <div>
                        <input
                            type="number"
                            name="unitsPerMonth"
                            value={formData.unitsPerMonth}
                            onChange={handleChange}
                            placeholder="Number of Units"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>

                    {/* Shipments per Month */}
                    <div>
                        <input
                            type="number"
                            name="shipmentsPerMonth"
                            value={formData.shipmentsPerMonth}
                            onChange={handleChange}
                            placeholder="Shipments per Month"
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>
                    {/* Service Type */}
                    <div className="md:col-span-2">
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            className={`w-full h-[50px] border bg-white border-black p-3 rounded-xl ${formData.serviceType === "" ? "text-gray-400" : "text-black"
                                }`}
                        >
                            <option value="" disabled hidden>
                                Type of Service
                            </option>
                            <option value="LTL">LTL</option>
                            <option value="FBA Prep">FBA Prep</option>
                            <option value="3PL">3PL</option>
                        </select>
                    </div>

                    {/* Message */}
                    <div className="md:col-span-2">
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Any additional information..."
                            className="w-full rounded-md min-h-[120px] border border-black p-3"
                        />
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
