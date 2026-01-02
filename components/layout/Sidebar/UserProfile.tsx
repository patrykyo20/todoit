"use client";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

export function UserProfile() {
  const session = useSession();

  const imageUrl = session?.data?.user?.image;
  const name = session?.data?.user?.name;
  const email = session?.data?.user?.email;

  const handleSignOut = async () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    
    // Clear sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    // Sign out from NextAuth (this will clear cookies)
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button
          variant={"secondary"}
          className="flex items-center justify-start gap-1 lg:gap-2 m-0 p-0 lg:px-3 lg:w-full bg-white max-w-full overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              width={24}
              height={24}
              alt={`${name} profile picture`}
              className="rounded-full shrink-0"
            />
          )}
          <p className="truncate min-w-0 max-w-full">{email}</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem 
          asChild
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
        >
            <Button
              variant={"ghost"}
            className="w-full justify-start hover:text-primary hover:bg-muted/50 cursor-pointer transition-colors"
            >
              Sign out
            </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
