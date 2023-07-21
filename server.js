const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

// const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express()

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})

const db_config = {
  host: 'us-cdbr-east-06.cleardb.net',
  user: 'b3a60ce02cd654',
  password: '9c74a025',
  database: 'heroku_e9faa206e9bcf0d'
}

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
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
  })
)
app.use(cookieParser())
// app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    key: 'userId',
    secret: 'bottega',
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 1000
    }
  })
)

app.get('/', (req, res) => {
  res.json({ message: 'hello world' })
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
    }
  )
})

app.get('/api/login', (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user })
  } else {
    res.send({ loggedIn: false })
  }
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
        req.session.user = result
        res.send({ message: 'Login successful' })
      } else {
        res.send({ message: 'Wrong username or password' })
      }
    }
  )
})

app.delete('/api/session', (req, res) => {
  req.session.destroy()
})
