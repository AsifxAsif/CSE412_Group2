const modal = document.getElementById('uploadModal');
const fileInput = document.getElementById('file');
const fileNameDisplay = document.getElementById('file-name');
const fileList = document.getElementById('fileList');
const search = document.getElementById('search');

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

fileInput.addEventListener('change', () => {
    if (fileInput.files.length === 0) {
        fileNameDisplay.textContent = '';
        return;
    }
    const names = Array.from(fileInput.files).map(f => `• ${f.name}`).join('\n');
    fileNameDisplay.textContent = names;
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (fileInput.files.length === 0) {
        alert("Please select at least one file");
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('file[]', fileInput.files[i]);
    }

    try {
        await fetch('php/upload.php', {
            method: 'POST',
            body: formData
        });
    } catch (err) {
        console.error('Upload failed:', err);
        alert('File upload failed.');
    }

    fileInput.value = '';
    fileNameDisplay.textContent = '';
    closeModal();
    loadFiles();
});

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
                emptyMsg.textContent = 'No file uploaded';
                fileList.appendChild(emptyMsg);
                return;
            }

            data.forEach(file => {
                const item = document.createElement('div');
                item.className = 'file-item';
                const parts = file.split('/');
                const filename = parts[parts.length - 1];
                item.textContent = filename;
                fileList.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading files:', error);
            fileList.innerHTML = '<div class="file-item" style="text-align:center; color: #888;">Error loading files</div>';
        });
}

search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    const items = document.querySelectorAll('.file-item');
    items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});

window.onload = loadFiles;