import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";

const router = express.Router();

router.post("/", protectRoute ,async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ msg: "Please provide all fields" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;


    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error saving book:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
