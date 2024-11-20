const editButton = document.querySelector("svg.edit");
const uploadButton = document.querySelector("svg.upload")
const editFields = document.querySelectorAll(" td input");
const gender = document.querySelector("select");


editButton.addEventListener("click", () => {
    editFields.forEach((field) => field.disabled = false);
    gender.disabled = false;
    editButton.classList.toggle("hideedit");
    uploadButton.classList.toggle("showupload");
    gender.classList.toggle("hidearrow");
});

uploadButton.addEventListener("click", () => {
    const obj = {};
    Array.from(editFields).map((field) => {
        let nameOfSpan = field.getAttribute("name");

        obj[nameOfSpan] = String(field.value).replace(/\s/g, "");;
        field.disabled = true;
    });

    obj[gender.getAttribute("name")] = gender.options[gender.selectedIndex].value;
    gender.disabled = true;
    gender.classList.toggle("hidearrow");

    //upload the edited part to database
    fetch("/editpatient", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            location.reload();
        });

    editButton.classList.toggle("hideedit");
    uploadButton.classList.toggle("showupload");

});