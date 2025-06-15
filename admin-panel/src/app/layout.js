import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";

export const metadata = {
  title: "ServMaster",
  description: "Reliable Home Services & Handyman Booking Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <main>{children}</main>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
