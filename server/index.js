const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const cors = require('cors');
const dotenv = require("dotenv");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require('morgan')
const path = require("path");
const { register } = require("./controllers/auth");
const {createPost} = require("./controllers/posts");
const { verifyToken } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
dotenv.config();

const __dirname1 = path.resolve();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "production") {
  
  app.use(express.static(path.join(__dirname1, "./client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "./client/build", "index.html"))
  );
} else {
  app.use("/assets", express.static(path.join(__dirname1, "public/assets")));
}

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 10000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));



