import { useMemo } from "react";
import { usePathname, useParams } from "next/navigation";
import { useTaskStore } from "@/stores/taskStore";
import { Id } from "@/convex/_generated/dataModel";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const params = useParams();
  const { projects } = useTaskStore();

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [];

    // Always start with Home
    items.push({
      label: "Home",
      href: "/loggedin",
      isActive: pathname === "/loggedin",
    });

    // Split pathname and process each segment
    const segments = pathname.split("/").filter(Boolean);

    // Skip "loggedin" segment
    const routeSegments = segments.filter((seg) => seg !== "loggedin");

    routeSegments.forEach((segment, index) => {
      const isLast = index === routeSegments.length - 1;
      const href = `/loggedin/${routeSegments.slice(0, index + 1).join("/")}`;

      let label = segment;

      // Handle special routes
      switch (segment) {
        case "today":
          label = "Today";
          break;
        case "upcoming":
          label = "Upcoming";
          break;
        case "calendar":
          label = "Calendar";
          break;
        case "projects":
          label = "Projects";
          break;
        case "search":
          label = "Search";
          break;
        default:
          // Handle dynamic routes
          if (params?.projectId && segment === params.projectId) {
            // Find project name
            const project = projects.find(
              (p) => p._id === (segment as Id<"projects">)
            );
            label = project?.name || "Project";
          } else if (params?.searchQuery && segment === params.searchQuery) {
            // Search query
            label = decodeURIComponent(segment);
          } else {
            // Capitalize first letter for other segments
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
          break;
      }

      items.push({
        label,
        href,
        isActive: isLast,
      });
    });

    return items;
  }, [pathname, params, projects]);

  return breadcrumbs;
}
