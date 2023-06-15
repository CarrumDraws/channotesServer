post(“/auth/login’) : Validates that Google ID is valid

post(“/folders”) : Adds Folder
post(“/folders/:folderid/move”) : Moves Folder
post(“/folders/:folderid/delete”) : Deletes Folder
post(“/folders/:folderid/rename”) : Renames Folder
Old: get(“/folders/:userid/folders”) : Gets Homepage Folders
New: get(“/folders/:userid”)
Old: get(“/folders/:userid/:folderid/folders”) : Gets Folders inside “Folder”
New: get(“/folders/:folderid/folders”)

post(“/notes”) : Adds Note
post(“/notes/:noteid/move”) : Moves Note
post(“/notes/:noteid/delete”) : Deletes Note
post(“/notes/:noteid/pin”) : Pins Note
post(“/notes/:noteid”) : Edit a Note’s Contents, Sets Time Accessed, Renames Note
post(“/notes/:noteid/password”) : Sets Password for Locking
post(“/notes“/:noteid/lock”) : Locks Note
post(“/notes/:noteid/color”) : Edit a Note’s Colors
patch(“/notes/:noteid/collab”) : Edit a Note’s Collaborators
get(“/notes/:userid/notes”) : Gets Homepage Notes
get(“/notes/:userid/:folderid/notes”) : Gets Notes inside “Folder”
get(“/notes/:userid/shared”) : Gets Shared Notes
get(“/notes/:userid/:friendid/shared”) : Get Shared Notes between User and Friend

post(“/users/:userid”) : Sets User Data
get(“/users/:userid/friends”) : Get Friends of User
patch(“/users/:userid/:friendid”) : Adds/Removes Friend
patch(“/users/:userid/:friendid/block”) : Blocks/Unblocks Friend
get(“/users/${query}”) : Get Users whose name starts with {query}
