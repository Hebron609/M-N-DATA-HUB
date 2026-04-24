import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const configuredAdminEmail = (
    process.env.ADMIN_EMAIL || "admin@mndata.com"
  ).toLowerCase();

  const email = session?.user?.email?.toLowerCase();
  const role = (session?.user as any)?.role;

  if (
    !session ||
    !email ||
    role !== "ADMIN" ||
    email !== configuredAdminEmail
  ) {
    return null;
  }

  return session;
}
