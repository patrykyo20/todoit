"use client";
import { Menu, CheckSquare2, Hash, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetTrigger,
  Dialog,
  DialogTrigger,
} from "@/components/ui";
import { primaryNavItems } from "@/utils";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";
import { Doc } from "@/convex/_generated/dataModel";

import { UserProfile } from "./UserProfile";
import { SearchForm } from "./SearchForm";
import { AddProjectDialog } from "../Project/AddProjectDialog";
import AddLabelDialog from "../Label/AddLabelDialog";

interface MyListTitleType {
  [key: string]: string;
}

export function MobileNav({
  navTitle = "",
  navLink = "#",
}: {
  navTitle?: string;
  navLink?: string;
}) {
  const pathname = usePathname();
  const { projects: projectList } = useTaskStore();

  const LIST_OF_TITLE_IDS: MyListTitleType = {
    primary: "",
    projects: "My Projects",
  };

  const renderItems = (projectList: Array<Doc<"projects">>) => {
    return projectList.map(({ _id, name }, idx) => {
      return {
        ...(idx === 0 && { id: "projects" }),
        name,
        link: `/loggedin/projects/${_id.toString()}`,
        icon: <Hash className="w-4 h-4" />,
      };
    });
  };

  const navItems = useMemo(() => {
    if (projectList) {
      const projectItems = renderItems(projectList);
      return [...primaryNavItems, ...projectItems];
    }
    return primaryNavItems;
  }, [projectList]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <UserProfile />

            {navItems.map((item, idx) => {
              const { name, icon, link, id } = item;
              const _id = "_id" in item ? (item._id as string) : undefined;
              const uniqueKey: string = _id || link || id || `nav-item-${idx}`;
              return (
                <div key={uniqueKey}>
                  {id && (
                    <div
                      className={cn(
                        "flex items-center mt-6 mb-2",
                        id === "filters" && "my-0"
                      )}
                    >
                      <p className="flex flex-1 text-base">
                        {LIST_OF_TITLE_IDS[id]}
                      </p>
                      {LIST_OF_TITLE_IDS[id] === "My Projects" && (
                        <AddProjectDialog />
                      )}
                    </div>
                  )}
                  <div className={cn("flex items-center w-full")}>
                    <div
                      className={cn(
                        "flex items-center text-left gap-3 rounded-lg py-2 transition-all px-2 hover:text-primary justify-between w-full",
                        pathname === link
                          ? "active rounded-lg bg-primary/10 text-primary transition-all hover:text-primary"
                          : "text-foreground "
                      )}
                    >
                      <Link
                        href={link}
                        className={cn(
                          "flex items-center text-left gap-3 rounded-lg transition-all hover:text-primary hover:bg-muted/50 w-full cursor-pointer px-2 py-1.5 -mx-2 -my-1.5"
                        )}
                      >
                        <div className="flex gap-4 items-center w-full">
                          <div className="flex gap-2 items-center">
                            <p className="flex text-base text-left">
                              {icon || <Hash />}
                            </p>
                            <p>{name}</p>
                          </div>
                        </div>
                      </Link>
                      {id === "filters" && (
                        <Dialog>
                          <DialogTrigger
                            id="closeDialog"
                            className="cursor-pointer hover:bg-primary/10 rounded-md p-1 transition-colors"
                          >
                            <PlusIcon
                              className="h-5 w-5 hover:text-primary transition-colors"
                              aria-label="Add a Label"
                            />
                          </DialogTrigger>
                          <AddLabelDialog />
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="mt-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  className="w-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex items-center md:justify-between w-full gap-1 md:gap-2 py-2">
        <div className="lg:flex-1">
          <Link
            href={navLink}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            <p className="text-sm font-semibold text-foreground/70 w-24">
              {navTitle}
            </p>
          </Link>
        </div>
        <div className="place-content-center w-full flex-1">
          <SearchForm />
        </div>
        <div className="place-content-center w-12 h-12 lg:w-16 lg:h-20 flex items-center justify-center">
          {/* TODO: Add logo here */}
          <CheckSquare2 className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
        </div>
      </div>
    </header>
  );
}
