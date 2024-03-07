
'use strict';
s
const express = require('express');
const https = require('https');
const line = require('@line/bot-sdk');
const mysql = require('mysql');
const { system } = require('nodemon/lib/config');
const res = require('express/lib/response');
const PORT = process.env.PORT || 80;
const app = express();
const fs = require('fs');
const tj = require('@mapbox/togeojson');
const DOMParser = require('xmldom').DOMParser;
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const session = require('express-session');
const flash = require('connect-flash');
const { JSDOM } = require('jsdom');
app.use(express.static('public'));
app.use(flash());
const config = {
  channelAccessToken: 'SmoXsJsuFIwdAtrSEkDEUbsJKO3+WNf6/f8jLRmihN7mpbuYdd8FpNBVwHA6OKVRgGS0mJ1pUA6tsHyCGiRxr+razzjtsJ2wxElBG774Yg81XucjCSwNAPF7AvX3NwdbBazFP9dSHqGdvb5AROYTCwdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'be50e4a39dddfb1abf055a3abcf96f3d',
};
const config_scool = {
  channelAccessToken: '2sOkGJaf9tYYEX7Fn092lnCj15bV4gt4c/1Dqw3WLUgNNl5Z39jHQxx8fKRo69/YODH07l5MLpC2z9R4T6/Fa7DvLj6UwHKn7/VVY+GYDNAoIJw2YtuwUQ9uhy2Q2YUQ175V49XfIU+da3MvfOeNSwdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'aaae52789784b1fb5e69e8c39a776ea4',
};


app.set('view engine', 'ejs');

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log("After line.middleware: ", req.body);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.post('/webhook_scool', line.middleware(config_scool), (req, res) => {
  console.log("After line.middleware for school: ", req.body);
  Promise
    .all(req.body.events.map(handleEvent_scool))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.use(bodyParser.json());
//app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 31536000000 }
}));

app.use(express.static(path.join(__dirname, 'node_modules/cesium/Build/Cesium')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));

const connection = mysql.createConnection({
  host: 'us-cdbr-east-05.cleardb.net',
  user: 'b4b9528da5b122',
  password: '4a0bda44',
  database: 'heroku_166bdf4911de0cd'
});

const connection_cesium = mysql.createConnection({
  host: 'us-cdbr-east-05.cleardb.net',
  user: 'b0ba9c8f6c1115',
  password: '4ec0e3c1',
  database: 'heroku_252d6a4d868dd52'
});

connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log(' Database connected...');
  console.log('succes!');
});

const isMobile = (userAgent) => {
  const regex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(userAgent);
};

var pool = mysql.createPool(connection);
const client = new line.Client(config);
const client_school = new line.Client(config_scool);


async function handleEvent_scool(event) {
  const userId = event.source.userId;

  if (event.type === 'follow') {
    const forumUrl = `https://stellamaris-forum.herokuapp.com/forum_school?userId=${userId}`;

    return client_school.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "友達追加ありがとうございます！...",
      "template": {
        "type": "buttons",
        "text": "友達追加ありがとうございます！\n\n下の「開く」ボタンを押してフォーラムを開き、必要事項をご入力ください。",
        "actions": [
          {
            "type": "uri",
            "label": "開く",
            "uri": forumUrl
          }
        ]
      }
    });
  } else if (event.type === 'message' && event.message.type === 'text' && event.message.text === 'レッスンログ登録をする。') {
    const forumActiveUrl = `https://stellamaris-forum.herokuapp.com/forum_active?userId=${userId}`;

    return client_school.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "レッスンログ登録",
      "template": {
        "type": "buttons",
        "text": "以下のリンクからレッスンログ登録フォームを開いてください",
        "actions": [
          {
            "type": "uri",
            "label": "開く",
            "uri": forumActiveUrl
          }
        ]
      }
    });
  } else if (event.type === 'message' && event.message.type === 'text' && event.message.text === 'レッスンログを確認する。') {
    const forumActiveUrl = `https://stellamaris1.herokuapp.com/users_activity?name=${userId}`;

    return client_school.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "レッスンログを確認してください。",
      "template": {
        "type": "buttons",
        "text": "以下のリンクからレッスンログを確認してください。",
        "actions": [
          {
            "type": "uri",
            "label": "開く",
            "uri": forumActiveUrl
          }
        ]
      }
    });
    //学習サイト用のコード
  } else if (event.type === 'message' && event.message.type === 'text' && event.message.text === '学習サイトを開く') {
    const learningSiteUrl = `https://stellamaris1.herokuapp.com/check_user?name=${userId}`;

    return client_school.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "スマートフォンでのみ確認可能なメッセージです。",
      "template": {
        "type": "buttons",
        "text": "以下のリンクから学習サイトを開いてください。",
        "actions": [
          {
            "type": "uri",
            "label": "学習サイトを開く",
            "uri": learningSiteUrl
          }
        ]
      }
    });
  }
  return Promise.resolve(null);
}


async function handleEvent(event) {

  const userId = event.source.userId;

  if (event.type === 'follow') {
    const forumUrl = `https://stellamaris-forum.herokuapp.com/forum?userId=${userId}`;

    return client.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "スマートフォンでのみ確認可能なメッセージです。",
      "template": {
        "type": "buttons",
        "text": "友達追加ありがとうございます！\n\n下の「開く」ボタンを押してフォーラムを開き、必要事項をご入力ください。",
        "actions": [
          {
            "type": "uri",
            "label": "開く",
            "uri": forumUrl
          }
        ]
      }
    });
  } else if (event.type === 'message' && event.message.type === 'text' && event.message.text === 'フォームを開く') {
    const forumActiveUrl = `https://stellamaris-forum.herokuapp.com/forum?userId=${userId}`;

    return client.replyMessage(event.replyToken, {
      "type": "template",
      "altText": "スマートフォンでのみ確認可能なメッセージです。",
      "template": {
        "type": "buttons",
        "text": "以下のリンクからフォームを開いてください",
        "actions": [
          {
            "type": "uri",
            "label": "開く",
            "uri": forumActiveUrl
          }
        ]
      }
    });
  }
}

