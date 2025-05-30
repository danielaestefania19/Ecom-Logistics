import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import check from "../../assets/check.png";
import { useLanguage } from "../i18n/LanguageContext";

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
    language: "",
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
      setErrors({ firstName: t("errorFirstNameRequired") });
      return;
    }
    if (!phone.trim()) {
      setErrors({ phone: t("errorPhoneRequired") });
      return;
    }
    if (!email.trim()) {
      setErrors({ email: t("errorEmailRequired") });
      return;
    } else if (!emailRegex.test(email)) {
      setErrors({ email: t("errorInvalidEmail") });
      return;
    }

    setErrors({});
    const toastId = toast.loading(t("formSending"), {
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
          render: t("formSuccess"),
          isLoading: false,
          autoClose: 4000,
          icon: <img src={check} alt="Success Icon" />,
          closeButton: true,
          hideProgressBar: true,
          style: { background: "#ffffff", color: "#19203C" },
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
          language: "",
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.update(toastId, {
        render: t("formError", err),
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
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          {t("contactTitle")}
        </h2>
        <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto text-sm sm:text-base">
          {t("contactSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("formFirstName")}
              className="w-full h-[50px] border border-black p-3 rounded-xl"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t("formLastName")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />

          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder={t("formCompany")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("formEmail")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("formPhone")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full h-[50px] border bg-white border-black p-3 rounded-xl text-gray-400"
          >
            <option value="" disabled hidden>
              {t("formLanguage")}
            </option>
            <option value="English">English</option>
            <option value="Spanish">Español</option>
          </select>

          <input
            type="number"
            name="unitsPerMonth"
            value={formData.unitsPerMonth}
            onChange={handleChange}
            placeholder={t("formUnits")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />

          <input
            type="number"
            name="shipmentsPerMonth"
            value={formData.shipmentsPerMonth}
            onChange={handleChange}
            placeholder={t("formShipments")}
            className="w-full h-[50px] border border-black p-3 rounded-xl"
          />

          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full h-[50px] border bg-white border-black p-3 rounded-xl text-gray-400 md:col-span-2"
          >
            <option value="" disabled hidden>
              {t("formServiceType")}
            </option>
            <option value="LTL">LTL</option>
            <option value="FBA Prep">FBA Prep</option>
            <option value="3PL">3PL</option>
          </select>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t("formMessage")}
            className="w-full rounded-md min-h-[120px] border border-black p-3 md:col-span-2"
          />

          <div className="md:col-span-2 flex justify-center mt-4">
            <Button
              radius="full"
              className="w-full sm:w-auto px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-blue text-white font-semibold disabled:opacity-60"
              type="submit"
              isDisabled={isLoading}
            >
              {t("formSubmit")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
