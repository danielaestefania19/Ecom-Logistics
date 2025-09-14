import { useEffect, useState } from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Button,
  Spinner,
} from "@heroui/react";
import { toast } from "react-toastify";
import check from "../../../assets/check.png";
import { useLanguage } from "../../i18n/LanguageContext";
import { getAllStates, getCitiesByState } from "../../i18n/citiesAndSates";

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
    state: "",
    city: "",
    heardFrom: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const states = getAllStates();
    setStates(states);
  }, []);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setFormData((prev) => ({ ...prev, state, city: "" }));
    setCities(getCitiesByState(state));
    setErrors((prev) => ({ ...prev, state: "", city: "" }));
  };

  const handleCityChange = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    setErrors((prev) => ({ ...prev, city: "" }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      firstName,
      lastName,
      companyName,
      companyWebsite,
      email,
      phone,
      serviceType,
      unitsPerMonth,
      shipmentsPerMonth,
      message,
      language,
      state,
      city,
      heardFrom,
    } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numberRegex = /^[0-9]+$/;
    const newErrors = {};

    if (!firstName?.trim()) newErrors.firstName = t("errorFirstNameRequired");
    if (!lastName?.trim()) newErrors.lastName = t("errorLastNameRequired");
    if (!companyName?.trim())
      newErrors.companyName = t("errorCompanyNameRequired");
    if (!companyWebsite?.trim())
      newErrors.companyWebsite = t("errorCompanyWebsiteRequired");

    if (!email?.trim()) {
      newErrors.email = t("errorEmailRequired");
    } else if (!emailRegex.test(email)) {
      newErrors.email = t("errorInvalidEmail");
    }

    if (!phone?.trim()) {
      newErrors.phone = t("errorPhoneRequired");
    } else if (!numberRegex.test(phone)) {
      newErrors.phone = t("errorPhoneInvalid");
    }

    if (!language?.trim()) newErrors.language = t("errorLanguageRequired");
    if (!serviceType?.trim())
      newErrors.serviceType = t("errorServiceTypeRequired");

    if (!unitsPerMonth?.trim()) {
      newErrors.unitsPerMonth = t("errorUnitsRequired");
    } else if (!numberRegex.test(unitsPerMonth)) {
      newErrors.unitsPerMonth = t("errorUnitsInvalid");
    }

    if (!shipmentsPerMonth?.trim()) {
      newErrors.shipmentsPerMonth = t("errorShipmentsRequired");
    } else if (!numberRegex.test(shipmentsPerMonth)) {
      newErrors.shipmentsPerMonth = t("errorShipmentsInvalid");
    }

    if (!message?.trim()) newErrors.message = t("errorMessageRequired");
    if (!state?.trim()) newErrors.state = t("errorStateRequired");
    if (!city?.trim()) newErrors.city = t("errorCityRequired");
    if (!heardFrom?.trim()) {
      newErrors.heardFrom = t("errorHeardFromRequired");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({ ...newErrors });
      return;
    }
    setErrors({});
    const toastId = toast.loading(t("formSending"), {
      icon: <Spinner size="sm" />,
      progressStyle: { background: "#19203C" },
    });

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://function-bun-production-ba48.up.railway.app/api/send-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

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
          state: "",
          city: "",
          heardFrom: "",
        });
        setSelectedState("");
        setCities([]);
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
    <section
      id="contact"
      className="w-full bg-primary py-16 px-4 flex justify-center"
    >
      <div className="bg-white rounded-2xl w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-20 py-12 shadow-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          {t("contactTitle")}
        </h2>
        <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto text-sm sm:text-base">
          {t("contactSubtitle")}
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* First Name */}
          <div className="flex flex-col gap-1">
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("formFirstName")}
              variant="bordered"
              color="primary"
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("formLastName")}
              variant="bordered"
              color="primary"
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1">
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={t("formCompany")}
              variant="bordered"
              color="primary"
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm">{errors.companyName}</p>
            )}
          </div>

          {/* Company Website */}
          <div className="flex flex-col gap-1">
            <Input
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder={t("formCompanyWebsite")}
              variant="bordered"
              color="primary"
              className={errors.companyWebsite ? "border-red-500" : ""}
            />
            {errors.companyWebsite && (
              <p className="text-red-500 text-sm">{errors.companyWebsite}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("formEmail")}
              variant="bordered"
              color="primary"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("formPhone")}
              variant="bordered"
              color="primary"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Language */}
          <div className="flex flex-col gap-1">
            <Select
              selectedKeys={[formData.language]}
              onSelectionChange={(keys) =>
                handleSelectChange("language", [...keys][0])
              }
              placeholder={t("formLanguage")}
              variant="bordered"
              color="primary"
              className={errors.language ? "border-red-500" : ""}
            >
              <SelectItem key="English">English</SelectItem>
              <SelectItem key="Spanish">Español</SelectItem>
            </Select>
            {errors.language && (
              <p className="text-red-500 text-sm">{errors.language}</p>
            )}
          </div>

          {/* Units per Month */}
          <div className="flex flex-col gap-1">
            <Input
              name="unitsPerMonth"
              value={formData.unitsPerMonth}
              onChange={handleChange}
              placeholder={t("formUnits")}
              variant="bordered"
              color="primary"
              className={errors.unitsPerMonth ? "border-red-500" : ""}
            />
            {errors.unitsPerMonth && (
              <p className="text-red-500 text-sm">{errors.unitsPerMonth}</p>
            )}
          </div>

          {/* Shipments per Month */}
          <div className="flex flex-col gap-1">
            <Input
              name="shipmentsPerMonth"
              value={formData.shipmentsPerMonth}
              onChange={handleChange}
              placeholder={t("formShipments")}
              variant="bordered"
              color="primary"
              className={errors.shipmentsPerMonth ? "border-red-500" : ""}
            />
            {errors.shipmentsPerMonth && (
              <p className="text-red-500 text-sm">{errors.shipmentsPerMonth}</p>
            )}
          </div>

          {/* Service Type */}
          <div className="flex flex-col gap-1">
            <Select
              selectedKeys={[formData.serviceType]}
              onSelectionChange={(keys) =>
                handleSelectChange("serviceType", [...keys][0])
              }
              placeholder={t("formServiceType")}
              variant="bordered"
              color="primary"
              className={errors.serviceType ? "border-red-500" : ""}
            >
              <SelectItem key="LTL">LTL</SelectItem>
              <SelectItem key="FBA Prep">FBA Prep</SelectItem>
              <SelectItem key="3PL">3PL</SelectItem>
            </Select>
            {errors.serviceType && (
              <p className="text-red-500 text-sm">{errors.serviceType}</p>
            )}
          </div>

          {/* State */}
          <div className="flex flex-col gap-1">
            <Autocomplete
              placeholder={t("formSelectState")}
              color="primary"
              variant="bordered"
              selectedKey={selectedState}
              onSelectionChange={handleStateChange}
              className={errors.state ? "border-red-500" : ""}
              listboxProps={{
                emptyContent: t("noResults"),
              }}
            >
              {states.map((state) => (
                <AutocompleteItem key={state} value={state}>
                  {state}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
            )}
          </div>

          {/* City */}
          <div className="flex flex-col gap-1">
            <Autocomplete
              placeholder={
                selectedState ? t("formSelectCity") : t("formSelectStateFirst")
              }
              className={`w-full ${errors.city ? "border-red-500" : ""}`}
              selectedKey={formData.city}
              onSelectionChange={handleCityChange}
              isDisabled={!selectedState}
              color="primary"
              variant="bordered"
              listboxProps={{
                emptyContent: t("noResults"),
              }}
            >
              {cities.map((city) => (
                <AutocompleteItem
                  key={city.toLowerCase()}
                  value={city.toLowerCase()}
                >
                  {city.toLowerCase()}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            {selectedState && errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>

          {/* Heard From */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <Select
              selectedKeys={[formData.heardFrom]}
              onSelectionChange={(keys) =>
                handleSelectChange("heardFrom", [...keys][0])
              }
              placeholder={t("formHeardFrom")}
              variant="bordered"
              color="primary"
              className={errors.heardFrom ? "border-red-500" : ""}
            >
              <SelectItem key="Instagram">Instagram</SelectItem>
              <SelectItem key="YouTube">YouTube</SelectItem>
              <SelectItem key="Friend">Referido por un amigo</SelectItem>
              <SelectItem key="MailMarketing">Mail marketing</SelectItem>
              <SelectItem key="Google">Google search</SelectItem>
            </Select>
            {errors.heardFrom && (
              <p className="text-red-500 text-sm">{errors.heardFrom}</p>
            )}
          </div>

          {/* Message */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t("formMessage")}
              variant="bordered"
              color="primary"
              minRows={4}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center mt-4">
            <Button
              radius="full"
              className="w-full sm:w-auto px-10 py-4 sm:py-5 text-base sm:text-lg md:text-xl bg-primary text-white font-semibold disabled:opacity-60"
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
