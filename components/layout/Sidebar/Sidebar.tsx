"use client";
import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { primaryNavItems } from "@/utils";
import { UserProfile } from "./UserProfile";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { Hash, PlusIcon } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Dialog, DialogTrigger } from "@/components/ui";
import { AddProjectDialog } from "../Project/AddProjectDialog";

interface MyListTitleType {
  [key: string]: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { projects: projectList } = useTaskStore();

  const LIST_OF_TITLE_IDS: MyListTitleType = {
    primary: "",
    projects: "My Projects",
  };

  const renderItems = (projectList: Array<Doc<"projects">>) => {
    if (!projectList || projectList.length === 0) {
      return [
        {
          id: "projects",
          name: "",
          link: "#",
          icon: <Hash className="w-4 h-4" />,
        },
      ];
    }
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
    const projectItems = renderItems(projectList || []);
    return [...primaryNavItems, ...projectItems];
  }, [projectList]);

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex justify-between h-14 items-center border-b p-1 lg:h-[60px] lg:px-2">
          <UserProfile />
        </div>
        <nav className="grid items-start px-1 text-sm font-medium lg:px-4">
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
                <div className={cn("flex items-center lg:w-full")}>
                  <div
                    className={cn(
                      "flex items-center text-left lg:gap-3 rounded-lg py-2 transition-all hover:text-primary justify-between w-full",
                      pathname === link
                        ? "active rounded-lg bg-primary/10 text-primary transition-all px-2 hover:text-primary"
                        : "text-foreground "
                    )}
                  >
                    {name && link !== "#" ? (
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
                    ) : null}
                    {/* TODO: Add AddLabelDialog component */}
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
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Card x-chunk="dashboard-02-chunk-0">
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock all features and get unlimited access to our support team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
