// Require Express, MongoDB, Cors, Dotenv and Declaring Port
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
// Creating Server App
const app = express();
const port = process.env.PORT || 5000;
// Middle Ware
app.use(cors());
app.use(express.json());

// Database Credentials
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w9ewo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Async Function for Data Management
async function run() {
    try {
        await client.connect();

        const database = client.db("touristWebsitedata");
        const packagesCollection = database.collection("packages");
        const ordersCollection = database.collection("orders");
        console.log('DB CONNECTED');

        // Get API For ALL Packaged Json Array Value to Server
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollection.find({});
            const packageData = await cursor.toArray();
            res.send(packageData);
        });

        // Get API for single package data on server to client side
        app.get("/packages/:packageID", async (req, res) => {
            const id = req.params.packageID;
            const query = { _id: ObjectId(id) };
            const package = await packagesCollection.findOne(query);
            res.json(package);
        });

        // POST API for orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('body', order);
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        // Get API For ALL Orders Json Array Value to Server
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orderData = await cursor.toArray();
            res.send(orderData);
        });

        // GET api for getting orders by USERID
        app.get('/orders/:uid', async (req, res) => {
            const USERID = req.params.uid;
            console.log(USERID)
            const query = { userID: USERID };
            const eachUserOrderData = await ordersCollection.find(query).toArray();
            console.log(eachUserOrderData)
            res.json(eachUserOrderData);
        });

        // DLETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // PUT API FOR UPDATE
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const updatedOrder = req.body;
            console.log(updatedOrder)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: 'Approved',
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);

            console.log('Update Hitted ', id);
            res.json(result);

        })

        // POST API For New Package
        app.post('/packages', async (req, res) => {
            const newPackage = req.body;
            const result = await packagesCollection.insertOne(newPackage);
            console.log('Got New Package', req.body);
            res.json(result);
        })


    } finally {
        // await client.close();
    }

}
run().catch(console.dir);
// Default Root
app.get('/', (req, res) => {
    res.send('Hello From Elite Tourism!')
})

app.listen(port, () => {
    console.log(`Listening to PORT - ${port}`)
})