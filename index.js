import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import path from "path"
import { fileURLToPath } from "url";
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore"
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid'

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

app.set('view engine', 'ejs')

const firebase = initializeApp(firebaseConfig)
const client = new OAuth2Client();
const db = getFirestore(firebase)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.get("/", (req, res, next) => {
    res.render("index")
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
            const email = payload['email']
            const q = query(collection(db, "Users"), where("email", "==", email));
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
            });
            console.log("going to send status 200");
            res.sendStatus(200)
        } else {
            res.status(300).send("Server error")
        }
      }
      verify().catch("Catching" + console.error);
      
})

app.get('/home', async (req, res) => {
    console.log("Inside home route");
    const todos = []
    
    const q = query(collection(collection(db, "Todos"), "CE4E1320-CD7B-4860-B222-B40DDABBD10E", "UserTodos"))
    const querySnapshot = await getDocs(q)
    console.log(querySnapshot.size);

    querySnapshot.forEach((doc) => {
        console.log("Inside for each");
        console.log(doc.id, ' => ', doc.data())
        todos.push(doc.data())
    })
    res.render("home", {todos: todos})
})

app.post('/mark-todo-complete', (req, res) => {
    console.log(req.body.gender)
    res.sendStatus(200)
})

app.post("/add-todo", async (req, res) => {
    const todo = {
        id: uuidv4(),
        isComplete: false,
        title: `Hello Nodejs + ${uuidv4()}`,
        todoPriority: "low"
    }
    const todoCollection = collection(db, "Todos")
    const userTodoCollection = collection(todoCollection, "CE4E1320-CD7B-4860-B222-B40DDABBD10E", "UserTodos")
    await setDoc(doc(userTodoCollection, todo.id), todo).then(response => {
        res.sendStatus(200)
    }).catch(e => {
        res.sendStatus(300)
    })
})

app.delete("/delete-todo", async (req, res) => {
    console.log("inside delete todo" + req.body.id)
    const todoCollection = collection(db, "Todos")
    const userTodoCollection = collection(todoCollection, "CE4E1320-CD7B-4860-B222-B40DDABBD10E", "UserTodos")
    const { id } = req.body
    await deleteDoc(doc(userTodoCollection, id)).then(response => {
        res.sendStatus(200)
    }).catch(e => {
        res.sendStatus(300)
    })

})

app.listen(5000, () => console.log("listening at port 5000"))