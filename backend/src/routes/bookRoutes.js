import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
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
      user: req.user._id
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error saving book:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/" , protectRoute , async(req , res)=>{
  try {  

    const page = req.query.page || 1
    const limit = req.query.limit || 5
    const skip = (page - 1) * limit;

    const books = await Book.find()
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
    .populate("user" , "username profileImage ")

    const totalBooks = await Book.countDocuments()
    res.send(
      books,
      currentPage , 
      totalBooks
    );



  }catch(error){
    console.log("Error in get all books")
    res.status(500).json({msg : "internal server error "})

  }
})
export default router;
