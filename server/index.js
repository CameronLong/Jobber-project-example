// Making sure that we have all the packages set up for use in the application
const express = require("express");
var cors = require("cors");
const env = require("dotenv").config({ path: "./.env" });
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const session = require("express-session"); // Session management middleware
const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("path");
const crypto = require('crypto');

const uri = process.env.MONGO_DB;

//api key variable
require("dotenv").config();

/** Jobber keys and tokens */
let bearerKey = process.env.API_KEY;
let refreshToken = process.env.REFRESH_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const INIT_COOKIE = process.env.INIT_COOKIE;
const REFRESH_COOKIE = process.env.REFRESH_COOKIE;
let authorization_code = "";

const SERVER_URL = process.env.SERVER_URL;
const CLIENT_URL = process.env.CLIENT_URL;

const PORT = 4000;
// This is used to clear the timeout when the token is refreshed
let refreshTimeout = null;

const app = express();
// Cors will help us handle errors that we may run into with header mismatches.
app.use(cors());
// Pase incoming JSON data which is a standard format for data transmission
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(
  session({
    secret: "arizona-ice-tea",
    saveUninitialized: "true",
  })
);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let tokenCollection;

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function storeTokens(bearerKey, refreshToken) {
  const encryptedBearer = encrypt(bearerKey);
  const encryptedRefresh = encrypt(refreshToken);
  await tokenCollection.updateOne(
    { _id: 'current_tokens' },
    { $set: { bearerKey: encryptedBearer, refreshToken: encryptedRefresh, lastRefreshTime: Date.now() } },
    { upsert: true }
  );
}

async function getTokens() {
  const tokens = await tokenCollection.findOne({ _id: 'current_tokens' });
  if (!tokens) return null;
  return {
    bearerKey: decrypt(tokens.bearerKey),
    refreshToken: decrypt(tokens.refreshToken),
    lastRefreshTime: tokens.lastRefreshTime
  };
}

// Connect to mongoDB and make sure that the connection is good, if it's not, log the error to the console
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("job-nobber-users").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Initialize the token collection
    tokenCollection = client.db("job-nobber-users").collection("tokens");
  } catch (e) {
    console.log(e.message);
  }
}
// This just runs the above async function
run().catch(console.dir);

// 5 mins in milliseconds: 300000

// This function generates a random refresh interval between 25 and 29 minutes
function getRandomRefreshInterval() {
  return Math.floor(Math.random() * (29 - 25 + 1) + 25) * 60 * 1000;
}

function scheduleTokenRefresh() {
  // Clear any existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const interval = getRandomRefreshInterval();
  const nextRefreshTime = new Date(Date.now() + interval);

  console.log(`Next token refresh scheduled for: ${nextRefreshTime.toLocaleString()}`);

  refreshTimeout = setTimeout(async () => {
    await refreshJobberToken();
    scheduleTokenRefresh(); // Schedule the next refresh
  }, interval);
}

async function refreshJobberToken() {
  console.log("Refreshing token");
  const tokens = await getTokens();
  if (!tokens) {
    throw new Error("No tokens found");
  }

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Cookie", INIT_COOKIE);

  const urlencoded = new URLSearchParams();

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `https://api.getjobber.com/api/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${tokens.refreshToken}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    await storeTokens(result.access_token, result.refresh_token);
    console.log("Token refreshed successfully");

    scheduleTokenRefresh();
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

// Change all the stuff to process variables
try {

  setTimeout(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Cookie", REFRESH_COOKIE);

    const urlencoded = new URLSearchParams();
    urlencoded.append(
      "code",
      // "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyNDgxNzU0LCJhcHBfaWQiOiJiMGNkYzU0MC00NmY2LTQ1ZDQtYjc0ZS1lYTI1NmE1NDZhZTkiLCJzY29wZXMiOiIiLCJleHAiOjE3MjQ2MTQwNjN9.T1dkRGNfGCxF4KMo1BozNJYdkCYh3epiYeMevt5HV8Y"
      authorization_code
    );

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    fetch(
      `https://api.getjobber.com/api/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}`,
      requestOptions
    )
      .then(async (response) => {
        // console.log('Full API Response:', response); // Log the full response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          const textResponse = await response.text();
          throw new Error(`Unexpected response: ${textResponse}`);
        }
      })
      .then(async (result) => {
        await storeTokens(result.access_token, result.refresh_token);
        console.log("Token refreshed successfully");

        // Reschedule the next refresh after a successful refresh
        scheduleTokenRefresh();
      })
      .catch((error) => console.error('Error fetching tokens:', error));

  }, 10000);

} catch (error) {
  console.error("Error in setTimeout:", error);
}

// Create a userSchema for the DB and our program, this allows us to fetch information and insert information
const userSchema = new mongoose.Schema({
  _id: String,
  email: String,
  name: String,
  username: String,
  role: String,
  password: String,
});

