/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// [START calendar_quickstart]

const {google} = require('googleapis');
const express = require('express');
const fs = require('fs');
const app = express();


  // Load client secrets from a local file.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
const keys = JSON.parse(fs.readFileSync('credentials.json'));

// Create an oAuth2 client to authorize the API call
const oAuth2Client = new google.auth.OAuth2(
  keys.installed.client_id,
  keys.installed.client_secret,
  keys.installed.redirect_uris[0]
  );

// Generate the url that will be used for authorization
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

app.use(express.static('static'));

app.get('/url', (req, res) => {
  res.send(authUrl);
})

app.get('/token', (req, res) => {
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, 
      JSON.stringify(token), (err) => {
      if (err) console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
  });
})

app.get('/events', (req, res) => {
  if (req.query.type) {
    listEvents().then((e) => {
      res.send(e);
      if (e.length) {
        console.log('Upcoming 10 events:');
        e.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    });
    // 
  }
})

app.listen(3000, () => {
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return console.log('Not token.');
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('Active token.');
    //callback(oAuth2Client);
  });
  console.log('server Running...');
});
// If modifying these scopes, delete token.json.

var events;
  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  // function listEvents(auth) {
  //   const calendar = google.calendar({version: 'v3', auth});
  //   calendar.events.list({
      // calendarId: 'primary',
      // timeMin: (new Date()).toISOString(),
      // maxResults: 10,
      // singleEvents: true,
      // orderBy: 'startTime',
  //   }, (err, res) => {
  //     if (err) return console.log('The API returned an error: ' + err);
  //     events = res.data.items;

  //     if (events.length) {
  //       console.log('Upcoming 10 events:');
  //       events.map((event, i) => {
  //         const start = event.start.dateTime || event.start.date;
  //         console.log(`${start} - ${event.summary}`);
  //         console.log(`${event.id}`);
  //       });
  //       // return events;
  //     } else {
  //       console.log('No upcoming events found.');
  //     }
  //   });  
  // }
  async function listEvents() {
    const calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client
    });
    
    const params = {
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    };
    return new Promise((resolve, reject) => {
      calendar.events.list(params, (err, res) => {resolve(res.data.items);})
    })
  }
  // [END calendar_quickstart]