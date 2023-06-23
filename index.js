const express = require("express");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjg3NDg4MTEwLCJleHAiOjE2ODc0OTE3MTB9.TiLCAAlKfX7SMPhefC6m2nouf6g6fnoizwUEGhfZ-lo'; 

const connectToDb = () => {
  const client = new MongoClient("mongodb://127.0.0.1:27017");

  client.connect((error) => {
    if (error) {
      console.error("Error connecting to MongoDB:", error);
      return;
    }

    const database = client.db("foods");
    const inventories = database.collection("inventories");
    const users = database.collection("users");
    const orders = database.collection("orders");

    const authenticateUser = (req, res, next) => {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({ error: "Authorization token not found" });
        return;
      }

      jwt.verify(token, secretKey, (error, decoded) => {
        if (error) {
          res.status(401).json({ error: "Invalid token" });
          return;
        }

        req.user = decoded;
        next();
      });
    };

    // API endpoint to get all products in inventory
    app.get("/products", authenticateUser, (req, res) => {
      inventories
        .find({})
        .toArray()
        .then((products) => {
          res.json(products);
        })
        .catch((error) => {
          console.error("Error retrieving products:", error);
          res.status(500).json({ error: "Failed to retrieve products" });
        });
    });

    // API endpoint to get products with low quantity (less than 100)
    app.get("/products/low-quantity", authenticateUser, (req, res) => {
      const query = { instock: { $lt: 100 } };

      inventories
        .find(query)
        .toArray()
        .then((products) => {
          res.json(products);
        })
        .catch((error) => {
          console.error("Error retrieving products with low quantity:", error);
          res.status(500).json({ error: "Failed to retrieve products with low quantity" });
        });
    });

    // Login API endpoint
    app.post("/login", (req, res) => {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      users.findOne({ username, password }, (error, user) => {
        if (error) {
          console.error("Error retrieving user:", error);
          res.status(500).json({ error: "Failed to retrieve user" });
          return;
        }

        if (!user) {
          res.status(401).json({ error: "Invalid username or password" });
          return;
        }

        const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
        res.json({ token });
      });
    });

    // API endpoint to get orders with product descriptions
    app.get("/orders", authenticateUser, (req, res) => {
      orders
        .aggregate([
          {
            $lookup: {
              from: "inventories",
              localField: "productId",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray()
        .then((orders) => {
          res.json(orders);
        })
        .catch((error) => {
          console.error("Error retrieving orders:", error);
          res.status(500).json({ error: "Failed to retrieve orders" });
        });
    });

    console.log("Connected to MongoDB");
  });
};

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDb();
});
