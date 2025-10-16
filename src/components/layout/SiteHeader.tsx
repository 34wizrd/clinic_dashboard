import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import authreeIcon from "@/assets/authree_logo.png"; // Usi

const routes = [
  { path: "/dashboard", breadcrumb: "Dashboard" },
  { path: "/appointments", breadcrumb: "Appointments" },
  { path: "/patients", breadcrumb: "Patients" },
  { path: "/facility-management", breadcrumb: "Facility Management" },
  { path: "/prescriptions", breadcrumb: "Prescriptions" },
  { path: "/health-records", breadcrumb: "Health Records" },
];

export function SiteHeader() {
  const breadcrumbs = useBreadcrumbs(routes, { excludePaths: ["/"] });
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <nav className="flex items-center text-sm font-medium text-muted-foreground">
          {breadcrumbs.map(({ match, breadcrumb }, index, arr) => (
            <span key={match.pathname} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {index < arr.length - 1 ? (
                <Link to={match.pathname} className="hover:text-foreground">
                  {breadcrumb}
                </Link>
              ) : (
                <span className="text-foreground">{breadcrumb}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {/* Make the parent <p> a flex container to align everything */}
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              <img
                src={authreeIcon}
                alt="Authree Logo"
                className="h-5 w-5"
                width={32}
                height={32}
              />
              Authree
            </a>
          </p>
        </div>
      </div>
    </header>
  );
}
