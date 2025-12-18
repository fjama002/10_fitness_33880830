# Create the tables
create table if not exists classes (class_id int auto_increment primary key, name varchar(50), duration_minutes int);
create table if not exists class_schedule (schedule_id int auto_increment primary key, class_id int, day_of_week enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time time, foreign key (class_id) references classes(class_id));

# Create the application user
create user if not exists 'health_fitness_app'@'localhost' identified by 'qwertyuiop';
grant all priveleges on health_fitness.* to 'health_fitness_app'@'localhost';