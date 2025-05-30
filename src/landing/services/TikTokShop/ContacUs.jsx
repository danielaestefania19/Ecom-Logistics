import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import { useLanguage } from "../../i18n/LanguageContext";
import check from "../../../assets/check.png";

const ContactUs = () => {
    const { t } = useLanguage();

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

        if (!firstName.trim()) {
            setErrors({ firstName: t("tiktokShopContact.errors.firstName") });
            return;
        }

        if (!phone.trim()) {
            setErrors({ phone: t("tiktokShopContact.errors.phone") });
            return;
        }

        if (!email.trim()) {
            setErrors({ email: t("tiktokShopContact.errors.emailRequired") });
            return;
        } else if (!emailRegex.test(email)) {
            setErrors({ email: t("tiktokShopContact.errors.emailInvalid") });
            return;
        }

        setErrors({});
        const toastId = toast.loading(t("tiktokShopContact.sending"), {
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
                    render: t("tiktokShopContact.success"),
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
                render: t("tiktokShopContact.error"),
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
                    {t("tiktokShopContact.title")}
                </h2>
                <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto">
                    {t("tiktokShopContact.subtitle")}
                </p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.firstName")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.lastName")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>
                    <div>
                        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.companyName")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>
                    <div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.email")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.phone")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <select name="language" value={formData.language} onChange={handleChange}
                            className={`w-full h-[50px] border bg-white border-black p-3 rounded-xl ${formData.language === "" ? "text-gray-400" : "text-black"}`}
                        >
                            <option value="" disabled hidden>{t("tiktokShopContact.placeholders.language")}</option>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                        </select>
                    </div>
                    <div>
                        <input type="number" name="unitsPerMonth" value={formData.unitsPerMonth} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.units")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>
                    <div>
                        <input type="number" name="shipmentsPerMonth" value={formData.shipmentsPerMonth} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.shipments")}
                            className="w-full h-[50px] border border-black p-3 rounded-xl"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <select name="serviceType" value={formData.serviceType} onChange={handleChange}
                            className={`w-full h-[50px] border bg-white border-black p-3 rounded-xl ${formData.serviceType === "" ? "text-gray-400" : "text-black"}`}
                        >
                            <option value="" disabled hidden>{t("tiktokShopContact.placeholders.serviceType")}</option>
                            <option value="LTL">LTL</option>
                            <option value="FBA Prep">FBA Prep</option>
                            <option value="3PL">3PL</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <textarea name="message" value={formData.message} onChange={handleChange}
                            placeholder={t("tiktokShopContact.placeholders.message")}
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
                            {t("tiktokShopContact.submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactUs;
