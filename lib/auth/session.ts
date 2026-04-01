import { auth } from "@/auth";

export async function getRequiredUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}
