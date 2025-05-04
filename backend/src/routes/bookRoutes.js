import express from "express";

const router = express.Router();


router.get("/", (req, res) => {
  res.json({ message: " " });
});


router.post("/", (req, res) => {
  res.json({ message: " " });
});

export default router;
