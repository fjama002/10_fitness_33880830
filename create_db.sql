# Create the database
create database if not exists health_fitness;
use health_fitness;

# Create the tables
create table if not exists users (
    user_id int auto_increment primary key, 
    forename varchar(50) not null, 
    surname varchar(50) not null, 
    email varchar(100) not null unique, 
    username varchar(50) not null unique, 
    hashedpassword varchar(255) not null
);

create table if not exists classes (
    class_id int auto_increment primary key, 
    name varchar(50) not null unique, 
    duration_minutes int not null
);

create table if not exists class_schedule (
    schedule_id int auto_increment primary key, 
    class_id int not null, day_of_week enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') not null, 
    start_time time not null, 
    foreign key (class_id) references classes(class_id)
);

create table if not exists bookings (
    booking_id int auto_increment primary key,
    user_id int not null,
    schedule_id int not null,
    unique (user_id, schedule_id),
    foreign key (user_id) references users(user_id),
    foreign key (schedule_id) references class_schedule(schedule_id)
);

create table if not exists locations (
    location_id int auto_increment primary key, 
    city varchar(50) not null unique, 
    map_embed varchar(500) not null
);
    
create table if not exists contact_messages (
    message_id int auto_increment primary key,
    name varchar(50) not null,
    email varchar(100) not null,
    message text not null,
    submittime timestamp default current_timestamp
);

# Create the application user
create user if not exists 'health_fitness_app'@'localhost' identified by 'qwertyuiop';
grant all priveleges on health_fitness.* to 'health_fitness_app'@'localhost';