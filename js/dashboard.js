const modal = document.getElementById('uploadModal');
const renameModal = document.getElementById('renameModal'); // For rename modal
const fileInput = document.getElementById('file');
const fileNameDisplay = document.getElementById('file-name');
const fileList = document.getElementById('fileList');
const search = document.getElementById('search');
const viewFileModal = document.getElementById('viewFileModal'); // For view file modal
const viewFileContent = document.getElementById('viewFileContent'); // To show file content

// Open the upload modal
function openModal() {
    modal.classList.add('active');
}

// Close the modal
function closeModal() {
    // Close the upload modal
    modal.classList.remove('active');
    // Close the rename modal
    renameModal.classList.remove('active');

    // Pause the video if it is playing
    const video = document.querySelector('video');
    if (video) {
        video.pause(); // This will stop the video playback
    }

    // Pause the audio if it is playing
    const audio = document.querySelector('audio');
    if (audio) {
        audio.pause(); // This will stop the audio playback
    }
}

// File input event for displaying selected files
fileInput.addEventListener('change', () => {
    if (fileInput.files.length === 0) {
        fileNameDisplay.textContent = '';
        return;
    }
    const names = Array.from(fileInput.files).map(f => `• ${f.name}`).join('\n');
    fileNameDisplay.textContent = names;
});

// Function to check if the file already exists in the file list
function checkFileExists(fileName) {
    const existingFiles = document.querySelectorAll('.file-item span'); // Get all existing file names
    return Array.from(existingFiles).some(existingFile => existingFile.textContent === fileName);
}

// File upload form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (fileInput.files.length === 0) {
        alert("Please select at least one file");
        return;
    }

    const fileName = fileInput.files[0].name;

    // Check if the file already exists in the file list
    if (checkFileExists(fileName)) {
        alert(`A file named "${fileName}" already exists. Upload cancelled.`);
        return; // Stop the upload if the file exists
    }

    // Proceed with upload if the file does not exist
    uploadFile(fileName);
});

// Helper function to upload the file
async function uploadFile(fileName) {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]); // Append the selected file

    try {
        await fetch('php/upload.php', {
            method: 'POST',
            body: formData
        });
        loadFiles(); // Reload the file list after successful upload
    } catch (err) {
        console.error('Upload failed:', err);
        alert('File upload failed.');
    }

    fileInput.value = '';
    fileNameDisplay.textContent = '';
    closeModal();
}

// Load the files from the server
function loadFiles() {
    fetch('php/list_files.php')
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            fileList.innerHTML = '';

            if (!data || data.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'file-item';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.color = '#888';
                emptyMsg.textContent = 'No files uploaded';
                fileList.appendChild(emptyMsg);
                return;
            }

            const groupedFiles = groupFilesByDate(data);

            Object.keys(groupedFiles).forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'file-category';
                categoryDiv.innerHTML = `<h3>${category}</h3>`; // Display the formatted date as category

                groupedFiles[category].forEach(file => {
                    const item = document.createElement('div');
                    item.className = 'file-item';
                    const parts = file.filepath.split('/');
                    const filename = parts[parts.length - 1];
                    item.innerHTML = `
                        <span>${filename}</span>
                        <div class="file-actions">
                            <button class="view-btn" onclick="viewFile(${file.id})"><i class="fas fa-eye"></i></button>
                            <button class="rename-btn" onclick="renameFile(${file.id})"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="deleteFile(${file.id})"><i class="fas fa-trash-alt"></i></button>
                            <button class="download-btn" onclick="downloadFile(${file.id})"><i class="fas fa-download"></i></button>
                        </div>
                    `;
                    categoryDiv.appendChild(item);
                });

                fileList.appendChild(categoryDiv);
            });
        })
        .catch(error => {
            console.error('Error loading files:', error);
            fileList.innerHTML = '<div class="file-item" style="text-align: center;">Error loading files</div>';
        });
}

// Group files by date
function groupFilesByDate(files) {
    const groupedFiles = {};

    files.forEach(file => {
        const fileDate = new Date(file.upload_date);
        const month = fileDate.toLocaleString('default', { month: 'long' }); // Get full month name
        const day = fileDate.getDate(); // Get the day of the month
        const year = fileDate.getFullYear(); // Get the year

        // Format the date string
        const formattedDate = `${month} ${day}, ${year}`;

        // If the group doesn't exist yet, create it
        if (!groupedFiles[formattedDate]) {
            groupedFiles[formattedDate] = [];
        }

        // Push the file into the group
        groupedFiles[formattedDate].push(file);
    });

    return groupedFiles;
}

