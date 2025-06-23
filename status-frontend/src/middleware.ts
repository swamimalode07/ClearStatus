import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  // Specify the public routes here
  matcher: ["/((?!_next|.*\\..*).*)"],
  // Correct place to define public routes
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
};