app.use('/cesium', express.static(path.join(__dirname, 'node_modules/cesium/Build/Cesium')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.post('/connect_cesium', function (req, res) {
  let sql = "UPDATE cesium SET cesium = ?;";
  let cesium = req.body.gpxFilename;
  console.log(cesium)
  connection_cesium.query(sql, [cesium], function (err, result) {
    if (err) {
      console.error(err);
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

app.post('/ToActivity', (req, res) => {
  const userName = req.body.name;

  connection.query('SELECT lineid FROM school_users WHERE name = ?', [userName], (error, results) => {
    if (error) {
      console.error(error.message);
      res.status(500).send("データベースのエラーが発生しました");
      return;
    }

    if (results.length > 0) {
      const lineId = results[0].lineid;
      res.redirect(`/activity?name=${lineId}`);
    } else {
      res.status(404).send("指定された名前が見つかりません");
    }
  });
});




app.get('/school_management', authenticateUser, (req, res) => {
  connection.query(
    'SELECT * FROM school_users ORDER BY id DESC',
    (error, results) => {
      if (isMobile(req.headers['user-agent'])) {
        res.render('school_management_mobile.ejs', { users: results });
      } else {
        res.render('school_management.ejs', { users: results });
      }
    }
  );
});

app.get('/events/:id', authenticateUser, (req, res) => {
  const eventId = req.params.id;

  const sqlEvent = 'SELECT * FROM events WHERE event_id = ?';
  const sqlAllUsers = 'SELECT * FROM school_users';
  const sqlEventUsers = 'SELECT * FROM event_participation WHERE event_id = ?';

  connection.query(sqlEvent, [eventId], (error, eventDetails) => {
    if (error) throw error;

    connection.query(sqlAllUsers, (error, allUsers) => {
      if (error) throw error;
      connection.query(sqlEventUsers, [eventId], (error, eventUsers) => {
        if (error) throw error;

        let participants = allUsers.map((user) => {
          const found = eventUsers.find(eventUser => eventUser.user_id === user.lineid);
          if (found) {
            return { name: user.name, participation_status: found.participation_status };
          } else {
            return { name: user.name, participation_status: '未回答' };
          }
        });

        const sortStatus = {
          '参加': 1,
          '未回答': 3,
          '不参加': 2
        };

        participants = participants.sort((a, b) => {
          return sortStatus[a.participation_status] - sortStatus[b.participation_status];
        });

        res.render('event_detail.ejs', { event: eventDetails[0], participants });
      });
    });
  });
});

app.get('/event_payment/:id', (req, res) => {
  const eventId = req.params.id; // URLの:id部分を取得

  const sqlEvent = 'SELECT event_id, event_name, event_detail FROM events WHERE event_id = ?';

  connection.query(sqlEvent, [eventId], (error, eventResults) => {
    if (error) throw error;

    if (eventResults.length > 0) {
      const event = eventResults[0];
      const sqlEventParticipation = `
              SELECT school_users.name, 
                     event_participation.id,
                     event_participation.participation_status, 
                     event_participation.payment_status, 
                     event_participation.payment_method 
              FROM school_users 
              JOIN event_participation 
              ON school_users.lineid = event_participation.user_id 
              WHERE event_participation.event_id = ? 
              AND event_participation.participation_status = "参加"`;

      connection.query(sqlEventParticipation, [event.event_id], (error, participants) => {
        if (error) throw error;

        res.render('event_payment.ejs', { event, participants });
      });
    } else {
      res.send('指定されたIDのイベントはありません。');
    }
  });
});

app.get('/events_payment', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];

  //const sqlEvent = 'SELECT event_id, event_name, event_detail FROM events WHERE event_date = ?';
  const sqlEvent = 'SELECT event_id, event_name, event_detail FROM events WHERE event_date = "2023-08-09"';

  //connection.query(sqlEvent, [currentDate], (error, eventResults) => {
  connection.query(sqlEvent, (error, eventResults) => {
    if (error) throw error;

    if (eventResults.length > 0) {
      const event = eventResults[0];
      const sqlEventParticipation = `
              SELECT school_users.name, 
                     event_participation.id,
                     event_participation.participation_status, 
                     event_participation.payment_status, 
                     event_participation.payment_method 
              FROM school_users 
              JOIN event_participation 
              ON school_users.lineid = event_participation.user_id 
              WHERE event_participation.event_id = ? 
              AND event_participation.participation_status = "参加"`;

      connection.query(sqlEventParticipation, [event.event_id], (error, participants) => {
        if (error) throw error;

        res.render('event_payment.ejs', { event, participants });
        console.log(participants);
      });
    } else {
      res.send('本日のイベントはありません。');
    }
  });
});

app.post('/update-payment-method', (req, res) => {
  const { participantId, paymentMethod } = req.body;
  console.log(req.body)

  const sqlUpdate = `
      UPDATE event_participation 
      SET payment_status = "Paid", payment_method = ? 
      WHERE id = ?
  `;

  connection.query(sqlUpdate, [paymentMethod, participantId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal server error');
      return;
    }

    res.status(200).send('Payment method updated successfully');
  });
});




app.get('/events_all', (req, res) => {
  const sql = 'SELECT * FROM events';
  connection.query(sql, (error, events) => {
    if (error) throw error;
    res.render('event_all.ejs', { events });
  });
});

app.get('/users_event_add', (req, res) => {
  const eventId = req.query.event_id;
  const userId = req.query.user_id;
  const participation = req.query.participation === 'participate' ? '参加' : '不参加';

  const sqlCheckExisting = 'SELECT * FROM event_participation WHERE event_id = ? AND user_id = ?';
  connection.query(sqlCheckExisting, [eventId, userId], (error, existingResults) => {
    if (error) throw error;

    const sqlGetName = 'SELECT name FROM school_users WHERE lineid = ?';
    connection.query(sqlGetName, [userId], (error, nameResults) => {
      if (error) throw error;

      if (nameResults.length > 0) {
        const userName = nameResults[0].name;
        const data = {
          event_id: eventId,
          user_id: userId,
          username: userName,
          participation_status: participation,
        };

        if (existingResults.length > 0) {
          const sqlUpdateParticipation = 'UPDATE event_participation SET participation_status = ? WHERE event_id = ? AND user_id = ?';
          connection.query(sqlUpdateParticipation, [participation, eventId, userId], (error) => {
            if (error) throw error;
            res.send('回答を更新しました。タブを閉じてください。');
          });
        } else {
          const sqlInsertParticipation = 'INSERT INTO event_participation SET ?';
          connection.query(sqlInsertParticipation, data, (error) => {
            if (error) throw error;
            res.send('回答が完了しました。タブを閉じてください。');
          });
        }
      } else {
        res.send('User does not exist');
      }
    });
  });
});




app.get('/event', authenticateUser, (req, res) => {
  res.render('event.ejs');
});

app.post('/create_event', (req, res) => {
  const event = {
    event_name: req.body.event_name,
    event_detail: req.body.event_detail,
    event_date: req.body.event_date,
  };

  const sql = 'INSERT INTO events SET ?';
  connection.query(sql, event, (error, results) => {
    if (error) throw error;

    const eventId = results.insertId;

    const sql = `SELECT lineid FROM school_users WHERE name IN ('テスト', '三品海星', 'ヨコタ', '安形　和彦', '三品弘樹')`;
    connection.query(sql, (error, users) => {
      if (error) throw error;

      users.forEach(async (user) => {
        if (!user.lineid) {
          return;
        }

        const message = {
          type: 'template',
          altText: '新しいイベントが追加されました！',
          template: {
            type: 'confirm',
            text: `${event.event_date}に以下のイベントが予定されています。\n\n- イベント名: ${event.event_name}\n\n- イベント詳細: ${event.event_detail}\n\n参加しますか？`,
            actions: [
              {
                type: 'uri',
                label: '参加',
                uri: `https://stellamaris1.herokuapp.com/users_event_add?event_id=${eventId}&user_id=${user.lineid}&participation=participate`,
              },
              {
                type: 'uri',
                label: '不参加',
                uri: `https://stellamaris1.herokuapp.com/users_event_add?event_id=${eventId}&user_id=${user.lineid}&participation=not_participate`,
              },
            ],
          },
        };

        console.log(user.lineid);
        await client_school.pushMessage(user.lineid, message);
      });

      res.redirect('/events_all')
    });
  });
});


app.post('/search_school', authenticateUser, (req, res) => {
  let searchName = req.body.name;
  let searchQualification = req.body.qualification;
  let query = 'SELECT * FROM school_users';
  let queryData = [];

  if (searchName || searchQualification) {
    query += ' WHERE';
    if (searchName) {
      query += ' name LIKE ?';
      queryData.push('%' + searchName + '%');
      if (searchQualification && searchQualification !== "none") {
        query += ' AND qualifications = ?';
        queryData.push(searchQualification);
      } else if (searchQualification === "none") {
        query += ' AND (qualifications IS NULL OR qualifications = "")';
      }
    } else if (searchQualification) {
      if (searchQualification !== "none") {
        query += ' qualifications = ?';
        queryData.push(searchQualification);
      } else {
        query += ' (qualifications IS NULL OR qualifications = "")';
      }
    }
    query += ' ORDER BY id DESC';
  } else {
    query += ' ORDER BY id DESC';
  }

  connection.query(query, queryData, (error, results) => {
    if (isMobile(req.headers['user-agent'])) {
      res.render('school_management_mobile.ejs', { users: results });
    } else {
      res.render('school_management.ejs', { users: results });
    }
  });
});


app.get('/Emergency', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM school_users WHERE id = ?';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      let user = results[0];
      res.render('emergency.ejs', { user: user, message: req.flash('success') });
    } else {
      res.render('emergency.ejs', { message: req.flash('success') });
    }
  });
});

