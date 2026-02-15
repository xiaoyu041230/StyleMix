import express from "express";
import { createItem, getMyItems } from "../controllers/itemController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const itemRouter = express.Router();

itemRouter.post("/", protect, upload.array("images", 5), createItem);
itemRouter.get("/mine", protect, getMyItems);

export default itemRouter;