// Just mongoDB stuff to get DB and server ready
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Tell mongoDB that we want to use the userSchema mentioned above
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

let user = {
  id: "",
  name: "",
  username: "",
};

let loggedIn = false;

/**
 * Start of Jobber API Key fetch attempt
 * https://api.getjobber.com/api/oauth/authorize?response_type=code&client_id=<CLIENT_ID>&redirect_uri=${SERVER_URL}/<ROUTE>&state=received
 */

app.get("/auth-key", async (req, res) => {
  console.log("Reauthentication triggered");
  authorization_code = req._parsedUrl.query.substring(5);
  // console.log(authorization_code);
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Cookie", INIT_COOKIE);

  const urlencoded = new URLSearchParams();

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(
    `https://api.getjobber.com/api/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&code=${authorization_code}&redirect_uri=${SERVER_URL}/hello`,
    requestOptions
  )
    .then((response) => response.json())
    .then(async (result) => {
      await storeTokens(result.access_token, result.refresh_token);
      // console.log(result);
      console.log("Initial authentication successful");

      scheduleTokenRefresh();

      res.redirect(`${CLIENT_URL}/in-progress-jobs`);
    })
    .catch((error) => {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Authentication failed" });
    });
});

app.route("/login").post(async (req, res) => {
  const attributes = {
    email: req.body.email,
  };
  const coll = client.db("job-nobber-users").collection("job-nobber-users");
  const cursor = coll.find(attributes);
  const result = await cursor.toArray();

  if (result.length > 0) {
    user.id = result[0]._id;
    user.name = result[0].firstName;
    user.username = result[0].username;
    bcrypt.compare(
      req.body.password,
      result[0].password,
      function (err, result) {
        if (err) {
          console.error("Error comparing passwords: ", err);
          return;
        }
        req.session.user = { id: user.id, username: user.username };
        req.session.save();
        res.status(200);
        res.send("Good");
      }
    );
  } else {
    res.status(404);
    res.send("Bad");
  }
});

app.get("/userInfo", async (req, res) => {
  res.send(user.username);
});

app.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect(`${CLIENT_URL}/`);
      loggedIn = false;
    }
  });
});

app.post("/register", async (req, res) => {
  // Grab all the information from our form on the front end and assign it to a variable that we can use late
  const userFullName = req.body.firstName + " " + req.body.lastName;
  const username = req.body.username;
  const userEmail = req.body.email;

  // This will generate a new UUID for each user we want to add to the DB, better than using mongoDB's system
  const userUUID = uuidv4();

  // bcrypt is what we use to hash the passwords
  bcrypt
    // Generate a salt with 10 rounds of salting
    .genSalt(10)
    // Once we have the generated salt, hash the users password that they provided
    .then((salt) => {
      return bcrypt.hash(req.body.password, salt);
    })
    // Once we have the hash, we want to add the new user with all the properties to the DB. The only property that is hard coded is standard.
    // This way no one has admin privilges without explicity being given them
    .then((hash) => {
      const coll = client.db("job-nobber-users").collection("job-nobber-users");
      // The information should match the format that we defined earlier. So the email has to be after the _id and cannot be anywhere else.
      coll.insertOne({
        _id: userUUID,
        email: userEmail,
        name: userFullName,
        username: username,
        password: hash,
        role: "standard",
      });
      user.id = userUUID;
      user.name = userFullName;
      user.username = username;
    })
    // Catch any errors and display them to the console.
    .catch((err) => console.log(err.message))
    .then(res.redirect(`${CLIENT_URL}/in-progress-jobs`));
});

// End point that returns all Job IDs (GET)
app.get("/allJobs", async (req, res) => {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const response = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`, // Replace with your actual Jobber API token
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },

      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `
          query getAllJobs {
            jobs{
              nodes{
                title
                id
                startAt
                client{
                  companyName
                }
                completedAt
              }
            }
          }`,
      }),
    });

    if (!response.ok) {
      throw new Error(`API response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    res.json(data.data.jobs.nodes);
  } catch (err) {
    console.error("Error in /allJobs:", err);
    res.status(500).json({ error: err.message });
  }
});

