const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')


app.use(cors()) 
app.use(express.json()) 

const dbURI = process.env.MONGODB_URI


const PORT = process.env.PORT || 3000

mongoose.connect(dbURI)
  .then(() => {
  console.log('成功連線到MongoDB')
  app.listen(PORT, () => {
      console.log(`後端伺服器已啟動，監聽 Port: ${PORT}`)
  }
    )})
  .catch((err) => console.log('資料庫連線失敗：', err))


const todoSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  content: { type: String, required: true }, 
  checked: { type: Boolean, default: false },
  detailcontent: { type: String, default: '' },
  remindertime: { type: String, default: '' }
})

const Todo = mongoose.model('Todo', todoSchema)
app.get('/api/todos', async (req, res) => {
  const currentuserid = req.headers.userid
  const userTodos = await Todo.find({ userid: currentuserid }) 
  res.json(userTodos)
})



app.post('/api/todos', async (req, res) => {
  const currentuserid = req.headers.userid
  const newTodo = await Todo.create({
    userid: currentuserid,
    content: req.body.content
  })
  res.json(newTodo)
})


app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id)
  res.json({ message: '刪除成功' })
})


app.put('/api/todos/:id', async (req, res) => {
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id, 
    { ...req.body }, 
    { new: true }
  )
  
  if (updatedTodo) {
    res.json({ message: '更新成功', data: updatedTodo })
  } else {
    res.status(404).json({ message: '找不到此項目' })
  }
})

