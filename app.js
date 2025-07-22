const express = require('express');
const app = express();
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

app.use(express.json()); // 用于解析 JSON 请求体

app.use('/api', authRoutes); // 注册路由前缀

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});