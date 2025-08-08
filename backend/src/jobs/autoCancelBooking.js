import cron from "node-cron";
import ServiceRequest from "../models/serviceRequest.model.js";
import Chat from "../models/chat.model.js";

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  const jobStart = Date.now();
  console.log(`⏰ Starting auto-cancel job at ${new Date().toISOString()}`);

  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    console.log(
      `Checking for bookings scheduled before ${cutoff.toISOString()}`
    );

    // Find bookings that were accepted and scheduled more than 24h ago
    const expiredBookings = await ServiceRequest.find({
      status: "accepted",
      scheduled_time: { $lt: cutoff },
    }).lean();

    console.log(`Found ${expiredBookings.length} expired bookings to process`);

    // Process each booking
    for (const request of expiredBookings) {
      try {
        console.log(`Processing booking ${request._id}`);

        // Update the request
        await ServiceRequest.updateOne(
          { _id: request._id },
          {
            $set: {
              status: "cancelled",
              cancellation: {
                cancelled_by: "System",
                reason: "Service was not started in time.",
                reason_type: "schedule_conflict",
                cancelled_at: new Date(),
              },
            },
          }
        );

        // Find and update related chat
        const chat = await Chat.findOne({
          participants: {
            $all: [
              {
                $elemMatch: {
                  user: request.customer,
                  participantType: "Customer",
                },
              },
              {
                $elemMatch: {
                  user: request.service_provider,
                  participantType: "ServiceProvider",
                },
              },
            ],
          },
          activeServiceRequest: request._id,
        });

        if (chat) {
          const hasOtherAccepted = await ServiceRequest.exists({
            service_provider: request.service_provider,
            customer: request.customer,
            status: "accepted",
            _id: { $ne: request._id }, // Exclude current request
          });

          if (!hasOtherAccepted) {
            await Chat.updateOne(
              { _id: chat._id },
              {
                $set: { isActive: false, activeServiceRequest: null },
                $push: {
                  messages: {
                    sender: "System",
                    message:
                      "This booking was automatically cancelled because the service was not started in time.",
                    sentAt: new Date(),
                    system: true,
                  },
                },
              }
            );
          }
        }
      } catch (error) {
        console.error(`Error processing booking ${request._id}:`, error);
      }
    }

    console.log(`✅ Auto-cancel job completed in ${Date.now() - jobStart}ms`);
  } catch (error) {
    console.error("❌ Auto-cancel job failed:", error);
  }
});