app.get('/activity', authenticateUser, function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM activities WHERE userId = ? ORDER BY id DESC';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.render('error.ejs', { message: 'データの取得に失敗しました。' });
    } else if (!results.length) {
      res.render('error.ejs', { message: '活動履歴が見つかりませんでした。' });
    } else {
      let total_days = results.length;
      let total_hours = results.reduce((total, activity) => total + activity.hours, 0);
      let area_counts = {
        "空パーク": 0,
        "竜ヶ岩": 0,
        "高塚": 0,
        "衣笠山": 0,
        "その他": 0
      };

      for (let activity of results) {

        if (activity.area in area_counts) {
          area_counts[activity.area]++;
        }
      }

      if (isMobile(req.headers['user-agent'])) {
        res.render('activity_mobile.ejs', { users: results, total_days: total_days, total_hours: total_hours, area_counts: area_counts });
      } else {
        res.render('activity.ejs', { users: results, total_days: total_days, total_hours: total_hours, area_counts: area_counts });
      }
    }
  });
});

app.get('/activity_management', authenticateUser, function (req, res) {
  let sql = 'SELECT * FROM activities ORDER BY id DESC';
  connection.query(sql, function (err, results) {
    if (err) {
      console.error(err);
      res.render('error.ejs', { message: 'データの取得に失敗しました。' });
    } else if (!results.length) {
      res.render('error.ejs', { message: '活動履歴が見つかりませんでした。' });
    } else {
      if (isMobile(req.headers['user-agent'])) {
        res.render('activity_mobile_management.ejs', { users: results });
      } else {
        res.render('activity_management.ejs', { users: results });
      }
    }
  });
});


app.get('/users_activity', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM activities WHERE userId = ? ORDER BY id DESC';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.render('error.ejs', { message: 'データの取得に失敗しました。' });
    } else if (!results.length) {
      res.render('error.ejs', { message: '活動履歴が見つかりませんでした。' });
    } else {
      let total_days = results.length;
      let total_hours = results.reduce((total, activity) => total + activity.hours, 0);
      let area_counts = {
        "空パーク": 0,
        "竜ヶ岩": 0,
        "高塚": 0,
        "衣笠山": 0,
        "その他": 0
      };

      for (let activity of results) {
        if (activity.area in area_counts) {
          area_counts[activity.area]++;
        }
      }

      if (isMobile(req.headers['user-agent'])) {
        res.render('users_activity_mobile.ejs', { users: results, total_days: total_days, total_hours: total_hours, area_counts: area_counts });
      } else {
        res.render('users_activity.ejs', { users: results, total_days: total_days, total_hours: total_hours, area_counts: area_counts });
      }
    }
  });
});

