DROP TABLE users CASCADE;
DROP TABLE folders CASCADE;
DROP TABLE notes CASCADE;
DROP TABLE notephotos CASCADE;
DROP TABLE shares CASCADE;
DROP TABLE friends CASCADE;
DROP TABLE blocks CASCADE;

CREATE TABLE users (
    chan_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    image VARCHAR(255)
);

CREATE TABLE folders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chan_id uuid, 
        CONSTRAINT fk_user 
            FOREIGN KEY (chan_id) 
                REFERENCES users(chan_id) ON DELETE CASCADE,
    folder_id uuid,
        CONSTRAINT fk_folder
            FOREIGN KEY (folder_id) 
                REFERENCES folders(id) ON DELETE CASCADE, 
    title VARCHAR(255) DEFAULT 'New Folder',
    date_created TIMESTAMP
);

CREATE TABLE notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chan_id uuid, 
        CONSTRAINT fk_user 
            FOREIGN KEY (chan_id) 
                REFERENCES users(chan_id) ON DELETE CASCADE,
    folder_id uuid, 
        CONSTRAINT fk_folder
            FOREIGN KEY (folder_id) 
                REFERENCES folders(id) ON DELETE CASCADE, 
    title VARCHAR(255) DEFAULT 'New Note',
    date_created TIMESTAMP,
    date_edited TIMESTAMP,
    text JSONB DEFAULT null,
    pinned BOOL DEFAULT false,
    locked BOOL DEFAULT false,
    password VARCHAR(255) DEFAULT '',
    font_color VARCHAR(255) DEFAULT '#000000',
    background_color VARCHAR(255) DEFAULT '#ffffff'
);

CREATE TABLE notephotos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id uuid, 
        CONSTRAINT fk_note
            FOREIGN KEY (note_id)
                REFERENCES notes(id) ON DELETE CASCADE,
    image VARCHAR(255),
    position VARCHAR(255)
);

CREATE TABLE shares (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chan_id_a uuid,
        CONSTRAINT fk_note
            FOREIGN KEY (chan_id_a) 
                REFERENCES users(chan_id) ON DELETE CASCADE, 
    note_id uuid,
        CONSTRAINT fk_user 
            FOREIGN KEY (note_id) 
                REFERENCES notes(id) ON DELETE CASCADE
);

CREATE TABLE friends (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chan_id_a uuid,
        CONSTRAINT fk_user 
            FOREIGN KEY (chan_id_a)
                REFERENCES users(chan_id) ON DELETE CASCADE,
    chan_id_b uuid,
        CONSTRAINT fk_friend
            FOREIGN KEY (chan_id_b)
                REFERENCES users(chan_id) ON DELETE CASCADE
);

CREATE TABLE blocks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    chan_id uuid,
        CONSTRAINT fk_user 
            FOREIGN KEY (chan_id)
                REFERENCES users(chan_id) ON DELETE CASCADE, 
    chan_id_a uuid, 
        CONSTRAINT fk_enemy 
            FOREIGN KEY (chan_id_a) 
                REFERENCES users(chan_id) ON DELETE CASCADE
);

SELECT * FROM users;
SELECT * FROM folders;
SELECT * FROM notes;
SELECT * FROM shares;
SELECT * FROM friends;
