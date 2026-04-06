import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();

    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? null;
    const name =
      clerkUser
        ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null
        : null;

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { email, name },
      create: { id: userId, email, name },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST /api/user error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
