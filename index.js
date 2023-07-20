const express = require('express')
const mysql = require('mysql')
const cors = require('cors')

const app = express()

const PORT = 3001

const db = mysql.createConnection({
  host: 'us-cdbr-east-06.cleardb.net',
  user: 'b3a60ce02cd654',
  password: '9c74a025',
  database: 'heroku_e9faa206e9bcf0d'
})

app.use(cors())
app.use(express.json())

app.post('/api/register', (req, res) => {
  const username = req.body.username
  const password = req.body.password

  db.query(
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
  const username = req.body.username
  const password = req.body.password

  db.query(
    'SELECT * FROM users WHERE users_name = ? AND users_password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err)
      }

      if (result.length > 0) {
        res.send(result)
      } else {
        res.send({ message: 'Wrong username or password.' })
      }
    }
  )
})

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
