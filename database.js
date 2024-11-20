//import package
const mysql = require('mysql2');
require('dotenv').config();
const { password, database } = process.env;

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 3,
    maxIdle: 3, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log(`Error getting a connection to the database:${err}`);
    }
    console.log(`Connected to the database`)

});


//create table for doctors
const doctorsTable = `CREATE TABLE IF NOT EXISTS doctors(
id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
specialization VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
phone VARCHAR(255) NOT NULL,
schedule DATETIME NOT NULL
);
`
pool.query(doctorsTable, (err, results) => {
    if (err) {
        console.log('Error creating doctors table:', err)
    }
    console.log(`Doctors table created successfully`);
});


//create table for patients
const patientsTable = `CREATE TABLE IF NOT EXISTS patients(
id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
password_hash VARCHAR(255) NOT NULL,
phone VARCHAR(255) NOT NULL,
date_of_birth DATE NOT NULL,
gender VARCHAR(255) NOT NULL,
address VARCHAR(255) NOT NULL,
CONSTRAINT doc_id FOREIGN KEY(id) REFERENCES doctors(id)
);`

pool.query(patientsTable, (err, results) => {
    if (err) {
        console.log('Error creating patients table:', err)
    }
    console.log(`Patients table created successfully`);
});

//create appointment table
const appointmentsTable = `CREATE  TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Canceled') DEFAULT 'Scheduled',
    FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
);`

pool.query(appointmentsTable, (err, results) => {
    if (err) {
        console.log('Error creating appointments table:', err)
    }
    console.log(`Appointments table created successfully`);
});

//create admin table
const adminTable = `CREATE TABLE IF NOT EXISTS admin(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) NOT NULL,
password_hash VARCHAR(255) NOT NULL,
role VARCHAR(255) NOT NULL
);`

pool.query(adminTable, (err, results) => {
    if (err) {
        console.log('Error creating admin table:', err)
    }
    console.log(`Admin table created successfully`);
});

//export the connection
module.exports = pool;