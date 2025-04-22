import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import check from "../../assets/check.png";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        companyWebsite: "",
        email: "",
        phone: "",
        typeOfService: "",
        numberOfUnits: "",
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
        const {
            firstName, lastName, companyName, email, phone,
            typeOfService, numberOfUnits
        } = formData;

        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!firstName.trim()) newErrors.firstName = "First name is required";
        if (!lastName.trim()) newErrors.lastName = "Last name is required";
        if (!companyName.trim()) newErrors.companyName = "Company name is required";
        if (!phone.trim()) newErrors.phone = "Phone is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";
        if (!typeOfService) newErrors.typeOfService = "Service type is required";
        if (!numberOfUnits.trim()) newErrors.numberOfUnits = "Number of units is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const toastId = toast.loading("Sending your message...", {
            icon: <Spinner size="sm" />,
            progressStyle: { background: "#19203C" }
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
                    render: "Information sent successfully. We will contact you shortly.",
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
                    firstName: "", lastName: "", companyName: "", companyWebsite: "",
                    email: "", phone: "", typeOfService: "", numberOfUnits: "", message: ""
                });
                setErrors({});
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("Fetch error:", err);
            toast.update(toastId, {
                render: "Something went wrong. Please try again later.",
                type: "error",
                isLoading: false,
                autoClose: 4000,
                closeButton: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="contact" className="w-full bg-primary py-16 px-4 flex justify-center">
            <div className="bg-white rounded-2xl w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-20 py-12 shadow-md">
                <h2 className="text-3xl font-bold text-center mb-2">Contact Us</h2>
                <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">
                We would like to hear from you! Fill out your contact information below. When we receive your inquiry, we will contact you as soon as possible.             </p>

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First name*"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last name*"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                         />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name*"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                        {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="companyWebsite"
                            placeholder="Company Website"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                         />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Work Email Address*"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number*"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>
                    <div>
                        <select
                            name="typeOfService"
                            value={formData.typeOfService}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            <option value="">Type of Service*</option>
                            <option value="LTL">LTL</option>
                            <option value="FBA Prep">FBA Prep</option>
                            <option value="3PL">3PL</option>
                        </select>
                        {errors.typeOfService && <p className="text-red-500 text-sm">{errors.typeOfService}</p>}
                    </div>
                    <div>
                        <input
                            type="number"
                            name="numberOfUnits"
                            placeholder="Number of Units*"
                            value={formData.numberOfUnits}
                            onChange={handleChange}
                            className="w-full p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                         />
                        {errors.numberOfUnits && <p className="text-red-500 text-sm">{errors.numberOfUnits}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <textarea
                            name="message"
                            placeholder="Any Additional Information"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full h-32 p-3 rounded-md border border-gray-200 shadow-xl bg-white text-black font-medium placeholder:text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                          />
                    </div>

                    <div className="md:col-span-2 flex justify-center mt-4">
                        <Button
                            radius="full"
                            className="w-full sm:w-auto px-10 py-4 text-lg bg-blue text-white font-semibold disabled:opacity-60"
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
