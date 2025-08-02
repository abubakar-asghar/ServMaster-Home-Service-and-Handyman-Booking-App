import "./globals.css";
import { Inter } from "next/font/google";
import Provider from "../components/Provider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "ServMaster",
  description: "Reliable Home Services & Handyman Booking Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </Provider>
      </body>
    </html>
  );
}
