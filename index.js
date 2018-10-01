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

const fs = require('fs');
const {google} = require('googleapis');
const express = require('express');
const app = express();

app.use(express.static('static'));

app.listen(3000, () => {
  console.log('server Running');
});
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = 'token.json';
var authUrl;
var oAuth2Client;

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken() {
    authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  app.get('/url', (req, res) => {
    res.send(authUrl);
  })
  app.get('/token', (req, res) => {
    console.log(req.query.code);
    oAuth2Client.getToken(req.query.code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });

  })

  /**
   * Lists the next 10 events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    console.log('callback');
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.delete({
      calendarId: 'primary',
      eventId: '6h0rvlq0bmee8t2if0g346dmcs'
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      console.log('Done'); 
    })
    // calendar.events.list({
    //   calendarId: 'primary',
    //   timeMin: (new Date()).toISOString(),
    //   maxResults: 10,
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // }, (err, res) => {
    //   if (err) return console.log('The API returned an error: ' + err);
    //   const events = res.data.items;
    //   if (events.length) {
    //     console.log('Upcoming 10 events:');
    //     events.map((event, i) => {
    //       const start = event.start.dateTime || event.start.date;
    //       console.log(`${start} - ${event.summary}`);
    //       console.log(`${event.id}`);
    //     });
    //   } else {
    //     console.log('No upcoming events found.');
    //   }
    // });
  }
  // [END calendar_quickstart]