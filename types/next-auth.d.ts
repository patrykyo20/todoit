import "next-auth";

declare module "next-auth" {
  interface Session {
    convexToken?: string | null;
  }
}