app.post('/search_activity', function (req, res) {
  let searchDate = req.body.date;
  console.log(searchDate);
  if (searchDate) {
    let sql = 'SELECT * FROM activities WHERE date = ? ORDER BY id DESC';
    connection.query(sql, [searchDate], function (err, results) {
      if (err) {
        console.error(err);
        res.render('error.ejs', { message: 'データの取得に失敗しました。' });
      } else if (!results.length) {
        res.render('error.ejs', { message: '該当日の活動履歴が見つかりませんでした。' });
      } else {
        if (isMobile(req.headers['user-agent'])) {
          res.render('activity_mobile_management.ejs', { users: results });
        } else {
          res.render('activity_management.ejs', { users: results });
        }
      }
    });
  } else {
    res.redirect('/activity_management');
  }
});

app.get('/edit_activity_users', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM activities WHERE id = ?';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      let user = results[0];
      res.render('activity_edit_form_users.ejs', { user: user, message: req.flash('success') });
    } else {
      res.render('activity_edit_form_users.ejs', { message: req.flash('success') });
    }
  });
});

app.post('/update_activity', (req, res) => {
  const { name, date, area, hours, comments, userId, id, uploadedFileUrl } = req.body;

  connection.query('SELECT * FROM activities WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error("Database select error: ", error);
      res.status(500).send('Server error');
    } else {
      const oldData = results[0];
      const query = `UPDATE activities SET name=?, date=?, area=?, hours=?, comments=?, userId=?, upload_url=? WHERE id=?`;
      const queryParams = [name, date, area, hours, comments, userId, uploadedFileUrl || null, id];

      connection.query(query, queryParams, async (error, results) => {
        if (error) {
          console.error("Database update error: ", error);
          res.status(500).send('Server error');
        } else {
          res.redirect(`/users_activity?name=${userId}`);
        }
      });
    }
  });
});


app.get('/edit_activity', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM activities WHERE id = ?';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      let user = results[0];
      res.render('activity_edit_form.ejs', { user: user, message: req.flash('success') });
    } else {
      res.render('activity_edit_form.ejs', { message: req.flash('success') });
    }
  });
});

app.post('/update_users_activity', (req, res) => {
  const { name, date, area, hours, comments, userId, instructor_comment, id, uploadedFileUrl } = req.body;

  connection.query('SELECT * FROM activities WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error("Database select error: ", error);
      res.status(500).send('Server error');
    } else {
      const oldData = results[0];
      const query = `UPDATE activities SET name=?, date=?, area=?, hours=?, comments=?, userId=?, instructor_comment=?, upload_url=? WHERE id=?`;
      const queryParams = [name, date, area, hours, comments, userId, instructor_comment, uploadedFileUrl || null, id];

      connection.query(query, queryParams, async (error, results) => {
        if (error) {
          console.error("Database update error: ", error);
          res.status(500).send('Server error');
        } else {
          if (oldData.instructor_comment !== instructor_comment && userId) {
            try {
              const forumActiveUrl = `https://stellamaris1.herokuapp.com/users_activity?name=${userId}`;

              const message = {
                "type": "template",
                "altText": "インストラクターからのコメントが更新されました！",
                "template": {
                  "type": "buttons",
                  "text": "インストラクターからのコメントが更新されました！\n以下のリンクから確認してください。",
                  "actions": [
                    {
                      "type": "uri",
                      "label": "開く",
                      "uri": forumActiveUrl
                    }
                  ]
                }
              }

              await client_school.pushMessage(userId, message);
            } catch (error) {
              console.error("LINE message send error: ", error);
            }
          }
          res.redirect(`/activity?name=${userId}`);
        }
      });
    }
  });
});

app.get('/update_SchoolUsers', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM school_users WHERE id = ?';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      let user = results[0];
      res.render('user_update_forum.ejs', { user: user, message: req.flash('success') });
    } else {
      res.render('user_update_forum.ejs', { message: req.flash('success') });
    }
  });
});

app.get('/update_management', function (req, res) {
  let name = req.query.name;
  let sql = 'SELECT * FROM users WHERE id = ?';
  connection.query(sql, [name], function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else if (results.length > 0) {
      let user = results[0];
      res.render('user_update_forum2.ejs', { user: user, message: req.flash('success') });
    } else {
      res.render('user_update_forum2.ejs', { message: req.flash('success') });
    }
  });
});

app.post('/update_users_management', (req, res) => {
  const { id, level, flight, done, name, gender, phone, address1, address2, address3,
    email, dob, height, weight, Bloodtype, jobtype, job, name2, type,
    number, solo, sns, source } = req.body;

  const query = `UPDATE users SET level=?, flight=?, done=?, name=?, gender=?, phone=?, 
                 address1=?, address2=?, address3=?, email=?, dob=?, height=?, weight=?, 
                 Bloodtype=?, jobtype=?, job=?, name2=?, type=?, number=?, solo=?, sns=?, source=? 
                 WHERE id=?`;

  const queryParams = [level, flight, done, name, gender, phone, address1, address2,
    address3, email, dob, height, weight, Bloodtype, jobtype, job,
    name2, type, number, solo, sns, source, id];

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Server error');
    } else {
      res.redirect('/management');
    }
  });
});


