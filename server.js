const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

// 啟動中間件
app.use(cors()); // 允許你的 React (localhost:5173) 跟後端 (localhost:3000) 溝通
app.use(express.json()); // 讓後端看得懂前端傳來的 JSON 資料

const dbURI = process.env.MONGODB_URI


const PORT = process.env.PORT || 3000;

mongoose.connect(dbURI)
  .then(() => {
  console.log('✅ 成功連線到 MongoDB 資料庫！')
  app.listen(PORT, () => {
      console.log(`🚀 後端伺服器已啟動，監聽 Port: ${PORT}`);
  }
    )})
  .catch((err) => console.log('❌ 資料庫連線失敗：', err));


const todoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true }, // 必填文字
  checked: { type: Boolean, default: false },// 預設為 false
  detailcontent: { type: String, default: '' },
  remindertime: { type: String, default: '' }
});

const Todo = mongoose.model('Todo', todoSchema);
// 1. 讀取清單 (GET)
app.get('/api/todos', async (req, res) => {
  const currentUserId = req.headers.userId
  const userTodos = await Todo.find({ userId: currentUserId }); 
  res.json(userTodos);
});


// 2. 新增事項 (POST)
app.post('/api/todos', async (req, res) => {
  // 用前端傳來的資料，創建一筆新記錄
  const currentUserId = req.headers.userId
  const newTodo = await Todo.create({
    userId: currentUserId,
    content: req.body.content
  });
  res.json(newTodo);
});

// 3. 刪除事項 (DELETE)
app.delete('/api/todos/:id', async (req, res) => {
  // Mongoose 內建的神奇方法：靠 ID 尋找並刪除
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '刪除成功' });
});

// 4. 更新狀態或細節 (PUT)
app.put('/api/todos/:id', async (req, res) => {
  // findByIdAndUpdate(要找的ID, 要更新的資料, { new: true 回傳更新後的最新結果 })
  const updatedTodo = await Todo.findByIdAndUpdate(
    req.params.id, 
    { ...req.body }, 
    { new: true }
  );
  
  if (updatedTodo) {
    res.json({ message: '更新成功', data: updatedTodo });
  } else {
    res.status(404).json({ message: '找不到此項目' });
  }
});

