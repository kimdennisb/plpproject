const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");

// parse data from the form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serving static files
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(__dirname, { dotfiles: "allow" }));

app.use(cookieParser());



// setting the view engine and for server to look at the views folder
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


require("dotenv");

const db = require("./database.js");

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/patients", verifyAdmin, (req, res) => {
    db.query(`SELECT * FROM patients`, (err, results) => {
        if (err) {
            console.log(`Error fetching patients`);
        }
        res.status(200).send(results);
    })

});


app.get("/appointments", verifyAdmin, (req, res) => {
    const query = `SELECT id,patient_id,doctor_id,appointment_time,status FROM APPOINTMENTS`;

    db.query(query, async (err, results) => {
        if (err) {
            console.log(`Error fetching appointments:${err}`);
        }
        let doctors;
        try {
            const allDoctors = results.map(async (appointment) => {

                const [doctor, fields1] = await db.promise().query(`SELECT * FROM DOCTORS WHERE id = '${appointment.doctor_id}' `);
                const [patient, fields2] = await db.promise().query(`SELECT * FROM PATIENTS WHERE id = '${appointment.patient_id}' `);

                appointment["doctor_name"] = `${doctor[0].first_name} ${doctor[0].last_name}`;
                appointment["patient_name"] = `${patient[0].first_name} ${patient[0].last_name}`;
                return appointment;
            }, []);

            doctors = await Promise.all(allDoctors)
        } catch (error) {
            console.log(error)
        }
        res.render("appointments.ejs", { data: doctors })
    })
});

app.get("/patientappointments", verifyToken, async (req, res) => {

    const email = req.email;

    const [patientID, fields] = await db.promise().query(`SELECT id FROM PATIENTS WHERE email = '${email}'`);
    console.log(email, patientID, `working well`)

    const query = `SELECT id,patient_id,doctor_id,appointment_time,status FROM APPOINTMENTS WHERE patient_id=${patientID[0].id}`;

    db.query(query, async (err, results) => {
        if (err) {
            console.log(`Error fetching appointments:${err}`);
        }
        let allAppointments;
        try {
            const appointments = results.map(async (appointment) => {

                const [doctor, fields1] = await db.promise().query(`SELECT * FROM DOCTORS WHERE id = '${appointment.doctor_id}' `);

                appointment["doctor_name"] = `${doctor[0].first_name} ${doctor[0].last_name}`;
                return appointment;
            });

            allAppointments = await Promise.all(appointments)
        } catch (error) {
            console.log(error)
        }
        res.render("appointments.ejs", { data: allAppointments })
    })
});

app.get("/admin", verifyAdmin, (req, res) => {
    db.query(`SELECT * FROM admin`, (err, results) => {
        if (err) {
            console.log(`Error fetching admin`);
        }
        res.status(200).send(results);
    })
});

app.get("/registerpatients", (req, res) => {
    res.render("patientregistration.ejs");
});

app.get("/registeradmin", (req, res) => {
    res.render("adminregistration.ejs");
})

app.get("/loginpatients", (req, res) => {
    const refer = req.query.refer || "";
    res.render("patientlogin.ejs", { refer: refer });

});

app.get("/loginadmin", (req, res) => {
    const refer = req.query.refer || "";
    res.render("adminlogin.ejs", { refer: refer });
});

app.get("/adddoctors", verifyAdmin, (req, res) => {
    res.render("adddoctor.ejs");
});

app.get("/doctors", verifyAdmin, (req, res) => {
    const query = `SELECT  first_name, last_name, email, phone, specialization, schedule FROM doctors`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error fetching doctors:${err}`);
        }
        res.render("displaydoctors.ejs", { data: results });
    })

})

app.get("/bookappointment", verifyToken, (req, res) => {
    const query = `SELECT id,first_name,last_name,specialization,email,phone,schedule FROM doctors`;

    //select only schedules that have not been selected by this user
    const appointments = `SELECT doctor_id,patient_id FROM appointments INN`

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error fetching doctors:${err}`);
        }

        res.render("bookappointment.ejs", { data: results })
    })

});



app.post("/registerpatients", async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO patients(first_name,last_name,email,password_hash,phone,date_of_birth,gender,address)
    VALUES('${first_name}','${last_name}','${email}','${password_hash}','${phone}','${date_of_birth}','${gender}','${address}')`;

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error registering patients:${err}`);
        }
        console.log(results);
    })

});

app.post("/registerdoctors", async (req, res) => {
    const { first_name, last_name, email, phone, specialization, selectedSchedule } = req.body;

    const schedule = String(selectedSchedule);

    const query = `INSERT INTO doctors(first_name,last_name,specialization,email,phone,schedule)
     VALUES('${first_name}','${last_name}','${specialization}','${email}','${phone}','${schedule}')`;

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error registering doctor:${err}`);
        }
        console.log(results);
    })

});

app.post("/registeradmin", async (req, res) => {
    const { username, password } = req.body;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `INSERT INTO admin(username,password_hash)
    VALUES('${username}','${password_hash}')`;

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error registering admin:${err}`);
        }
        console.log(results);
    })

});


