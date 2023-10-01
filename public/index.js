const search = document.getElementById('search');
const matchList = document.getElementById('medicineList');

// Function to set up autocomplete for a specific input element
const setupAutocomplete = (inputElement) => {
    inputElement.addEventListener("input", function () {
        searchMedicines(this.value, inputElement);
    });
};

// Function to search for medicines and update autofill
const searchMedicines = async (searchText, inputElement) => {
    let matches = [];
    if (searchText.length >= 3) {
        const res = await fetch('./medicine_data.json');
        const medicines = await res.json();

        matches = medicines.filter(medicine => {
            const regex = new RegExp(`^${searchText}`, 'gi');
            return regex.test(medicine.drug) || regex.test(medicine.abbr);
        });
    } else {
        matches = []; // Clear the autocomplete list when input is less than 3 characters
    }

    outputHtml(matches, inputElement);
};

// Function to update the autocomplete list for a specific input element
const outputHtml = (matches, inputElement) => {
    const matchList = inputElement.nextElementSibling;
    console.log(inputElement.nextElementSibling);
    const html = matches.map(match => `
    <li>
      <button type="button"><h4>${match.drug}</h4></button>
    </li>`
    ).join('');

    matchList.innerHTML = html;

    const buttons = matchList.querySelectorAll('li');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const medicineName = this.querySelector('h4').textContent;
            inputElement.value = medicineName; // Set the selected suggestion to the input
            matchList.innerHTML = '';
            fetch("/contact", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: medicineName }),
            })
                .then(function (response) {
                    if (response.status === 200) {
                        // Request was successful, handle it here
                        console.log("Request succeeded");
                    } else {
                        // Handle non-successful responses here
                        console.error("Request failed with status:", response.status);
                    }
                })
                .catch(function (err) {
                    console.error(err);
                });
        });
    });
}; // Clear the autocomplete

// Add an event listener to the search input field to trigger the autocomplete
setupAutocomplete(search);

// Add an event listener to the button to trigger the addition of a new input
document.getElementById("add").addEventListener("click", function () {
    const inputContainer = document.getElementById("input-container");

    // Create a new input element
    const newInput = document.createElement("input");
    newInput.placeholder = "e.g crocin";
    newInput.type = "text";
    newInput.className = "validate drop-down";

    // Create a div to hold the autocomplete list for the new input
    const autoCompleteList = document.createElement("ul");
    autoCompleteList.className = "autocomplete-list";

    // Insert the new input element and autocomplete list before the button's parent node
    inputContainer.insertBefore(newInput, this.parentElement);
    inputContainer.insertBefore(autoCompleteList, this.parentElement);

    // Set up autocomplete for the new input element
    setupAutocomplete(newInput);
});

$(document).ready(function () {
    $(".submit").click(function () {
        console.log("1");
        // Make an AJAX POST request to /submit
        fetch('/submit')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Access the HTML element where you want to display the JSON data
                if (data.interactions.length > 0) {
                    // Display interactions on your web page
                    data.interactions.forEach(function (interaction) {
                        $("#interactionList").append(
                            "<li>" +
                            "Name: " + interaction.name + "<br>" +
                            "Severity: " + interaction.severity + "<br>" +
                            "Description: " + interaction.description +
                            "</li>"
                        );
                    });
                }
                // Set the content of the result container with the HTML string
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

    });
});