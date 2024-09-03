const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mongoose = require("mongoose");
const path = require("path");
const cloudinary = require("cloudinary").v2;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://tahmidAlam:tahmid824643@yummi-restaurant.ibsmy.mongodb.net/yummi-restaurant"
  )
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("Connection Problem");
    console.log(err);
    process.exit(1);
  });

//
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Yummi-Restaurant", // Folder in Cloudinary where you want to store images
    format: async (req, file) => "jpeg", // Format the images (optional)
    public_id: (req, file) => file.originalname.split(".")[0], // The image's public ID (optional)
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads"));

// Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true }, // Array of image URLs
});

const cartSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: Array,
});
const orderSchema = new mongoose.Schema({
  order: Object,
});
const productModel = new mongoose.model("Products", productSchema);
const cartModel = new mongoose.model("carts", cartSchema);
const orderModel = new mongoose.model("orders", orderSchema);
// Schema
app.post("/cart", async (req, res) => {
  const newCartdData = await cartModel({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
  });
  const cartData = await newCartdData.save();
  res.json(cartData);
});
app.get("/cart", async (req, res) => {
  const cartData = await cartModel.find();
  res.send(cartData);
});
app.delete("/cart", async (req, res) => {
  const newCart = await cartModel.findOneAndDelete(
    { name: req.body.name },
    { new: true }
  );
  res.send(newCart);
});
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/product", upload.array("files", 2), async (req, res) => {
  try {
    // Collect the uploaded file URLs
    const fileUrls = req.files.map((file) => file.path);

    // Create a new product with the form data and uploaded file URLs
    const newProduct = new productModel({
      name: req.body.name,
      price: req.body.price,
      images: fileUrls, // Changed 'image' to 'images' for clarity
    });

    const savedProduct = await newProduct.save();

    console.log(fileUrls);
    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while saving the product");
  }
});

app.post("/orders", async (req, res) => {
  const newOrder = await new orderModel({
    order: req.body,
  });
  const saveOrder = await newOrder.save();
  res.json(saveOrder);
  console.log(req.body);
});
app.get("/orders", async (req, res) => {
  const orders = await orderModel.find();
  res.send(orders);
});
app.get("/product", async (req, res) => {
  const products = await productModel.find();
  res.send(products);
});
app.listen("3000", () => {
  console.log(`http://localhost:3000`);
});