app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.post('/update_users', function (req, res) {
  let sql = `UPDATE school_users SET 
                name = ?, name_reading = ?, gender = ?, mobile_number = ?, email = ?,
                postal_code = ?, address = ?, birth_date = ?, height = ?, weight = ?, 
                blood_type = ?, blood_type_Rh = ?, qualifications = ?, flyer_registration_number = ?,
                emergency_contact1_number = ?, emergency_contact1_name = ?, emergency_contact1_relationship = ?,  emergency_contact1_approved = ?,
                emergency_contact2_number = ?, emergency_contact2_name = ?, emergency_contact2_relationship = ?,  emergency_contact2_approved = ?,
                workplace = ?, workplace_phone_number = ?, health_concerns = ?
              WHERE id = ?`;

  let data = [
    req.body.name,
    req.body.name_reading,
    req.body.gender,
    req.body.phone,
    req.body.email,
    req.body.address1,
    req.body.address2,
    req.body.dob,
    req.body.height,
    req.body.weight,
    req.body.Bloodtype,
    req.body.blood_type_Rh,
    req.body.qualifications,
    req.body.flyer_registration_number,
    req.body.emergency_contact1_number,
    req.body.emergency_contact1_name,
    req.body.emergency_contact1_relationship,
    req.body.emergency_contact1_approved,
    req.body.emergency_contact2_number,
    req.body.emergency_contact2_name,
    req.body.emergency_contact2_relationship,
    req.body.emergency_contact2_approved,
    req.body.workplace,
    req.body.workplace_phone_number,
    req.body.health_concerns,
    req.body.id
  ];

  connection.query(sql, data, function (err, result) {
    if (err) throw err;
    console.log('Record updated successfully');
    res.redirect('/school_management');
  });
});


app.post('/send_message', (req, res) => {
  let message = req.body.message;
  message = message.replace(/<br>/g, '\n');
  const $ = cheerio.load(message);
  const link = $('a').attr('href');
  const image = $('img').attr('src');
  const text = $('p').text();

  console.log('Link:', link);
  console.log('Image:', image);
  console.log('Text:', text);

  let lineMessage;
  let messageType = 'text';  // Default to text

  if (link && image && text) {
    messageType = 'image_link';
    lineMessage = {
      type: 'template',
      altText: 'this is a buttons template',
      template: {
        type: 'buttons',
        thumbnailImageUrl: image,
        title: 'Link and text',
        text: text,
        actions: [
          {
            type: 'uri',
            label: 'View detail',
            uri: link
          }
        ]
      }
    };
  } else if (link && image) {
    messageType = 'image_link';
    lineMessage = {
      type: 'template',
      altText: 'this is image and link',
      template: {
        type: 'buttons',
        thumbnailImageUrl: image,
        title: 'リンク付き画像',
        text: 'クリックしてリンクを開く',
        actions: [
          {
            type: 'uri',
            label: '開く',
            uri: link
          }
        ]
      }
    };
  } else if (image) {
    messageType = 'image_link';
    lineMessage = {
      type: 'image',
      originalContentUrl: image,
      previewImageUrl: image
    };
  } else if (text) {
    lineMessage = {
      type: 'text',
      text: text
    };
  }

  const saveMessageToDB = (callback) => {
    const query = `INSERT INTO messages (messageType, textContent, imageUrl, linkUrl) VALUES (?, ?, ?, ?)`;
    connection.query(query, [messageType, text, image, link], (err, results) => {
      if (err) {
        console.error('Error saving the message to the database:', err);
        return;
      }
      console.log('Message saved to the database with ID:', results.insertId);
      callback(results.insertId);
    });
  };

  saveMessageToDB((messageId) => {
    const userIds = ['Ud38b8f17ab439bfaf152bbf0f0845760', 'U7209920cc3967b86e56f393c04c1eb10'];
    //for (let userId of global.variable_userIds) {
    for (let userId of userIds) {
      const query = `INSERT INTO message_users (messageId, userId) VALUES (?, ?)`;
      connection.query(query, [messageId, userId], (err) => {
        if (err) {
          console.error(`Error associating message ${messageId} with user ${userId}:`, err);
          return;
        }
        console.log(`Message ${messageId} associated with user ${userId}`);
      });

      client.pushMessage(userId, lineMessage)
        .then(() => {
          console.log(`Message sent to ${userId}`);
        })
        .catch((err) => {
          console.error(`Error sending message to ${userId}:`, err);
        });
      /*client.pushMessage(userId, lineMessage)
          .then(() => {
              console.log(`Message sent to ${userId}`);
          })
          .catch((err) => {
              console.error(`Error sending message to ${userId}:`, err);
          });*/
    }
    updateSecondLatestFlightInfo(messageId);
  });

  const updateSecondLatestFlightInfo = (messageId) => {
    connection.query('SELECT id FROM FlightInfo ORDER BY id DESC LIMIT 2', (err, results) => {
      if (err) {
        console.error('Error fetching the top two IDs:', err);
        return;
      }

      if (results.length < 2) {
        console.error('Not enough records in FlightInfo to update the second latest entry.');
        return;
      }

      const secondLatestId = results[1].id;

      const updateQuery = `
            UPDATE FlightInfo
            SET message_id = ?
            WHERE id = ?
        `;

      connection.query(updateQuery, [messageId, secondLatestId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating the second latest FlightInfo with the new message ID:', updateErr);
          return;
        }
        console.log('Second latest FlightInfo updated with the new message ID:', messageId);

        deleteRecordsWithNullMessageId();
      });
    });
  };

  const deleteRecordsWithNullMessageId = () => {
    const deleteQuery = `
        DELETE FROM FlightInfo
        WHERE message_id IS NULL
    `;

    connection.query(deleteQuery, (deleteErr, results) => {
      if (deleteErr) {
        console.error('Error deleting records with NULL message_id:', deleteErr);
        return;
      }

      console.log(`${results.affectedRows} records with NULL message_id deleted from FlightInfo.`);
    });
  };

  req.session.userIdsBeforeRedirect = global.variable_userIds;
  res.redirect('/line_message');
});

