# Health & Fitness
## Overview
Health & Fitness is a gym booking app that allows users to explore gym locations, view weekly class schedules, book/cancel classes, and get in touch via a contact form. Logged-in users get a personalised experience, including a "My Bookings" view.

## Technologies 
### Languages:
- JavaScript (node.js) - server side logic
- HTML/EJS - templates to render dynamic pages
- CSS - style for frontend
- SQL (MySQL) - database queries

### Dependencies:
- Express - web framework for routing and server setup
- EJS - template engine to render dynamic HTML pages
- Express-session - session management and user login state
- Express-sanitizer - sanitises user inputs to prevent XSS attacks
- Express-validator - validates and sanitises form inputs
- Express-rate-limit - limits repeated login attempts to prevent brute-force attacks
- Bcrypt - hashes passwords securely
- MySQL2 - connects node.js to MySQL database

## How to run locally
1. Clone the repository: ```git clone https://github.com/fjama002/10_health_33880830```
2. Navigate to the project folder: ```cd 10_health_33880830```
3. Install dependencies: ```npm install```
4. Create a .env file in the project root with the following:
   ```HEALTH_HOST=localhost```  
   ```HEALTH_USER=health_app```  
   ```HEALTH_PASSWORD=qwertyuiop```  
   ```HEALTH_DATABASE=health```  
   ```HEALTH_BASE_PATH=http://localhost:8000```  
   *Note: These credentials are shown here only to match the values specified in the assignment brief, to make local installation straightforward for marking. .env is excluded from version control via .gitignore. In a real application, credentials would never be documented in a readme - they would be shared securely (e.g. a secrets manager or a private .env.example template with placeholder values) and rotated outside of source control entirely.*
5. Ensure databases and tables have been installed by running the following files in MySQL:
```create_db.sql```
```insert_test_data.sql```
6. Start the server: node index.js (in terminal, "Server running on: 8000" should be visible)
7. Open preferred browser and search http://localhost:8000

## Default Login
*Note: This username and password are provided to meet the assignment's requirement for a test login, and to make marking straightforward. Publishing login credentials in a readme is not a practice that would be followed in a real, production application.*
* Username: gold
* Password: smiths

## Features
### Home
* Displays a welcome page that dynamically includes user's name if logged in
* Mini introduction and aim of website
* Dynamically changing "quote of the day" with every refresh

### Gyms
* Search bar to filter gym locations by city
* Embedded Google Maps for each location

### Classes/Bookings
* Search bar to filter gym classes by name
* Shows weekly schedule of gym classes
* Option to book or cancel classes 
* "My Bookings" page showing a user's upcoming bookings with calculated end times

### About Us
* Picture of founder
* Short company description

### Contact Us
* Name, email and message form, stored in the database
* Confirmation message on successful submission

### Login
* Username and password inputs
* Redirects to home page

### Signup
* Forename, surname, email, username, password, confirm password inputs
* Displays success message and prompts to login

## Acknowledgements
Thank you to W3Schools (https://www.w3schools.com/) for tutorials on JavaScript, HTML, CSS and SQL.