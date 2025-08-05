$(document).ready(function () {
    fetch('./navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbarContainer').innerHTML = data;
            AOS.init();
        })
        .catch(error => console.error('Error loading navbar:', error));

    fetchUserData();
    loadProjectTree();

    // Intercept form submission to handle password update via AJAX
    $("#updatePasswordForm").submit(function (e) {
        e.preventDefault(); // Prevent the default form submission

        const oldPassword = $("input[name='old_password']").val();
        const newPassword = $("input[name='new_password']").val();

        // Make the AJAX request
        $.ajax({
            url: 'php/update_password.php',
            type: 'POST',
            data: {
                old_password: oldPassword,
                new_password: newPassword
            },
            success: function (data) {
                // Data is already parsed as JSON (no need for JSON.parse)
                if (data.success) {
                    // Show success message
                    $('#message').html(`<span style="color: green;">${data.message}</span>`).fadeIn();
                    // Clear form fields
                    $("input[name='old_password']").val('');
                    $("input[name='new_password']").val('');

                    // Hide the message after 2 seconds
                    setTimeout(function () {
                        $('#message').fadeOut();
                    }, 2000);
                } else {
                    // Show error message
                    $('#message').html(`<span style="color: red;">${data.message}</span>`).fadeIn();

                    setTimeout(function () {
                        $('#message').fadeOut();
                    }, 2000);
                }
            },
            error: function (xhr, status, error) {
                // Handle error during the AJAX request
                $('#message').html(`<span style="color: red;">Error: ${error}</span>`).fadeIn();

                setTimeout(function () {
                    $('#message').fadeOut();
                }, 2000);
            }
        });
    });
});

function fetchUserData() {
    $.get('php/get_user.php', function (data) {
        if (data.success) {
            $('#username').val(data.user.username);
            $('#email').val(data.user.email);
        } else {
            alert("Error loading user data.");
        }
    });
}

// Toggle password visibility function
function togglePassword(passwordId, iconId) {
    const passwordField = document.getElementById(passwordId);
    const icon = document.getElementById(iconId);

    // Toggle the type between 'password' and 'text'
    if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// Load the project tree based on uploaded files and folders
function loadProjectTree() {
    $.get('php/get_project_tree.php', function (data) {
        console.log(data); // Log the response to the console
        if (data.success) {
            const tree = data.tree;
            console.log(tree); // Log the tree data

            if (typeof tree === 'object' && tree !== null) {
                let treeHtml = '';
                // Iterate over the object properties (categories)
                for (let category in tree) {
                    if (tree.hasOwnProperty(category)) {
                        treeHtml += generateTreeHtml(category, tree[category], true); // Include true to mark the first category level
                    }
                }
                $('#projectTree').html(treeHtml);
            } else {
                console.error('Tree is not an object:', tree);
            }
        } else {
            alert("Error loading project tree.");
        }
    });
}

// Generate the HTML for the project structure
function generateTreeHtml(category, subfolders, isRoot = false) {
    let html = '';

    // Display the category name only once at the root level
    if (isRoot) {
        html += `<li class="py-1">📁 ${category}</li>`;
    }

    // If the category has subfolders, generate the subfolder tree
    if (Array.isArray(subfolders)) {
        html += `<ul class="pl-4 space-y-1">`;

        subfolders.forEach(function (subfolder) {
            // Check if the item is a folder with subfolders
            if (subfolder.subfolders && subfolder.subfolders.length > 0) {
                // Display the folder name once, then recursively display subfolders
                html += `<li class="py-1">📁 ${subfolder.name}</li>`;
                html += generateTreeHtml(subfolder.name, subfolder.subfolders); // Recursively display nested subfolders
            }
            // If it's a file, display it with the correct icon
            else {
                const fileExtension = subfolder.name.split('.').pop();
                const icon = getFileIcon(fileExtension); // Get the correct icon for the file
                html += `<li class="py-1"><i class="fas ${icon}"></i> ${subfolder.name}</li>`; // File item
            }
        });

        html += `</ul>`;
    }

    return html;
}

// Function to get the file icon based on extension
function getFileIcon(extension) {
    const ext = extension.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'ico':
            return 'fa-image'; // Image icon
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'mkv':
            return 'fa-video'; // Video icon
        case 'xls':
        case 'xlsx':
        case 'xlsm':
        case 'csv':
            return 'fa-file-excel'; // Excel file icon
        case 'ppt':
        case 'pptx':
            return 'fa-file-powerpoint'; // PowerPoint file icon
        case 'mp3':
        case 'wav':
        case 'ogg':
            return 'fa-file-audio'; // Audio file icon
        case 'c':
        case 'cpp':
        case 'py':
        case 'java':
        case 'php':
        case 'js':
        case 'html':
        case 'css':
            return 'fa-file-code'; // Code file icon
        case 'doc':
        case 'docx':
            return 'fa-file-word'; // Word document icon
        case 'pdf':
            return 'fa-file-pdf'; // PDF file icon
        case 'txt':
        case 'md':
        case 'log':
            return 'fa-file-alt'; // Text file icon
        case 'zip':
        case 'rar':
            return 'fa-file-archive'; // Archive file icon
        default:
            return 'fa-file'; // Default file icon
    }
}
