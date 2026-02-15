import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Item from "../models/Item.js";

// add item
export const createItem = async (req, res) => {
  try {
    const { userId } = req.auth();
    const images = Array.isArray(req.files) ? req.files : [];

    let {
      title,
      category,
      color = "",
      brand = "",
      season = "",
      tags = [],
      link = "",
      // embedding_id 先不让前端传，避免误用；如果你想允许也可以放开
    } = req.body;

    // basic validation
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "title and category are required",
      });
    }

    // tags: allow ["a","b"] or "a,b"
    if (typeof tags === "string") {
      tags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (!Array.isArray(tags)) {
      tags = [];
    } else {
      tags = tags.map((t) => String(t).trim()).filter(Boolean);
    }

    let image_urls = []
    
    if (images.length) {
      const uploadedUrls = await Promise.all(
        images.map(async (img) => {
          const response = await imagekit.files.upload({
            file: fs.createReadStream(img.path),
            fileName: img.originalname,
            folder: "items",
          });

          const url = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [{ width: 1280, quality: 80, format: "webp" }],
          });

          return url;
        })
      );

      image_urls = [...image_urls, ...uploadedUrls];
    }

    const item = await Item.create({
      owner_user_id: userId,
      title,
      category,
      color,
      brand,
      season,
      tags,
      link,
      image_urls,
      // embedding_id: "" // model default 会自动给
    });

    res.json({ success: true, item });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get items
export const getMyItems = async (req, res) => {
  try {
    const { userId } = req.auth();

    const items = await Item.find({ owner_user_id: userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};