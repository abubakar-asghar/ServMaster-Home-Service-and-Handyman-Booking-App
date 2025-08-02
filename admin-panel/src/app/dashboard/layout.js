import ClientWrapper from "../../components/ClientWrapper";

export const metadata = {
  title: "Admin Panel - ServMaster",
  description: "Admin dashboard for ServMaster",
};

export default function AdminLayout({ children }) {
  return (
      <ClientWrapper>{children}</ClientWrapper>
  );
}
