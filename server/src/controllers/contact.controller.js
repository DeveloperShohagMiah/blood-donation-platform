import { ContactMessage } from "../models/index.js";
import { AppError, asyncHandler, send } from "../utils/http.js";

export const postContactMessage = asyncHandler(async (req, res) => {
  const { fullName, email = "", phone = "", subject, message } = req.body;
  if (!fullName || !subject || !message)
    throw new AppError("Name, subject and message are required.", 400);

  const item = await ContactMessage.create({
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
  });

  send(res, { id: item._id }, 201, "Thanks! Your message has been sent.");
});