app.post("/loginpatients", (req, res) => {
    const { email, password } = req.body;
    const refer = req.query.refer;
    const query = `SELECT email,password_hash FROM patients WHERE email = '${email}'`;
    db.query(query, async (err, results) => {
        if (err) {
            console.log(`Error retreiving credentials: ${err}`)
        }

        const { password_hash } = results[0];
        const comparison = await bcrypt.compare(password, password_hash);

        if (comparison) {
            const token = jwt.sign({ email: email }, 'your-secret-key');

            res.cookie('jwttoken', token, { maxAge: 3 * 60 * 60 * 1000, httpOnly: true });
            refer == "" ? res.redirect("/patientprofile") : res.redirect(`/${refer}`);
        }

    })
});

app.post("/loginadmin", (req, res) => {
    const { username, password } = req.body;
    const refer = req.query.refer;

    const query = `SELECT username,password_hash FROM admin WHERE username = '${username}'`;
    db.query(query, async (err, results) => {
        if (err) {
            console.log(`Error retreiving credentials: ${err}`)
        }

        const { password_hash } = results[0];
        const comparison = await bcrypt.compare(password, password_hash);

        if (comparison) {
            const token = jwt.sign({ username: username }, 'your-secret-admin-key');
            res.cookie('jwtadmintoken', token, { maxAge: 3 * 60 * 60 * 1000, httpOnly: true })
            refer == "" ? res.redirect("/adminprofile") : res.redirect(`/${refer}`);
        }

    })
});

app.post("/bookappointment", verifyToken, async (req, res) => {
    const { bookeddate, selectedDoctor } = req.body;
    const [appointment_date, appointment_time] = bookeddate.split("T")
    const email = req.email;

    db.query(`SELECT id FROM patients WHERE email = '${email}'`, (err, results) => {
        if (err) {
            console.log(`Error fetching patient:${err}`)
        }
        let id = results[0].id

        const query = `INSERT INTO appointments(patient_id,doctor_id,appointment_date,appointment_time)
     VALUES('${id}','${selectedDoctor}','${appointment_date}','${appointment_time}')`;
        db.query(query, (err, results) => {
            if (err) {
                console.log(`Error booking the appointment:${err}`)
            }
            console.log(results);
        })
    });

});

//middleware function for verification
function verifyToken(req, res, next) {

    const refer = String(req.route.path).split("/")[1];

    const token = req.cookies.jwttoken;

    //redirect to login page and attach the url to redirect to as a query
    if (!token) return res.redirect(`/loginpatients?refer=${refer}`);

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.email = decoded.email;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

function verifyAdmin(req, res, next) {
    const refer = String(req.route.path).split("/")[1];

    const token = req.cookies.jwtadmintoken;

    //redirect to login page and attach the url to redirect to as a query
    if (!token) return res.redirect(`/loginadmin?refer=${refer}`);
    try {
        const decoded = jwt.verify(token, 'your-secret-admin-key');
        req.username = decoded.username;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};



//update patient profile
app.put("/editpatient", verifyToken, (req, res) => {
    const email = req.email;
    const { first_name, last_name, address, gender, phone } = req.body;

    const query = `UPDATE patients SET first_name="${first_name}",last_name="${last_name}",address="${address}",gender="${gender}",phone="${phone}" WHERE email='${email}'`;

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error updating profile:${err}`);
        }
        res.json(results);
    })
});

//update doctor profile
app.put("/editdoctor", verifyAdmin, (req, res) => {

    const { first_name, last_name, phone, schedule, email } = req.body;

    const query = `UPDATE doctors SET first_name="${first_name}",last_name="${last_name}",schedule="${schedule}",phone="${phone}" WHERE email='${email}'`;


    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error updating profile:${err}`);
        }
        res.json(results);
    })
});

//update appointment
app.put("/editappointment", (req, res) => {

    const { id, status } = req.body;

    const query = `UPDATE appointments SET status="${status}" WHERE id=${id}`;

    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error updating appointment:${err}`);
        }
        res.json(results);
    })
});




app.get("/patientprofile", verifyToken, (req, res) => {
    const email = req.email;
    const query = `SELECT first_name,last_name,email,phone,date_of_birth,gender,address FROM patients WHERE email = '${email}'`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error fetching profile:${err}`);
        }
        res.render("patientprofile.ejs", { data: results })
    });
});

app.get("/adminprofile", verifyAdmin, (req, res) => {
    const username = req.username;
    const query = `SELECT id,username FROM admin WHERE username = '${username}'`;
    db.query(query, (err, results) => {
        if (err) {
            console.log(`Error fetching profile:${err}`);
        }
        res.render("adminprofile.ejs", { data: results })
    });
});

app.get("/logout", (req, res) => {
    const token = req.cookies.jwttoken;
    if (!token) return res.status(401).json({ error: 'Access denied' });
    res.clearCookie("jwttoken");
    res.redirect("/");
});

app.get("/logoutadmin", (req, res) => {
    const token = req.cookies.jwtadmintoken;
    if (!token) return res.status(401).json({ error: 'Access denied' });
    res.clearCookie("jwtadmintoken");
    res.redirect("/");
});

const PORT = 3000;

app.listen(PORT, (err) => {
    if (err) { console.log(`Error listening to port: ${PORT} with log ${err}`) };
    console.log(`Listening on port ${PORT}`);
})