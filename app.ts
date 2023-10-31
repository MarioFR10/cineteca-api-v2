import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 8080;

const uri =
  "mongodb+srv://Sebas1498:1234@cineteca.fqyv7wo.mongodb.net/?retryWrites=true&w=majority";
const database = "cinetecadb";

app.get("/", (request, response) => {
  response.send("Server running");
});

// Users
app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db(database);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });

    if (!user) {
      response.status(404).send({
        status: 404,
        isRegistered: false,
      });

      return;
    }

    if (user.password == password) {
      response.status(200).send({
        status: 200,
        isRegistered: true,
      });
    } else {
      response.status(404).send({
        status: 404,
        isRegistered: false,
      });
    }
  } catch (error) {
    response.status(500).send("error");
    console.error(error);
  } finally {
    await client.close();
  }
});

app.post("/register", async (request, response) => {
  const { username, password } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db(database);
    const usersCollection = db.collection("users");
    await usersCollection.insertOne({ username, password });

    response.status(200).send({
      status: 200,
      message: "User registered successfully",
    });
  } catch (error) {
    response.status(500).send({ status: 500, message: "error" });
    console.log(error);
  } finally {
    await client.close();
  }
});

app.put("/edit-user", async (request, response) => {
  const { user, password } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(database);
    const usersCollection = db.collection("users");
    const filter = { username: user };
    const updateDocument = {
      $set: {
        password: password,
      },
    };

    await usersCollection.updateOne(filter, updateDocument);
    response.status(200).send({
      status: 200,
      isModified: true,
    });
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

// Images
app.get("/get-all-images", async (request, response) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(database);
    const imagesCollection = db.collection("images");
    const images = await imagesCollection.find().toArray();

    response.status(200).json(images);
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.post("/upload-image", async (request, response) => {
  const { uuid, title, author, base64Image } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db(database);
    const imagesCollection = db.collection("images");
    await imagesCollection.insertOne({ uuid, title, author, base64Image });

    response.status(200).send({
      status: 200,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.post("/delete-image", async (request, response) => {
  const { uuid } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(database);
    const imagesCollection = db.collection("images");
    await imagesCollection.findOneAndDelete({ uuid });

    response.status(200).send({
      status: 200,
      message: "Image deleted successfully",
    });
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

// Videos

// Material

// Forums
app.get("/get-all-forums", async (request, response) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(database);
    const forumCollection = db.collection("forums");
    const forums = await forumCollection.find().toArray();

    response.status(200).json(forums);
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.post("/get-forum", async (request, response) => {
  const { uuid } = request.body;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(database);
    const forumCollection = db.collection("forums");
    const forum = await forumCollection.findOne({ uuid });

    response.status(200).json(forum);
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.post("/add-forum-answer", async (request, response) => {
  const { uuid, answer } = request.body;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(database);
    const forumCollection = db.collection("forums");
    const updatedForum = await forumCollection.findOneAndUpdate(
      { uuid },
      { $push: { responses: answer } }
    );

    response.status(200).json(updatedForum);
  } catch (error) {
    response.status(500).send("error");
    console.log(error);
  } finally {
    await client.close();
  }
});

app.post("/upload-forum", async (request, response) => {
  const { uuid, title, author, description, responses } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db(database);
    const forumCollection = db.collection("forums");
    await forumCollection.insertOne({
      uuid,
      title,
      author,
      description,
      responses,
    });

    response.status(200).send({
      status: 200,
      message: "Forum uploaded successfully",
    });
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.post("/delete-forum", async (request, response) => {
  const { uuid } = request.body;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(database);
    const forumCollection = db.collection("forums");
    await forumCollection.findOneAndDelete({ uuid });

    response.status(200).send({
      status: 200,
      message: "Forum deleted successfully",
    });
  } catch (error) {
    response.status(500).send("error");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
