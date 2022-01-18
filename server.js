import express from "express";
import multer from "multer";
import fs from "fs";
import { addImage, getImages, getImage, deleteImage } from "./database.js";

const app = express();
const upload = multer({ dest: "images/" });

app.use(express.static("build"));

// JSON
app.get("/api/images", async (req, res) => {
  const result = await getImages();
  res.send(result);
});

// add POST
app.post("/api/images", upload.single("image"), async (req, res) => {
  console.log("✨ Form data received from Frontend");
  const imagePath = "api/images/" + req.file.filename;
  const detail = req.body.text;
  const result = await addImage(imagePath, detail);
  res.send(result);
});

// delete POST
app.post("/api/images/delete/:id", async (req, res) => {
  const id = req.params.id;
  const result = await deleteImage(id);
  res.send(result);
});

// Display images that saved in the post method
app.get("/api/images/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const readStream = fs.createReadStream(`images/${imageName}`);
  readStream.pipe(res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Listening server port ${PORT}`);
});
