import { AppError, asyncHandler, send } from "../utils/http.js";

/* Small shared handlers for admin-only edits/deletes on operational records. */
export const updateOne = (Model, fields) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) throw new AppError("Record not found.", 404);

    fields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });
    await item.save();
    send(res, { item });
  });

export const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new AppError("Record not found.", 404);
    send(res, null, 200, "Record deleted.");
  });

export const createOne = (Model, fields) =>
  asyncHandler(async (req, res) => {
    const payload = Object.fromEntries(
      fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    const item = await Model.create(payload);
    send(res, { item }, 201);
  });
