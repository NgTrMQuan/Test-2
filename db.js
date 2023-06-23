const { MongoClient } = require("mongodb");

const db = {};

const connectToDb = () => {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  client.connect((error) => {
    if (error) {
      console.error("Error connecting to MongoDB:", error);
      return;
    }

    const database = client.db("foods");
    db.inventories = database.collection("inventories");
    db.orders = database.collection("orders");
    db.users = database.collection("users");

    const inventoriesData = [
      { "_id": 1, "sku": "almonds", "description": "product 1", "instock": 120 },
      { "_id": 2, "sku": "bread", "description": "product 2", "instock": 80 },
      { "_id": 3, "sku": "cashews", "description": "product 3", "instock": 60 },
      { "_id": 4, "sku": "pecans", "description": "product 4", "instock": 70 }
    ];

    const ordersData = [
      { "_id": 1, "item": "almonds", "price": 12, "quantity": 2 },
      { "_id": 2, "item": "pecans", "price": 20, "quantity": 1 },
      { "_id": 3, "item": "pecans", "price": 20, "quantity": 3 }
    ];

    const usersData = [
      { "username": "admin", "password": "MindX@2022" },
      { "username": "alice", "password": "MindX@2022" }
    ];

    db.inventories
      .insertMany(inventoriesData)
      .then(() => {
        console.log("Inventories imported successfully.");
        client.close(); 
      })
      .catch((error) => {
        console.error("Error importing inventories:", error);
        client.close(); 
      });

    db.orders
      .insertMany(ordersData)
      .then(() => {
        console.log("Orders imported successfully.");
        client.close(); 
      })
      .catch((error) => {
        console.error("Error importing orders:", error);
        client.close(); 
      });

    db.users
      .insertMany(usersData)
      .then(() => {
        console.log("Users imported successfully.");
        client.close(); 
      })
      .catch((error) => {
        console.error("Error importing users:", error);
        client.close(); 
      });
  });
};

module.exports = { connectToDb, db };
