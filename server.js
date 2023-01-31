import express from "express";
import multer from "multer";
import fs from "fs";
import * as s3 from "./s3.js";
import crypto from "crypto";
import sharp from "sharp";
import * as db from "./database.js";
// import { get } from "http";

const app = express();

// Store the image in memory instead of on the disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static("build"));

// Generate random name for the image file name
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// images GET
app.get("/api/images", async (req, res) => {
  const result = await db.getImages();

  for (const image of result) {
    image.imageURL = await s3.signedUrl(image.imagePath);
  }
  res.send(result);
});

// add POST
app.post("/api/images", upload.single("image"), async (req, res) => {
  console.log("✨ Form data received from Frontend");

  const detail = req.body.text;
  const fileBuffer = await sharp(req.file.buffer)
    .resize({ height: 800, width: 800, fit: "fill" })
    .toBuffer();
  const imagePath = generateFileName();
  const mimetype = req.file.mimetype;

  // Store the image in s3
  const s3Result = await s3.uploadImage(imagePath, fileBuffer, mimetype);

  // Database
  const result = await db.addImage(imagePath, detail);
  result.imageURL = await s3.signedUrl(result.imagePath);

  res.status(201).send(result);
});

// delete POST
app.post("/api/images/delete/:id", async (req, res) => {
  const id = req.params.id;
  const image = await db.getImage(id);
  await s3.deleteImage(image.imagePath);
  const result = await db.deleteImage(id);
  res.send(result);
});

// Image route
// app.get("/api/images/:imageName", (req, res) => {
//   const imageName = req.params.imageName;
//   const readStream = fs.createReadStream(`images/${imageName}`);
//   readStream.pipe(res);
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Listening server port ${PORT}`);
});
