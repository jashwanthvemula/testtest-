// controllers/calendarController.js
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const dayjs = require("dayjs");

require("dotenv").config();


const calendar = google.calendar({
	version: "v3",
	auth: process.env.AUTH_TOKEN // Replace with your OAuth token or move to environment variables
});


// OAuth 2.0 credentials
const CLIENT_ID = process.env.YOUR_CLIENT_ID;
const CLIENT_SECRET =process.env.CLIENT_SECRETs;
const REDIRECT_URI = process.env.REDIRECT_URIs;
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/calendar.events'];

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });


  const startTime = dayjs()
.year(2024)  // Set the year 
.month(3)    // Set the month(0-indexed)
.date(17)    // Set the date 
.hour(7+12)  // Set the hour
.minute(30)  // Set the minute 
.second(0)   // Set the second 
.millisecond(0); // Set the millisecond

const endTime = dayjs()
.year(2024)  // Set the year
.month(3)    // Set the month(0-indexed)
.date(17)    // Set the date 
.hour(8+12)     // Set the hour 
.minute(30)  // Set the minute 
.second(0)   // Set the second 
.millisecond(0); // Set the millisecond
  

// Export functions for route handling

module.exports = {
    createEvent: async (req, res) => {
        try {

            // Define the start and end time for the event
            // Check if there are any events overlapping with the specified time range
            const overlappingEvents = await calendar.events.list({
                calendarId: process.env.calendarId,
                auth: oAuth2Client,
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
                orderBy: "startTime"
            });
    
            if (overlappingEvents.data.items.length > 0) {
                // If there are overlapping events, reject the request
                return res.status(400).send("Selected time slot is not available. Please choose another time.");
            }
    
            // If no overlapping events, proceed with creating the event
            const response = await calendar.events.insert({
                calendarId:  process.env.calendarId,
                auth: oAuth2Client,
                requestBody: {
                    summary: "this is a test event",
                    description: "dbjbdujbjsfs",
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: "Asia/Kolkata",
                    }
                }
            });
    
            res.send({
                msg: "Event created successfully",
                eventId: response.data.id
            });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).send('Error creating event.');
        }
    },
    getBookedSlots: async (req, res) => {
        try {
            const response = await calendar.events.list({
                calendarId:  process.env.calendarId,
                auth: oAuth2Client,
                timeMin: (new Date()).toISOString(), // Filter events starting from now
                maxResults: 100, // Adjust as needed, max number of events to retrieve
                singleEvents: true,
                orderBy: "startTime"
            });
    
            const bookedSlots = response.data.items.filter(event => event.status === 'confirmed');
    
            res.send({
                msg: "Booked slots retrieved successfully",
                bookedSlots: bookedSlots
            });
        } catch (error) {
            console.error('Error retrieving booked slots:', error);
            res.status(500).send('Error retrieving booked slots.');
        }
    },
    getAvailableSlots: async (req, res) => {
       
    },
    deleteEvent: async (req, res) => {
        try {
            const response = await fetch('http://localhost:3000/delete_event/k2o1ucmcifrsefqcv38fr4duek', {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Error deleting event');
            }
    
            const data = await response.json();
            console.log('Event deleted successfully:', data);
            res.send("success"); 
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ error: 'Error deleting event' }); 
        }
    },
    deleteEventById: async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const response = await calendar.events.delete({
            calendarId:  process.env.calendarId, // Specify the calendar ID
            eventId: eventId 
        });

        console.log('Event deleted successfully:', response.data);
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: "Error deleting event" });
    }
    },
    authenticate: async (req, res) => {
        try {
            const { code } = req.query;
            const {tokens} = await oAuth2Client.getToken(code)
            oAuth2Client.setCredentials(tokens);
            res.send('Authorization successful. You can close this window.');
          } catch (error) {
            console.error('Error retrieving access token:', error);
            res.status(500).send('Error retrieving access token.');
          }
    },
    redirectToAuth: async (req, res) => {
        res.redirect(authUrl);
    }

    
};
