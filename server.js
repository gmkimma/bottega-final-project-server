const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

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
    key: 'userId',
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

// app.post('/api/register', (req, res) => {
//   const username = req.body.username
//   const password = req.body.password

//   connection.query(
//     'INSERT INTO users (users_name, users_password) VALUES (?, ?)',
//     [username, password],
//     (err, result) => {
//       console.log(
//         `Error with inserting values into database during registration: ${err}`
//       )
//     }
//   )
// })

app.get('/api/login', (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user })
  } else {
    res.send({ loggedIn: false })
  }
})

// app.post('/api/login', (req, res) => {
//   const username = req.body.username
//   const password = req.body.password

//   connection.query(
//     'SELECT * FROM users WHERE users_name = ? AND users_password = ?',
//     [username, password],
//     (err, result) => {
//       if (err) {
//         console.log(err)
//       }

//       if (result.length > 0) {
//         req.session.user = result
//         res.send({ message: 'Login successful' })
//       } else {
//         res.send({ message: 'Wrong username or password' })
//       }
//     }
//   )

//   const user = { id: 123, username: 'greg' }
//   res.cookie('userData', user, {
//     expires: new Date(Date.now() + 3600000), // Cookie expires in 1 hour
//     secure: true, // Set secure to true for HTTPS (required for production on Heroku)
//     sameSite: 'none' // Required for cross-site cookies
//   })
// })

// app.delete('/api/session', (req, res) => {
//   req.session.destroy()
// })

// Register route
app.post('/api/register', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  connection.query(
    'INSERT INTO users (users_name, users_password) VALUES (?, ?)',
    [username, password],
    (err, result) => {
      if (err) {
        console.log(
          `Error with inserting values into database during registration: ${err}`
        )
        res.status(500).send({ message: 'Registration failed' })
      } else {
        // Set a cookie manually after successful registration
        res.cookie(
          'userData',
          { username: username },
          {
            expires: new Date(Date.now() + 60 * 60 * 24 * 1000), // Cookie expires in 1 day
            httpOnly: true,
            sameSite: 'none',
            secure: true
          }
        )
        res.status(200).send({ message: 'Registration successful' })
      }
    }
  )
})

// Login route
app.post('/api/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  connection.query(
    'SELECT * FROM users WHERE users_name = ? AND users_password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err)
        res.status(500).send({ message: 'Login failed' })
      } else {
        if (result.length > 0) {
          // Set a cookie manually after successful login
          res.cookie(
            'userData',
            { username: username },
            {
              expires: new Date(Date.now() + 60 * 60 * 24 * 1000), // Cookie expires in 1 day
              httpOnly: true,
              sameSite: 'none',
              secure: true
            }
          )
          res.status(200).send({ message: 'Login successful' })
        } else {
          res.status(401).send({ message: 'Wrong username or password' })
        }
      }
    }
  )
})

//Delete
app.delete('/api/session', (req, res) => {
  // Clear the userData cookie when logging out
  res.clearCookie('userData')
  res.status(200).send({ message: 'Logout successful' })
})
