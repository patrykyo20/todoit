"use client";

import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Doc } from "@/convex/_generated/dataModel";
import { Hash } from "lucide-react";
import Link from "next/link";
import { useTaskStore } from "@/stores/taskStore";

export default function Projects() {
  const { projects, isLoading } = useTaskStore();

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col gap-1 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 border-b-2 p-2 border-gray-100"
            >
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Projects</h1>
      </div>
      <div className="flex flex-col gap-1 py-4">
        {projects?.map((project: Doc<"projects">) => {
          return (
            <Link key={project._id} href={`/loggedin/projects/${project._id}`}>
              <div className="flex items-center space-x-2 border-b-2 p-2 border-gray-100">
                <Hash className="text-primary w-5" />
                <Label
                  htmlFor="projects"
                  className="text-base font-normal hover:cursor-pointer"
                >
                  {project.name}
                </Label>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
