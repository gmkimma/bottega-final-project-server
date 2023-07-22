const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const cookieParser = require('cookie-parser')
const session = require('express-session')

const PORT = process.env.PORT || 3001

const app = express()

const db_config = {
  host: 'us-cdbr-east-06.cleardb.net',
  user: 'b3a60ce02cd654',
  password: '9c74a025',
  database: 'heroku_e9faa206e9bcf0d'
}

let loggedIn = false

//Created because of issues with server disconnecting
var connection
function handleDisconnect () {
  connection = mysql.createConnection(db_config)

  connection.connect(err => {
    if (err) {
      console.log(`Error when connecting to db: ${err}`)
      setTimeOut(handleDisconnect, 2000)
    }
  })

  connection.on('error', err => {
    console.log(`db error: ${err}`)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect()
    } else {
      throw err
    }
  })
}
handleDisconnect()

app.use(express.json())
app.use(
  cors({
    origin: [
      'https://bottega-project-kimma-frontend-08a97854118f.herokuapp.com/'
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
  })
)
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    key: 'test',
    secret: 'bottega',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 1000,
      sameSite: 'none',
      secure: false
    }
  })
)

app.get('/api/login', (req, res) => {
  if (loggedIn) {
    res.send({ loggedIn: true })
  } else {
    res.send({ loggedIn: false })
  }
})

app.post('/api/register', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  connection.query(
    'INSERT INTO users (users_name, users_password) VALUES (?, ?)',
    [username, password],
    (err, result) => {
      console.log(
        `Error with inserting values into database during registration: ${err}`
      )
      res.send({ message: 'Registration Successful' })
    }
  )
})

app.post('/api/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  connection.query(
    'SELECT * FROM users WHERE users_name = ? AND users_password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err)
      }

      if (result.length > 0) {
        res
          .cookie('userId', result, {
            httpOnly: true,
            secure: true,
            maxAge: 500000
          })
          .send({ message: 'Login successful' })
        loggedIn = true
      } else {
        res.send({ message: 'Wrong username or password' })
      }
    }
  )
})

app.delete('/api/session', (req, res) => {
  loggedIn = false
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})