// End point for Job detail (POST)
app.get("/jobDetail/:id", async (req, res) => {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const singleJob = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`,
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },
      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `
          query jobTest {
            job(id:"${req.params.id}"){
              id
              client {
                id
                billingAddress{
                  street
                  city
                  province
                  postalCode
                }
                firstName
                lastName
                emails{
                  primary
                  address
                  description
                  id
                }
                defaultEmails
                phones{
                  number
                  normalizedPhoneNumber
                  smsAllowed
                  friendly
                }
                isCompany
                companyName
              }
    
    		      #Need This
              customFields{
                ... on CustomFieldText{
                  label
                  valueText
                }
              }
          
              defaultVisitTitle
              instructions

              jobNumber
              
              lineItems{
                nodes{
                  id
                  name
                  category
                  quantity
                  description
                }
              }
              notes{
                nodes{
                  ... on ClientNote{
                    message
                  }
                  ... on JobNote{
                      id
                      message
                  }
                }
              }
              property{
                address{
                  street
                  city
                  province
                  postalCode
                }
              }
              title

              startAt
              completedAt
            }
          }
        `,
      }),
    });
    const singleJobData = await singleJob.json();
    res.send(singleJobData);
  } catch (err) {
    console.log(err);
  }
});

// Change overview to home later
app.get("/overview", async (req, res) => {
  // console.log("Overview");
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const response = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`, // Replace with your actual Jobber API token
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },

      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `
          query sampleQuery{
            jobs{
              nodes{
                id
                title
                client {
                  firstName
                  lastName
                  billingAddress{
                    street
                  }
                  companyName
                }
                visitSchedule{
                  startDate
                }
                completedAt
              }
            }
          }`,
      }),
    });
    var data = await response.json();
    // console.log(data.data.jobs.nodes);
    res.send(data.data.jobs.nodes);
  } catch (err) {
    res.status(500).send("broken");
  }
});

app.get("/recurring", async (req, res) => {
  // console.log("Overview");
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const response = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`, // Replace with your actual Jobber API token
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },

      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `
          query sampleQuery{
            jobs{
              nodes{
                id
                title
                client{
                  firstName
                  lastName
                  companyName
                }
                jobType
                visitSchedule{
                  recurrenceSchedule{
                    calendarRule
                  }
                }
              }
            }
          }`,
      }),
    });
    var data = await response.json();
    // console.log(data.data.jobs.nodes);
    res.send(data.data.jobs.nodes);
  } catch (err) {
    res.status(500).send("broken");
  }
});

app.post("/get-clients", async (req, res) => {
  // console.log("Search");
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const request = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`,
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },
      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `
          query requestQuery{
            jobs{
              nodes{
                id
                client {companyName}
              }
            }
          }`,
      }),
    });
    var data = await request.json();
    const allData = data.data.jobs.nodes;
    // console.log(allData);
    res.send(allData);
  } catch (e) {
    res.status(500).send("broken\n");
  }
});

app.get("/location/:id", async (req, res) => {
  // console.log(req.params.id);
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error("No tokens found");
    }
    const singleRequest = await fetch("https://api.getjobber.com/api/graphql", {
      // The only way that we can talk to the API is via a POST request, always use POST
      method: "POST",
      // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
        Authorization: `Bearer ${tokens.bearerKey}`,
        // Specifies the graphQL version, Jobber's API requires this for a connection
        "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
      },
      // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
      body: JSON.stringify({
        // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
        query: `query sampleQuery{
	          job(id:"${req.params.id}") {
              title
    
              client{
                companyName
                firstName
                lastName
                defaultEmails
                phones{
                  smsAllowed
                  normalizedPhoneNumber
                }
              }
              property{
                address{
                  city
                  street1
                  province
                  postalCode
                }
              }
              createdAt
              arrivalWindow{
                startAt
                endAt
                duration
              }
            }
          }`,
      }),
    });
    const singleRequestData = await singleRequest.json();
    // .then(data => console.log(data))
    // console.log(singleRequestData);
    res.send(singleRequestData);
  } catch (err) {
    console.log(err);
  }
});

app.get("/authorization", async (req, res) => {
  const tokens = await getTokens();
  if (!tokens) {
    throw new Error("No tokens found");
  }
  const users = await fetch("https://api.getjobber.com/api/graphql", {
    // The only way that we can talk to the API is via a POST request, always use POST
    method: "POST",
    // These headers are mandatory to be able to talk to the API and get a resopnse back. ALWAYS include these
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",

      // The authorization header is used to connect to the API, we will not be able to connect to the API without it.
      Authorization: `Bearer ${tokens.bearerKey}`,
      // Specifies the graphQL version, Jobber's API requires this for a connection
      "X-JOBBER-GRAPHQL-VERSION": "2024-06-10",
    },
    // This is where we put the query. First we use the JSON.stringify method to convery everything to a JSON string so we can send it as our payload
    body: JSON.stringify({
      // The response that we get from the Jobber API will be in this format. So make sure that what you request, is what you want
      query: `
        query userQuery{
          users (first: 5){
            totalCount
            nodes{
              id
              name{
                first
                last
              }
            }
          }
        }`,
    }),
  });
  const userData = await users.json();
  // console.log(userData);
});

app.get("/connectionTest", (req, res) => {
  res.send("Connected");
});

// Start the server on port 4000
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));