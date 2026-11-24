import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 1000 },
    type: {
      type: String,
      enum: ["account", "request", "assignment", "donation", "campaign", "system"],
      default: "system",
    },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
  },
  opts,
);

const dispatchPush = async (notifications) => {
    try {
        const { sendPushToUser } = await import("../services/push.service.js");
        await Promise.all(
            notifications.map((item) => sendPushToUser(item.recipient, item))
        );
    } catch {
        // Push is best-effort; a failed delivery must never break the request.
    }
};

notificationSchema.post("save", function (doc) {
    void dispatchPush([doc]);
});

notificationSchema.post("insertMany", function (docs) {
    if (docs?.length) void dispatchPush(docs);
});

const Notification = model("Notification", notificationSchema);
export { Notification };
export default Notification;
