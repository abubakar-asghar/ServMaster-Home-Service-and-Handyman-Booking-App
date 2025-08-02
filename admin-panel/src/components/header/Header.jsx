"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { Separator } from "../../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";
// import { useTheme } from "../../components/theme-provider";
// import { Button } from "../../components/ui/button";
// import { Laptop, Moon, Sun } from "lucide-react";
import { useSelector } from "react-redux";
import { Skeleton } from "../../components/ui/skeleton";
import { NavUser } from "../../components/header/NavUser";
// import UserSettingsModal from "../../components/settings/user/UserSettingsModal";

// function ModeToggle() {
//   const { setTheme, theme } = useTheme();

//   return (
//     <Button
//       variant="outline"
//       size="icon"
//       className="w-16 hidden sm:flex dark:text-white dark:bg-dark-component-bg dark:border-dark-border-bg dark:hover:bg-dark-component-bg/80"
//       onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//     >
//       <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//       <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//       <span className="sr-only">Toggle theme</span>
//     </Button>
//   );
// }

// Optional static mapping
const routeLabels = {
  "/": "Home",
};

const Header = () => {
  // const { companies } = useSelector((state) => state.company);
  const [showModal, setShowModal] = useState(false);

  const pathname = usePathname();
  const pathnames = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathnames.reduce(
    (acc, curr, index) => {
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const name =
        routeLabels[path] ||
        curr.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      return [...acc, { path, name }];
    },
    [{ path: "/", name: "Home" }]
  );

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      profile_pic: "https://github.com/shadcn.png",
    },
  };

  // if (companies?.length === 0) {
  //   return (
  //     <header className="flex w-full justify-between sticky top-0 h-16 items-center px-5 border-b dark:border-dark-border-bg border-grid z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-dark-bg">
  //       <div className="flex items-center gap-2">
  //         <Skeleton className="w-8 h-8 rounded-md" />
  //         <Skeleton className="h-6 w-32" />
  //       </div>
  //       <div className="flex gap-2 items-center">
  //         <Skeleton className="h-10 w-48 hidden lg:block" />
  //         <Skeleton className="h-10 w-10 rounded-full hidden md:block" />
  //         <Skeleton className="h-10 w-10 rounded-full hidden md:block" />
  //         <Skeleton className="h-10 w-10 rounded-full" />
  //       </div>
  //     </header>
  //   );
  // }

  return (
    <header className="flex w-full justify-between sticky top-0 h-16 shrink-0 items-center gap-2 border-b dark:border-dark-border-bg px-5 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 dark:text-white dark:hover:bg-dark-border-bg" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <Fragment key={crumb.path}>
                  <BreadcrumbItem>
                    {!isLast ? (
                      <span aria-current="page">
                        <span>{crumb.name}</span>
                      </span>
                    ) : (
                      <span aria-current="page">
                        <span>{crumb.name}</span>
                      </span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex gap-2 items-center">
        {/* <SearchBar /> */}
        {/* <NotifactionsButton /> */}
        {/* <ModeToggle /> */}
        <NavUser
          user={data.user}
          onClose={setShowModal}
          open={showModal}
          className="w-fit"
        />
        {/* <UserSettingsModal open={showModal} setOpen={setShowModal} /> */}
      </div>
    </header>
  );
};

export default Header;
