import express from "express";
import multer from "multer";
import fs from "fs";
import { addImage, getImages, getImage } from "./database.js";

const app = express();

app.use(express.json()); // for json api
app.use(express.urlencoded({ extended: true })); // body parser 같은거
// app.use(express.static("build")); // 이거 있으면 위에 두개 필요 없음

// app.use(express.static("images")) 이렇게도 쓸 수 있음, 안전한 방법은 아님

// image upload를 위해선 multer가 필요함
const upload = multer({ dest: "images/" });
app.use(express.static("build"));

// midleware function parses the image
app.get("/api/images", async (req, res) => {
  const result = await getImages();
  res.send(result);
  // get all images, work after addImages
});

app.post("/api/images", upload.single("image"), async (req, res) => {
  //console.log(req.file); // any files go here, multer가 얘네 parsing 할거임

  const description = req.body.description;
  const filePath = req.file.filename;
  console.log(req.file);
  const result = await addImage(filePath, description);
  // console.log(description, filePath);
  res.send(result);
});
// BLOB?? image

app.get("/api/images/:imageName", (req, res) => {
  // you can have complete controls with this

  // store date in db
  // deploy the img to the cloud service

  const imageName = req.params.imageName;

  const readStream = fs.createReadStream(`images/${imageName}`);
  //readStream.pipe(res); // send the image to the client
  readStream.pipe(res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Listening server port ${PORT}`);
});
