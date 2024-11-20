const selectDoctor = document.querySelector("select");

const className = selectDoctor.options[selectDoctor.selectedIndex].className;
//place the value of input field which is the id of initial doctor before selection;
const inputForDoctor = document.querySelector(".inputForDoctor");
inputForDoctor.value = className;

const inputs = document.querySelector("[for='doctorschedule']")
const inputWithThisClassName = inputs.getElementsByClassName(`${className}`)

//make the first selection on page load show the available schedules
Array.from(inputWithThisClassName).forEach((input) => {
    input.classList.toggle("show");
})
//listen for change in the select dropdown and toggle the class to show or hide the schedules
selectDoctor.addEventListener("change", () => {
    const inputForDoctor = document.querySelector(".inputForDoctor");
    const className = selectDoctor.options[selectDoctor.selectedIndex].className;
    inputForDoctor.value = className;

    Array.from(inputs.querySelectorAll("p")).forEach((p) => p.classList.toggle("show"))
})
const checkedInputs = inputs.querySelectorAll("[type='radio']");
checkedInputs.forEach((checkedInput) => {

    checkedInput.addEventListener("change", () => {

        if (checkedInput.checked) {
            checkedInput.previousElementSibling.name = "bookeddate";
        }
    })
}
)