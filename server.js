const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 设置安全头部
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:");
  next();
});

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'posts.json');

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

// 获取帖子
app.get('/api/posts', (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(posts.reverse()); // 最新帖子在前
  } catch (error) {
    console.error('读取失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 提交新帖子
app.post('/api/posts', (req, res) => {
  try {
    const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const newPost = {
      id: Date.now(),
      author: req.body.author || '匿名',
      content: req.body.content,
      timestamp: new Date().toISOString()
    };
    
    posts.push(newPost);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({ error: '提交失败' });
  }
});

// 前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});