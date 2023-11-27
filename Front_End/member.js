// Function to handle form submission
const handleFormSubmit = async (e) => {
    e.preventDefault();

    document.getElementById('loader').style.display = 'block';

    try {
        // Get form data
        const formData = {
            name: document.getElementById('nameInput').value,
            email: document.getElementById('emailInput').value,
            subject: document.getElementById('subjectInput').value,
            message: document.getElementById('messageInput').value
        };

        // // Call the sendMailDummy function with the form data
        await sendMailDummy(formData);

    } catch (error) {
        ErrorDiv.innerText = 'Function is not Calling'
    } finally {
        // Hide loader regardless of success or error
        document.getElementById('loader').style.display = 'none';
    }
};

document.getElementById("myForm").addEventListener("submit", handleFormSubmit)
const ErrorDiv = document.getElementById("errorMessage")
const SuccessDiv = document.getElementById("successMessage")

const sendMailDummy = async (formData) => {
    ErrorDiv.innerText = "";
    SuccessDiv.innerText = "";
    ErrorDiv.style = "";
    SuccessDiv.style = "";
    try {
        const response = await fetch('http://localhost:3000/mailchimp-proxy', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();

        if (response.ok) {
            SuccessDiv.innerText = result.message
            SuccessDiv.style = result.style
            //alert(result.message)
        }
        else {
            ErrorDiv.innerText = result.message
            ErrorDiv.style = result.style
            //alert(result.message)
        }
    } catch (error) {
        ErrorDiv.innerText = 'Something went Wrong'
        //alert("Something went Wrong")
    }
}