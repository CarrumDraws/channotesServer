INSTALL ---------
bcrypt: Data encryption (Used for google_id)
body-parser: Process request body from Post, Put, Patch calls
cors: Cors policy
dotenv: Reading .env files
express: express
fs: File Manipulation (deleting files)
jsonwebtoken: JWT library
nodemon: server auto-start on update
multer: File Upload

socket.io: Websocket

Create database.sql file. idk why its there.
In SQLShell, login and nav to your DB

SUPABASE -------
npm install @supabase/supabase-js
run "supabase help" in Command Line to access SupaBase CLI
login with "supabase login" + access token
Create Tables with SQL Queries
Get All with "await supabase.from('tableName').select()"

TODO ------------
- How does image storage work for users without a profile picture?
- Should i be using Axios?
- Make tokens expire
- Password Protect Notes
- Delete Users

THINGS TO DO NEXT TIME ------
- Store images somewhere else!