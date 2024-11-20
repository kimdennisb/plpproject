const schedules = document.querySelector(".schedules");
const addSchedules = document.querySelectorAll("#schedule");

//adding schedules while registering doctors
addSchedules.forEach((addSchedule) => {
    if (addSchedule) {
        addSchedule.addEventListener("change", () => {
            const p = document.createElement("p");
            const input = document.createElement("input");
            input.type = "text";
            input.value = addSchedule.value;
            input.readOnly = true;
            p.appendChild(input);
            input.insertAdjacentHTML("afterend", `<svg width="18" height="18" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
<title>Delete schedule</title>
<path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
class="show" </svg> `);
            if (schedules) {
                schedules.appendChild(p);
            } else if (assignedschedules) {
                //assignedschedules.appendChild(p)
            }
            input.nextElementSibling.addEventListener("click", function () {
                p.remove();
            });
        });
    }

});

const editButton = document.querySelectorAll(".editdoctorprofile svg.edit");
const rows = Array.from(document.querySelectorAll("tbody tr"));
const gender = document.querySelector("select");

editButton.forEach((button, index) => {
    const inputFields = rows[index].querySelectorAll("input");
    const assignedschedules = rows[index].querySelector(".assignedschedules");
    const uploadButton = button.nextElementSibling;

    //listen to each edit button for each doctor profile row and toggle the upload button to show.
    //make the input fields editable
    button.addEventListener("click", () => {
        const deleteSchedule = rows[index].querySelectorAll(".assignedschedules svg");
        inputFields.forEach((field) => field.disabled = false);
        button.classList.toggle("hideedit");
        uploadButton.classList.toggle("showupload");

        //toggle the delete schedule button to show and delete the schedule
        deleteSchedule.forEach((deleteButton) => {
            deleteButton.classList.toggle("show");
            deleteButton.addEventListener("click", function () {
                this.parentElement.remove();
            });
        });

        //add a input field for adding new schedules
        const p = document.createElement("p");
        p.className = "addschedule"
        const input = document.createElement("input");
        input.type = "datetime-local";
        input.name = "selectedSchedule";
        p.appendChild(input);
        input.insertAdjacentHTML("afterend", `<svg width="18" height="18" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
<title>Delete schedule</title>
<path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
 </svg> `);

        //append the datetime-local picker
        assignedschedules.appendChild(p);

        //listen for a change in datetime-local and save the schedule to the list of schedules
        input.addEventListener("change", function () {

            //add a new schedule
            const p = document.createElement("p");
            const input = document.createElement("input");
            input.type = "datetime-local";
            input.name = "schedule";
            input.value = this.value;
            p.appendChild(input);
            input.insertAdjacentHTML("afterend", `<svg class="show" width="18" height="18" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
<title>Delete schedule</title>
<path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
 </svg> `);

            assignedschedules.insertAdjacentElement("afterbegin", p);
        });
    });


    const obj = {};
    uploadButton.addEventListener("click", () => {
        const email = rows[index].querySelector(".doctoremail").textContent;
        const scheduleTime = [];
        Array.from(rows[index].querySelectorAll("input")).map((field) => {
            let nameOfSpan = field.getAttribute("name");
            if (nameOfSpan != "schedule") {
                obj[nameOfSpan] = String(field.value).replace(/\s/g, "");
            } else if (nameOfSpan == "schedule") {
                scheduleTime.push(String(field.value).replace(/\s/g, ""));
            }

            field.disabled = true;
        });

        obj["schedule"] = String(scheduleTime);
        obj["email"] = String(email).replace(/\s/g, "");

        // upload the edited part to database
        fetch("/editdoctor", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        }).then(response => response.json())
            .then(data => console.log(data));


        button.classList.toggle("hideedit");
        uploadButton.classList.toggle("showupload");
        //query again all the schedules(together with the added ones)
        const deleteSchedule = rows[index].querySelectorAll(".assignedschedules svg");
        deleteSchedule.forEach((deleteButton) => deleteButton.classList.toggle("show"));
        //delete addschedule modal
        const addScheduleInput = rows[index].querySelector(".addschedule");
        addScheduleInput.remove();
    });

});


const editAppointmentProfile = document.querySelectorAll(".appointments svg.edit");
const appointmentRows = Array.from(document.querySelectorAll("tbody tr"));

editAppointmentProfile.forEach((button, index) => {
    //select options for appointment status
    const selectedStatus = appointmentRows[index].querySelector("select")


    //upload button for updating appointment status
    const uploadButton = button.nextElementSibling;

    button.addEventListener("click", () => {

        //toggle edit and upload buttons
        button.classList.toggle("hideedit");
        uploadButton.classList.toggle("showupload");

        //make dropdown list selectable
        selectedStatus.disabled = false;

    });

    const obj = {};
    uploadButton.addEventListener("click", () => {

        //make dropdown list unselectable
        selectedStatus.disabled = true;

        const status = selectedStatus.options[selectedStatus.selectedIndex].value;
        obj["status"] = status;
        obj["id"] = appointmentRows[index].getAttribute("class");

        // upload the edited part to database
        fetch("/editappointment", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                location.reload();
            });
    })
})