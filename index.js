import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import path from "path"
import { fileURLToPath } from "url";
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"
import { OAuth2Client } from 'google-auth-library'

const firebaseConfig = {
    apiKey: "AIzaSyBAudDsggl7RY7iPkGtB6ewxd7oaNB6phI",
    authDomain: "todo-using-swiftui.firebaseapp.com",  
    projectId: "todo-using-swiftui",
    storageBucket: "todo-using-swiftui.appspot.com",
    messagingSenderId: "944380435445",
    appId: "1:944380435445:web:89638c40e248898e9a5ebc",
    measurementId: "G-YN45FMFJMB"
  };
  
const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json({type: "application/json"}))

const firebase = initializeApp(firebaseConfig)
const client = new OAuth2Client();
const db = getFirestore(firebase)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "views/index.html"))
})

app.post("/auth", async (req, res) => {
    console.log('auth called' + req.body.token)
    const token = req.body.token
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "944380435445-5augser9kth5mo7m9m3kdbjd3bvdfioj.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log("User id" + userid);
        if(userid) {
            console.log("going to send status 200");
            res.sendStatus(200)
        } else {
            res.status(300).send("Server error")
        }
        // const email = payload['email']
        // const q = query(collection(db, "Users"), where("email", "==", email));

        // const querySnapshot = await getDocs(q);
        // querySnapshot.forEach((doc) => {
        //     console.log(doc.id, " => ", doc.data());
        // });

      }
      verify().catch("Catching" + console.error);
      
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, "views/home.html"))
})

app.listen(5000, () => console.log("listening at port 5000"))