app.get('/message_history', (req, res) => {
  const query = `
      SELECT 
          messages.id AS messageId, 
          messages.sentAt, 
          messages.textContent, 
          messages.imageUrl, 
          messages.linkUrl, 
          users.name,
          FlightInfo.flight_status, 
          FlightInfo.gender,         
          FlightInfo.lesson_interest,
          FlightInfo.flight_schedule_date
      FROM messages
      LEFT JOIN FlightInfo ON messages.id = FlightInfo.message_id
      JOIN message_users ON messages.id = message_users.messageId
      JOIN users ON message_users.userId = users.userId
      ORDER BY messages.id DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching the messages:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let groupedMessages = [];

    results.forEach(result => {
      let message = groupedMessages.find(m => m.messageId === result.messageId);
      if (!message) {
        message = {
          messageId: result.messageId,
          sentAt: result.sentAt,
          textContent: result.textContent,
          imageUrl: result.imageUrl,
          linkUrl: result.linkUrl,
          flightStatus: result.flight_status,
          gender: result.gender,
          lessonInterest: result.lesson_interest,
          flightDate: result.flight_schedule_date,
          users: []
        };
        groupedMessages.push(message);
      }
      if (!message.users.includes(result.name)) {
        message.users.push(result.name);
      }
    });

    groupedMessages.sort((a, b) => b.messageId - a.messageId);

    res.render('history.ejs', { messages: groupedMessages });
  });
});



app.get('/line_message', authenticateUser, (req, res) => {
  let query = 'SELECT * FROM users WHERE 1=1';

  if (req.query.flightStatus) {
    query += ` AND done = '${req.query.flightStatus === 'done' ? '○' : '×'}'`;
  }
  if (req.query.gender) {
    query += ` AND gender = '${req.query.gender === 'male' ? '男' : '女'}'`;
  }
  if (req.query.solo) {
    query += ` AND solo = '${req.query.solo === 'yes' ? '興味あり' : '興味なし'}'`;
  }
  if (req.query.flightDate) {
    query += ` AND flight = '${req.query.flightDate}'`;
  }

  query += ' ORDER BY id DESC';

  let flightStatusMap = {
    "": "すべて",
    "done": "完了",
    "notDone": "未完了"
  };

  let genderMap = {
    "": "すべて",
    "male": "男性",
    "female": "女性"
  };

  let soloMap = {
    "": "すべて",
    "yes": "あり",
    "no": "なし"
  };

  let flightStatus = flightStatusMap[req.query.flightStatus];
  let gender = genderMap[req.query.gender];
  let solo = soloMap[req.query.solo];

  let flightDateValue = req.query.flightDate ? `'${req.query.flightDate}'` : 'NULL';

  // 検索履歴をFlightInfoテーブルに保存するクエリ
  let insertQuery = `
    INSERT INTO FlightInfo (flight_status, gender, lesson_interest, flight_schedule_date)
    VALUES (
        '${flightStatus}',
        '${gender}',
        '${solo}',
        ${flightDateValue}
    )
`;

  connection.query(insertQuery, (insertErr) => {
    if (insertErr) throw insertErr;

    connection.query(query, (err, result) => {
      if (err) throw err;
      if (req.session.userIdsBeforeRedirect) {
        global.variable_userIds = req.session.userIdsBeforeRedirect;
        delete req.session.userIdsBeforeRedirect;
      } else {
        global.variable_userIds = result.map(user => user.userid);
      }
      console.log(global.variable_userIds)
      if (isMobile(req.headers['user-agent'])) {
        res.render('index_mobile.ejs', { customers: result });
      } else {
        res.render('index.ejs', { customers: result });
      }
    });
  });
});


app.post('/schedule_search', (req, res) => {
  const flightDate = req.body.flight;
  const name = req.body.name;
  let query;
  let queryParams;

  if (flightDate && name) {
    query = 'SELECT * FROM users WHERE flight = ? AND name LIKE ? ORDER BY id DESC';
    queryParams = [flightDate, `%${name}%`];
  } else if (flightDate) {
    query = 'SELECT * FROM users WHERE flight = ? ORDER BY id DESC';
    queryParams = [flightDate];
  } else if (name) {
    query = 'SELECT * FROM users WHERE name LIKE ? ORDER BY id DESC';
    queryParams = [`%${name}%`];
  } else {
    query = 'SELECT * FROM users ORDER BY id DESC';
    queryParams = [];
  }

  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('An error occurred:', error);
      res.status(500).send('Server error');
    } else {
      if (isMobile(req.headers['user-agent'])) {
        res.render('management_mobile.ejs', { users: results });
      } else {
        res.render('management.ejs', { users: results });
      }
    }
  });
});

app.get('/today_flight', authenticateUser, (req, res) => {
  const options = { timeZone: 'Asia/Tokyo' };
  const japaneseDate = new Date().toLocaleDateString('ja-JP', options);
  const [year, month, day] = japaneseDate.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  console.log(formattedDate)

  connection.query(
    `SELECT * FROM users WHERE flight = ? ORDER BY id DESC`,
    [formattedDate],
    (error, results) => {
      if (isMobile(req.headers['user-agent'])) {
        res.render('today_flight_user_mobile.ejs', { users: results });
      } else {
        res.render('today_flight_User.ejs', { users: results });
      }
    }
  );
});

app.post('/delete_activity', (req, res) => {
  const id = req.body.id;

  let sql = 'DELETE FROM activities WHERE id = ?';
  connection.query(sql, id, (err, result) => {
    if (err) {
      console.error('Error during delete:', err);
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/delete', authenticateUser, (req, res) => {
  connection.query(
    'SELECT * FROM users ORDER BY id DESC',
    (error, results) => {
      if (isMobile(req.headers['user-agent'])) {
        res.render('delete_mobile.ejs', { users: results });
      } else {
        res.render('delete.ejs', { users: results });
      }
    }
  );
});

app.post('/delete_data', (req, res) => {
  const deleteIds = req.body.delete_ids;
  if (deleteIds) {
    deleteIds.forEach((id) => {
      connection.query(
        'DELETE FROM users WHERE id = ?',
        [id],
        (error, results) => {
          if (error) throw error;
        }
      );
    });
  }
  res.redirect('/management');
});

app.get('/delete_school', authenticateUser, (req, res) => {
  connection.query(
    'SELECT * FROM school_users ORDER BY id DESC',
    (error, results) => {
      if (isMobile(req.headers['user-agent'])) {
        res.render('delete_school_mobile.ejs', { users: results });
      } else {
        res.render('delete_school.ejs', { users: results });
      }
    }
  );
});


app.post('/delete_data_school', (req, res) => {
  const deleteIds = req.body.delete_ids;
  if (deleteIds) {
    deleteIds.forEach((id) => {
      connection.query(
        'DELETE FROM school_users WHERE id = ?',
        [id],
        (error, results) => {
          if (error) throw error;
          console.log(error);
          console.log(results);
        }
      );
    });
  }
  res.redirect('/school_management');
});

function intervalFunc() {
  connection.query(
    'INSERT INTO connection(name) VALUES ("Connection")',
    (error, results) => {
      if (error) throw error;

      connection.query(
        'DELETE FROM connection WHERE name = "Connection"',
        (error, results) => {
          if (error) throw error;
        })
      connection_cesium.query(
        'INSERT INTO connection(username) VALUES ("Connection")',
        (error, results) => {
          if (error) throw error;

          connection_cesium.query(
            'DELETE FROM connection WHERE username = "Connection"',
            (error, results) => {
              if (error) throw error;
            })

        })

    })
}

setInterval(intervalFunc, 40000);

app.get('/top', (req, res) => {
  res.render('top.ejs');
});


app.post('/update_flight_status', async (req, res) => {
  const userIds = req.body.selectedUsers;
  console.log(userIds)
  if (userIds) {
    try {
      await Promise.all(userIds.map(userId => {
        return new Promise((resolve, reject) => {
          connection.query(`SELECT done FROM users WHERE id = ?`, userId, (error, results) => {
            if (error) {
              reject(error);
            } else {
              let newStatus = results[0].done === '○' ? '×' : '○';

              connection.query(`UPDATE users SET done = ? WHERE id = ?`, [newStatus, userId], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results);
                }
              });
            }
          });
        });
      }));
      res.redirect('/management');
    } catch (error) {
      console.log(error);
      res.redirect('/management');
    }
  } else {
    res.redirect('/management');
  }
});

app.post('/update_flight_status_false', (req, res) => {
  const userId = req.body.userId;
  console.log(userId)
  if (userId) {
    let queryString = `UPDATE users SET done = "×" WHERE id = ?`;

    connection.query(queryString, userId, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/management');
      }
    });
  } else {
    res.redirect('/management');
  }
});

app.post('/update_flight', (req, res) => {
  const userId = req.body.userId;
  console.log(userId)
  if (userId) {
    let queryString = `UPDATE users SET done = "○" WHERE id = ?`;

    connection.query(queryString, userId, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/today_flight');
      }
    });
  } else {
    res.redirect('/today_flight');
  }
});

app.post('/update_flight_false', (req, res) => {
  const userId = req.body.userId;
  console.log(userId)
  if (userId) {
    let queryString = `UPDATE users SET done = "×" WHERE id = ?`;

    connection.query(queryString, userId, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/today_flight');
      }
    });
  } else {
    res.redirect('/today_flight');
  }
});

app.post('/all', (req, res) => {
  const naiyou = req.body.all;
  console.log(naiyou);
  connection.query(
    'select userId FROM users;',
    (error, results) => {
      let n;
      n = results.length;
      var ids = new Array(n);
      for (let i = 0; i < n; i++) {
        if (results[i].userId === null) {
          continue;
        }
        ids[i] = results[i].userId;
        console.log(ids)

        const message = {
          type: 'text',
          text: naiyou
        };

        client.pushMessage(ids[i], message)
      }
      res.redirect('/management',);
    }
  )
})

function authenticateUser(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.render('login_form.ejs');
});

app.post('/login', (req, res) => {
  if (req.body.username === 'sora' && req.body.password === '0000') {
    req.session.authenticated = true;
    const redirectTo = req.session.redirectTo || '/management';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  res.redirect('/login');
});

app.get('/management', authenticateUser, (req, res) => {
  connection.query(
    'SELECT * FROM users ORDER BY id DESC',
    (error, results) => {
      if (isMobile(req.headers['user-agent'])) {
        res.render('management_mobile.ejs', { users: results });
      } else {
        res.render('management.ejs', { users: results });
      }
    }
  );
});


//以降online_studyアプリケーション


app.get('/check_user', (req, res) => {
  const userId = req.query.name;
  // school_users テーブルで userId と一致する lineId を検索
  const query = 'SELECT id FROM school_users WHERE lineId = ?';
  connection.query(query, [userId], (error, results) => {
    if (error) {
      // エラーハンドリング
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (results.length > 0) {
      // 一致するユーザーが見つかった場合
      const userName = results[0].id;
      console.log(results[0]);
      res.redirect(`/study_top/${userName}`);
    } else {
      // 一致するユーザーが見つからなかった場合
      res.redirect(`/forum_school/${userId}`);
    }
  });
});

app.get('/study_top/:userName', (req, res) => {
  const userName = req.params.userName;

  // データベースからデータを取得する
  connection.query('SELECT Grade FROM done_pdf WHERE UserId = ?', [userName], (error, results) => {
    if (error) {
      // エラー処理
      res.send('エラーが発生しました');
    } else {
      // Gradeプロパティのみを含む新しい配列を作成
      const grades = results.map(row => row.Grade);

      // EJSにデータを渡す
      res.render('study_top.ejs', { userName: userName, grades: grades });
      console.log(grades);
    }
  });
});

app.get('/pdf/:grade/:userName', (req, res) => {
  const pdfUrl = req.query.url;
  const userName = req.params.userName;
  const grade = req.params.grade;

  // 重複チェックのためのクエリ
  const checkQuery = 'SELECT * FROM done_pdf WHERE UserId = ? AND Grade = ?';
  connection.query(checkQuery, [userName, grade], (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    if (results.length === 0) {
      // レコードが存在しない場合、新しいレコードを追加
      const insertQuery = 'INSERT INTO done_pdf (UserId, Grade) VALUES (?, ?)';
      connection.query(insertQuery, [userName, grade], (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  });

  // ユーザーエージェントをチェックしてデバイスタイプを判定
  const userAgent = req.get('User-Agent');
  if (/mobile/i.test(userAgent)) {
    // モバイルデバイスの場合
    res.render('pdf_mobile.ejs', { pdfUrl: pdfUrl, userName: userName, grade: grade });
    console.log("mobile")
  } else {
    // モバイルデバイスではない場合
    res.render('pdf.ejs', { pdfUrl: pdfUrl, userName: userName, grade: grade });
  }
});

app.post('/mark-as-read', (req, res) => {
  const { pdfRead, userName, grade } = req.body;

  // done_pdfテーブルに新しいレコードを追加
  const query = 'INSERT INTO done_pdf (UserId, Grade) VALUES (?, ?)';

  /*connection.query(query, [userName, grade], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'データベース更新中にエラーが発生しました' });
      return;
    }
    res.json({ message: '読破情報が登録されました', userName: userName });
  });*/
});

app.get('/progress/:userId', (req, res) => {
  const userId = req.params.userId;

  const units = {
    'A級': {
      '実技': [
        { id: 'A-z-1', name: '機材' },
        { id: 'A-z-2', name: '機材の取り扱いと準備' },
        { id: 'A-z-3', name: 'フライトの準備' },
        { id: 'A-z-4', name: 'ブレークコードの準備' },
        { id: 'A-z-5', name: 'ライズアップ' },
        { id: 'A-z-6', name: 'グランドハンドリング' },
        { id: 'A-z-7', name: 'テイクオフ' },
        { id: 'A-z-8', name: '直線飛行' },
        { id: 'A-z-9', name: 'ランディング' }
      ],
      '学科': [
        { id: 'A-g-1', name: '風向と風速' },
        { id: 'A-g-2', name: 'パラグライダーの滑空1' },
        { id: 'A-g-3', name: '心身の準備' },
        { id: 'A-g-4', name: 'エリア毎のルール' },
        { id: 'A-g-5', name: '低高度練習中における危険性' }
      ]
    },
    'B級': {
      '実技': [
        { id: 'B-z-1', name: 'レスキューパラシュート' },
        { id: 'B-z-2', name: '不時着' },
        { id: 'B-z-3', name: '高高度フライト' },
        { id: 'B-z-4', name: 'リバースライズアップ' },
        { id: 'B-z-5', name: '高高度のテイクオフ' },
        { id: 'B-z-6', name: 'グライダーの設定' },
        { id: 'B-z-7', name: '旋回' },
        { id: 'B-z-8', name: '偏流修正飛行' },
        { id: 'B-z-9', name: '速度コントロール1' },
        { id: 'B-z-10', name: 'グライドパス' },
        { id: 'B-z-11', name: 'ランディング2' }
      ],
      '学科': [
        { id: 'B-g-1', name: '安全規格' },
        { id: 'B-g-2', name: '機材のメンテナンス' },
        { id: 'B-g-3', name: 'フライトルールとマナー' },
        { id: 'B-g-4', name: 'パラグライダーの滑空2' },
        { id: 'B-g-5', name: 'パラグライダーの旋回1' },
        { id: 'B-g-6', name: '風' },
        { id: 'B-g-7', name: '航空法と小型無人機等飛行禁止法' },
        { id: 'B-g-8', name: '高高度練習中における危険性' }
      ]
    },
    'C級': {
      '実技': [
        { id: 'H-z-1', name: 'スラローム飛行' },
        { id: 'H-z-2', name: 'リッジソアリング' },
        { id: 'H-z-3', name: '360度旋回1' },
        { id: 'H-z-4', name: '堀周アプローチ' },
        { id: 'H-z-5', name: 'ランディング3' },
        { id: 'H-z-6', name: '速度コントロール2' },
        { id: 'H-z-7', name: 'ピッチングトローリング' },
        { id: 'H-z-8', name: '緊急時の操作' }
      ],
      '学科': [
        { id: 'H-g-1', name: '心身の準備2' },
        { id: 'H-g-2', name: 'ポーラーカーブ' },
        { id: 'H-g-3', name: '翼変形と回復' },
        { id: 'H-g-4', name: 'パラグライダーが利用できる上昇風' },
        { id: 'H-g-5', name: '大気の安定度1' },
        { id: 'H-g-6', name: '危険なコンディション1' },
        { id: 'H-g-7', name: 'パラグライダーとハンググライダーの特性' }
      ]
    },
    'パラグライディングパイロット技能証課程': {
      '実技': [
        { id: 'P-z-1', name: '360度旋回1' },
        { id: 'P-z-2', name: 'サーマルソアリング' },
        { id: 'P-z-3', name: 'ランディング4' },
        { id: 'P-z-4', name: '潰れからの回復' },
        { id: 'P-z-5', name: '緊急降下手段1' },
        { id: 'P-z-6', name: 'ホームエリア以外でのフライト' }
      ],
      '学科': [
        { id: 'P-g-1', name: '大気圏利用の基礎' },
        { id: 'P-g-2', name: '危険なコンディション2' },
        { id: 'P-g-3', name: '危険回避' },
        { id: 'P-g-4', name: '競技会' },
        { id: 'P-g-5', name: 'クロスカントリー飛行' },
        { id: 'P-g-6', name: '危機管理' }
      ]
    },
    'パラグライディングクロスカントリー技能証課程': {
      '実技': [
        { id: 'K-z-1', name: 'ランディング5' },
        { id: 'K-z-2', name: 'ローリング(45度)' },
        { id: 'K-z-3', name: '緊急降下手段2' },
        { id: 'K-z-4', name: 'クロスカントリー練習飛行' }
      ],
      '学科': [
        { id: 'K-g-1', name: 'フライトの準備2' },
        { id: 'K-g-2', name: '飛行計画と報告' },
        { id: 'K-g-3', name: 'クロスカントリー飛行に必要な手続き' },
        { id: 'K-g-4', name: '大気の安定度2' },
        { id: 'K-g-5', name: '気象情報の利用' },
        { id: 'K-g-6', name: '飛行情報の入手と判断' },
        { id: 'K-g-7', name: '安全なクロスカントリー' }
      ]
    }
  };

  connection.query(`
  SELECT dp.Grade, su.Name 
  FROM done_pdf dp
  JOIN school_users su ON dp.UserId = su.id 
  WHERE dp.UserId = ?`, 
  [userId], 
  (err, results) => {
    if (err) {
      res.status(500).send('Database error');
      return;
    }

    const completedUnits = results.map(result => ({
      grade: result.Grade,
      name: result.Name
    }));

    

    // EJSテンプレートをレンダリングし、データを渡す
    res.render('progress', { units, completedUnits });
  });
});


app.listen(PORT);
console.log(`Server running at ${PORT}`);