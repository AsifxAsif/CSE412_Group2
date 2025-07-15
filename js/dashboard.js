const modal = document.getElementById('uploadModal');
const renameModal = document.getElementById('renameModal');
const fileInput = document.getElementById('file');
const fileNameDisplay = document.getElementById('file-name');
const fileList = document.getElementById('fileList');
const search = document.getElementById('search');

function openModal() {
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    renameModal.classList.remove('active');
    const video = document.querySelector('video');
    if (video) {
        video.pause();
    }
    const audio = document.querySelector('audio');
    if (audio) {
        audio.pause();
    }
}

fileInput.addEventListener('change', () => {
    if (fileInput.files.length === 0) {
        fileNameDisplay.textContent = '';
        return;
    }
    const names = Array.from(fileInput.files).map(f => `• ${f.name}`).join('\n');
    fileNameDisplay.textContent = names;
});

function checkFileExists(fileName) {
    const existingFiles = document.querySelectorAll('.file-item span');
    return Array.from(existingFiles).some(existingFile => existingFile.textContent === fileName);
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (fileInput.files.length === 0) {
        alert("Please select at least one file");
        return;
    }

    const fileName = fileInput.files[0].name;

    if (checkFileExists(fileName)) {
        alert(`A file named "${fileName}" already exists. Upload cancelled.`);
        openModal();
        return;
    }
    uploadFile();
});

async function uploadFile() {
    const formData = new FormData();

    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('file[]', fileInput.files[i]);
    }

    try {
        const response = await fetch('php/upload.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('Upload failed with status: ', response.status);
            alert('File upload failed.');
            return;
        }

        const result = await response.text();
        console.log('Upload result:', result);

        loadFiles();
    } catch (err) {
        console.error('Upload failed:', err);
        alert('File upload failed.');
    }

    fileInput.value = '';
    fileNameDisplay.textContent = '';
    closeModal();
}

function loadFiles() {
    fetch('php/list_files.php')
        .then(res => res.json())
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
                categoryDiv.innerHTML = `<h3>${category}</h3>`;
                groupedFiles[category].forEach(file => {
                    const item = document.createElement('div');
                    item.className = 'file-item';
                    const filename = file.filepath.split('/').pop();
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

function groupFilesByDate(files) {
    const groupedFiles = {};
    files.forEach(file => {
        const fileDate = new Date(file.upload_date);
        const formattedDate = `${fileDate.toLocaleString('default', { month: 'long' })} ${fileDate.getDate()}, ${fileDate.getFullYear()}`;
        if (!groupedFiles[formattedDate]) {
            groupedFiles[formattedDate] = [];
        }
        groupedFiles[formattedDate].push(file);
    });
    return groupedFiles;
}

search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    const fileItems = document.querySelectorAll('.file-item');
    const categories = document.querySelectorAll('.file-category');

    fileItems.forEach(item => {
        const fileName = item.querySelector('span').textContent.toLowerCase();
        if (fileName.includes(term)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    categories.forEach(category => {
        const visibleFiles = category.querySelectorAll('.file-item:not([style*="display: none"])');
        if (visibleFiles.length > 0) {
            category.style.display = '';
        } else {
            category.style.display = 'none';
        }
    });
});

function viewFile(fileId) {
    fetch(`php/get_files.php?id=${fileId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const fileExtension = data.filename.split('.').pop().toLowerCase();
                let content = '';

                const previousVideo = document.querySelector('video');
                if (previousVideo) {
                    previousVideo.pause();
                    previousVideo.currentTime = 0;
                }

                const previousAudio = document.querySelector('audio');
                if (previousAudio) {
                    previousAudio.pause();
                }

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
                            content = `<pre>${textContent}</pre>`;
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

                const viewFileContent = document.getElementById('viewFileContent');
                viewFileContent.innerHTML = content;

                openViewFileModal();
            } else {
                alert('Error opening the file');
                console.error('Error:', data.error);
            }
        })
        .catch(err => {
            console.error('Error viewing file:', err);
            alert('Error opening the file');
        });
}

function openViewFileModal() {
    const modal = document.getElementById('viewFileModal');
    modal.classList.add('active');
}

function closeViewFileModal() {
    const modal = document.getElementById('viewFileModal');
    modal.classList.remove('active');
}

function renameFile(fileId) {
    fetch(`php/get_files.php?id=${fileId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const newNameInput = document.getElementById('newFileName');
                newNameInput.value = data.filename;

                openRenameModal();

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
                                    loadFiles();
                                    closeRenameModal();
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

function closeRenameModal() {
    renameModal.classList.remove('active');
}

function openRenameModal() {
    renameModal.classList.add('active');
}

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

function downloadFile(fileId) {
    window.location.href = `php/download_file.php?id=${fileId}`;
}

window.onload = loadFiles;

