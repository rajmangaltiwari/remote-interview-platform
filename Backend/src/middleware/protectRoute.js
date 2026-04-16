import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId)
        return res.status(401).json({ msg: "Unauthorized - invalid token" });

      let user = await User.findOne({ clerkId });

      // If user doesn't exist in MongoDB, create them from Clerk data
      // This handles cases where the Inngest webhook didn't fire or failed
      if (!user) {
        console.log("[protectRoute] User not found in DB, syncing from Clerk:", clerkId);
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          user = await User.create({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
            profileImage: clerkUser.imageUrl || "",
          });

          // Also sync to Stream
          await upsertStreamUser({
            id: user.clerkId,
            name: user.name,
            image: user.profileImage,
          });

          console.log("[protectRoute] User synced successfully:", user._id);
        } catch (syncError) {
          console.error("[protectRoute] Failed to sync user from Clerk:", syncError);
          return res.status(404).json({ msg: "user not found and sync failed" });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
];