// Search files by name (exclude date categories)
search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    const fileItems = document.querySelectorAll('.file-item');
    const categories = document.querySelectorAll('.file-category'); // To target categories like dates

    // Loop through all file items
    fileItems.forEach(item => {
        const fileName = item.querySelector('span').textContent.toLowerCase(); // Get the file name
        if (fileName.includes(term)) {
            item.style.display = ''; // Show the file item if it matches the search term
        } else {
            item.style.display = 'none'; // Hide the file item if it doesn't match
        }
    });

    // Loop through all file categories (like dates) and hide those categories that contain only hidden files
    categories.forEach(category => {
        const visibleFiles = category.querySelectorAll('.file-item:not([style*="display: none"])');
        if (visibleFiles.length > 0) {
            category.style.display = ''; // Show the category if it has visible files
        } else {
            category.style.display = 'none'; // Hide the category if it has no visible files
        }
    });
});

// File view and download functions
function viewFile(fileId) {
    fetch(`php/get_files.php?id=${fileId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const fileExtension = data.filename.split('.').pop().toLowerCase(); // Get file extension
                let content = '';

                // Stop any previously playing video
                const previousVideo = document.querySelector('video');
                if (previousVideo) {
                    previousVideo.pause(); // Stop the previous video
                    previousVideo.currentTime = 0; // Reset video playback to start
                }

                // Stop any previously playing audio
                const previousAudio = document.querySelector('audio');
                if (previousAudio) {
                    previousAudio.pause(); // Stop the previous audio
                }

                // Display file content based on file type
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                    content = `<img src="${data.filepath}" alt="File Image" style="max-width: 100%; max-height: 500px;">`;
                } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
                    content = `<video id="viewFileVideo" controls style="max-width: 100%; max-height: 500px;">
                                  <source src="${data.filepath}" type="video/${fileExtension}">
                                  Your browser does not support the video tag.
                               </video>`;
                } else if (['pdf'].includes(fileExtension)) {
                    content = `<iframe src="${data.filepath}" width="100%" height="500px"></iframe>`;
                } else if (['pptx', 'xlsx'].includes(fileExtension)) {
                    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(data.filepath)}`;
                    content = `<iframe src="${viewerUrl}" width="100%" height="500px"></iframe>`;
                } else if (['txt', 'md', 'log', 'php', 'html', 'css', 'js'].includes(fileExtension)) {
                    fetch(data.filepath)
                        .then(response => response.text())
                        .then(textContent => {
                            content = `<pre>${textContent}</pre>`; // Display code or text in pre-formatted text
                            viewFileContent.innerHTML = content;
                        })
                        .catch(err => {
                            content = `<p>Unable to preview this file type.</p>`;
                            viewFileContent.innerHTML = content;
                        });
                } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                    content = `<audio controls style="max-width: 100%; max-height: 500px;">
                                  <source src="${data.filepath}" type="audio/${fileExtension}">
                                  Your browser does not support the audio tag.
                               </audio>`;
                } else {
                    content = `<p>Unable to preview this file type.</p>`;
                }

                // Insert content into modal
                const viewFileContent = document.getElementById('viewFileContent');
                viewFileContent.innerHTML = content;

                // Show the modal
                openViewFileModal(); 
            } else {
                alert('Error opening the file');
                console.error('Error:', data.error); // Log any error received
            }
        })
        .catch(err => {
            console.error('Error viewing file:', err);
            alert('Error opening the file');
        });
}

// Open the modal to view the file
function openViewFileModal() {
    const modal = document.getElementById('viewFileModal');
    modal.classList.add('active');
}

// Close the file view modal
function closeViewFileModal() {
    const modal = document.getElementById('viewFileModal');
    modal.classList.remove('active');
}

// Rename file function
function renameFile(fileId) {
    fetch(`php/get_files.php?id=${fileId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const newNameInput = document.getElementById('newFileName');
                newNameInput.value = data.filename;  // Set current filename in the input field

                openRenameModal();  // Show the rename modal

                const renameForm = document.getElementById('renameForm');
                renameForm.onsubmit = function (e) {
                    e.preventDefault();
                    const newFileName = newNameInput.value;
                    if (newFileName) {
                        fetch(`php/rename_file.php?id=${fileId}&newName=${newFileName}`)
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    alert('File renamed successfully');
                                    loadFiles(); // Reload files after renaming
                                    closeRenameModal(); // Close the rename modal after success
                                } else {
                                    alert('Error renaming the file');
                                }
                            });
                    }
                };
            } else {
                alert('Error fetching the current file name');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error fetching the current file name');
        });
}

// Close the rename modal
function closeRenameModal() {
    renameModal.classList.remove('active'); // Close the rename modal
}

// Open the rename modal
function openRenameModal() {
    renameModal.classList.add('active');
}

// Delete file function
function deleteFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        fetch(`php/delete_file.php?id=${fileId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('File deleted successfully');
                    loadFiles();
                } else {
                    alert('Error deleting the file');
                }
            });
    }
}

// Download file function
function downloadFile(fileId) {
    window.location.href = `php/download_file.php?id=${fileId}`;
}

// Initialize files on page load
window.onload = loadFiles;
