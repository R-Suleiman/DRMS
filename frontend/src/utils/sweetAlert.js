import Swal from "sweetalert2";

/**
 * Show a success alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
export const showSuccessAlert = (title, text) => {
    Swal.fire({
        title: title || "Success!",
        text: text || "",
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
    });
};

/**
 * Show an error alert
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
export const showErrorAlert = (title, text) => {
    Swal.fire({
        title: title || "Error!",
        text: text,
        icon: "error",
    });
};

/**
 * Show a confirmation alert with a callback function
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 * @param {function} callback - Function to run on confirm
 */
export const showConfirmAlert = (title, text, callback) => {
    Swal.fire({
        title: title || "Are you sure?",
        text: text || "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed && callback) {
            callback();
        }
    });
};

/**
 * Show a success alert at the top of the screen
 * @param {string} title - Alert title
 * @param {string} text - Alert message
 */
export const showTopSuccessAlert = (title, text) => {
    Swal.fire({
        title: title || "Success!",
        text: text || "",
        timer: 3000,
        showConfirmButton: false,
        position: "top",
        toast: true,
        background: "#28a745",
        color: "#ffffff",
    });
};


/**
 *
 * @param {object} errors -
 */
export const showTopErrorAlert = (errors) => {
    let errorMessage = "";

    if (typeof errors === "object" && !Array.isArray(errors)) {
        errorMessage = Object.keys(errors)
            .map((key) => errors[key][0]) // get the first error message for each field
            .join("<br>");
    } else if (typeof errors === "string") {
        errorMessage = errors;
    } else {
        errorMessage = "Something went wrong.";
    }

    Swal.fire({
        title: "Error!",
        html: errorMessage,
        position: "top",
        toast: true,
        timer: 5000,
        showConfirmButton: false,
        background: "#dc3545",
        color: "#ffffff",
    });
};


