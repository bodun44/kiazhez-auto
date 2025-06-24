
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
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ua = req.headers['user-agent'];
  const time = new Date().toISOString();

  const log = `${time} | Заявка: ${name}, ${phone}, ${email} | IP: ${ip} | UA: ${ua}\n`;
  fs.appendFileSync('logs.txt', log);
  console.log(log);

  res.send('<h2>Спасибо! В ближайшее время с вами свяжутся наши менеджеры.</h2>');
});


app.get('/admin', (req, res) => {
  const key = req.query.key;
  if (key !== 'qwerty123') return res.status(403).send('Доступ запрещён');

  const rawLogs = fs.readFileSync('logs.txt', 'utf-8');
  const lines = rawLogs.trim().split('\n');

  let tableRows = lines.map(line => {
    return '<tr><td>' + line.replace(/ \| /g, '</td><td>') + '</td></tr>';
  }).join('\n');

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Логи</title>
      <style>
        body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
        th { background: #e60000; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h2>🛡️ Логи переходов и заявок</h2>
      <table>
        <tr><th>Время</th><th>ID/ФИО</th><th>IP</th><th>UA / Контакт</th></tr>
        ${tableRows}
      </table>
    </body>
    </html>
  `;

  res.send(html);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
