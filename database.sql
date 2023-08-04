-- Don't do anything with this lmao

CREATE DATABASE ChanNotes;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    image VARCHAR(255)
);

CREATE TABLE folders (
    id SERIAL PRIMARY KEY,
    user_id INT, -- Foreign Key
        CONSTRAINT fk_user -- Name the Constraint
            FOREIGN KEY (user_id) -- Link...
                REFERENCES users(id), -- ...Together.
    folder_id INT, -- Foreign Key
        CONSTRAINT fk_folder -- Name the Constraint
            FOREIGN KEY (folder_id) -- Link...
                REFERENCES folders(id), -- ...Together.
    title VARCHAR(255),
    date_created TIMESTAMP,
    date_edited TIMESTAMP
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INT, -- Foreign Key
        CONSTRAINT fk_user -- Name the Constraint
            FOREIGN KEY (user_id) -- Link...
                REFERENCES users(id), -- ...Together.
    folder_id INT, -- Foreign Key
        CONSTRAINT fk_folder -- Name the Constraint
            FOREIGN KEY (folder_id) -- Link...
                REFERENCES folders(id), -- ...Together.
    title VARCHAR(255),
    date_created TIMESTAMP,
    date_edited TIMESTAMP,
    text TEXT,
    locked BOOL,
    password VARCHAR(255),
    fontColor VARCHAR(255),
    backgroundColor VARCHAR(255)
);

CREATE TABLE notephotos (
    id SERIAL PRIMARY KEY,
    note_id INT, -- Foreign Key
        CONSTRAINT fk_note -- Name the Constraint
            FOREIGN KEY (note_id) -- Link...
                REFERENCES notes(id), -- ...Together.
    image VARCHAR(255),
    position VARCHAR(255)
);

CREATE TABLE shares (
    note_id INT, -- Foreign Key
        CONSTRAINT fk_note -- Name the Constraint
            FOREIGN KEY (note_id) -- Link...
                REFERENCES notes(id), -- ...Together.
    user_id INT, -- Foreign Key
        CONSTRAINT fk_user -- Name the Constraint
            FOREIGN KEY (user_id) -- Link...
                REFERENCES users(id) -- ...Together.
);

CREATE TABLE friends (
    user_id INT, -- Foreign Key
        CONSTRAINT fk_user -- Name the Constraint
            FOREIGN KEY (user_id) -- Link...
                REFERENCES users(id), -- ...Together.
    friend_id INT, -- Foreign Key
        CONSTRAINT fk_friend -- Name the Constraint
            FOREIGN KEY (friend_id) -- Link...
                REFERENCES users(id) -- ...Together.
);

CREATE TABLE blocks (
    user_id INT, -- Foreign Key
        CONSTRAINT fk_user -- Name the Constraint
            FOREIGN KEY (user_id) -- Link...
                REFERENCES users(id), -- ...Together.
    enemy_id INT, -- Foreign Key
        CONSTRAINT fk_enemy -- Name the Constraint
            FOREIGN KEY (enemy_id) -- Link...
                REFERENCES users(id) -- ...Together.
);

SELECT * FROM notes;