import { useT } from "../i18n";
import { PageHeader } from "../components/ui";
import CompanyProfileForm from "../components/CompanyProfileForm";

const Profile = () => {
  const { t } = useT();
  return (
    <div>
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <CompanyProfileForm />
    </div>
  );
};

export default Profile;
