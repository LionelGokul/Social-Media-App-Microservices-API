import { RequestHandler } from "express";
import Search from "../models/search-model";

export const searchContent: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      res
        .status(400)
        .json({ error: "Query parameter is required and must be a string." });
      return; // stop further execution
    }

    const searchResults = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: -1 })
      .limit(10);

    res.status(200).json({ searchResults });
    // no `return res`, just end here
  } catch (err) {
    next(err);
  }
};
