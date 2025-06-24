
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/log', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ua = req.headers['user-agent'];
  const time = new Date().toISOString();
  const id = req.query.id || 'unknown';

  const log = `${time} | ID: ${id} | IP: ${ip} | UA: ${ua}\n`;
  fs.appendFileSync('logs.txt', log);
  console.log(log);
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', (req, res) => {
  const { name, phone, email } = req.body;
  const time = new Date().toISOString();
  const log = `${time} | Заявка: ${name}, ${phone}, ${email}\n`;

  fs.appendFileSync('logs.txt', log);
  console.log(log);
  res.send('<h2>Спасибо! Заявка отправлена.</h2>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/admin', (req, res) => {
  const key = req.query.key;
  if (key !== 'qwerty123') {
    return res.status(403).send('Доступ запрещён');
  }

  const logs = fs.readFileSync('logs.txt', 'utf-8');
  res.send(`
    <h2>🛡️ Логи переходов и заявок</h2>
    <pre>${logs}</pre>
  `);
});

