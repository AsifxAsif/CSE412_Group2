const allowedExtensions = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'ico'],
            'video': ['mp4', 'avi', 'mov', 'mkv'],
            'excel': ['xls', 'xlsx', 'xlsm', 'csv'],
            'ppt': ['ppt', 'pptx'],
            'audio': ['mp3', 'wav', 'ogg'],
            'code': ['c', 'cpp', 'py', 'java', 'php', 'js', 'html', 'css'],
            'documents': ['doc', 'docx', 'txt', 'pdf', 'md', 'log'],
            // 'other': [] // No need for 'other' here; it's determined by exclusion
        };

        // Create a flattened list of all known extensions for easy lookup
        const allKnownExtensions = Object.values(allowedExtensions).flat();

        let fileIdToDelete = null;

        // Function to get file icon based on extension
        function getFileIcon(extension) {
            const ext = extension.toLowerCase();
            switch (ext) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'ico':
                    return 'fas fa-image';
                case 'mp4':
                case 'avi':
                case 'mov':
                case 'mkv':
                    return 'fas fa-video';
                case 'xls':
                case 'xlsx':
                case 'xlsm':
                case 'csv':
                    return 'fas fa-file-excel';
                case 'ppt':
                case 'pptx':
                    return 'fas fa-file-powerpoint';
                case 'mp3':
                case 'wav':
                case 'ogg':
                    return 'fas fa-file-audio';
                case 'c':
                case 'cpp':
                case 'py':
                case 'java':
                case 'php':
                case 'js':
                case 'html':
                case 'css':
                    return 'fas fa-file-code';
                case 'doc':
                case 'docx':
                    return 'fas fa-file-word';
                case 'pdf':
                    return 'fas fa-file-pdf';
                case 'txt':
                case 'md':
                case 'log':
                    return 'fas fa-file-alt';
                case 'zip':
                case 'rar':
                    return 'fas fa-file-archive';
                default:
                    return 'fas fa-file';
            }
        }

        // Function to get thumbnail image based on file extension (if applicable)
        function getFileThumbnail(extension, filePath) {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            const correctedFilePath = filePath.startsWith('uploads/') ? filePath : `uploads/${filePath}`;

            // Check if the file is an image before attempting to show a thumbnail
            if (imageExtensions.includes(extension.toLowerCase())) {
                return `<img src="${correctedFilePath}" alt="Thumbnail" onerror="this.onerror=null;this.src='https://placehold.co/160x90/E0E0E0/333333?text=No+Preview';">`;
            }

            // If the file is not an image, show the correct file icon
            return `<div class="icon-placeholder"><i class="${getFileIcon(extension)}"></i></div>`;
        }


        $(document).ready(function () {
            // Load navbar
            fetch('./navbar.html')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('navbarContainer').innerHTML = data;
                    AOS.init();
                })
                .catch(error => console.error('Error loading navbar:', error));

            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const subfolder = urlParams.get('subfolder'); // Get subfolder parameter

            let pageTitle = '';
            let loadFilesCategory = null; // Variable to pass to loadFiles for PHP filtering
            let loadFilesSubfolder = null; // Variable to pass to loadFiles for PHP filtering
            let groupDates = true; // Default to grouping by date if no category/subfolder

            if (category) {
                // If a category is present
                loadFilesCategory = category;
                groupDates = false; // Don't group by date if a specific category is chosen

                if (subfolder) {
                    // If both category AND subfolder are present
                    pageTitle = `${subfolder.charAt(0).toUpperCase() + subfolder.slice(1)} Files`;
                    loadFilesSubfolder = subfolder; // Pass subfolder for PHP filtering
                } else {
                    // Only category, no subfolder
                    pageTitle = `${category.charAt(0).toUpperCase() + category.slice(1)} Files`;
                }
            } else {
                // No category or subfolder specified, show all files and group by date
                pageTitle = 'All Uploaded Files';
            }

            $('#folderTitle').text(pageTitle);
            loadFiles(loadFilesCategory, loadFilesSubfolder, groupDates);


            // Search functionality
            $('#searchFiles').on('keyup', function () {
                const searchTerm = $(this).val().toLowerCase();
                let anyFileFound = false;

                // Find all date group headings and hide them initially
                $('.date-group-heading').hide();

                // Iterate through all file cards
                $('.file-card').each(function () {
                    const fileName = $(this).data('file-name');
                    if (fileName && fileName.includes(searchTerm)) {
                        $(this).show();
                        // If a file is found, show its corresponding date heading
                        // Only show heading if date grouping is active
                        if (groupDates) {
                            $(this).prevAll('.date-group-heading').first().show();
                        }
                        anyFileFound = true;
                    } else {
                        $(this).hide();
                    }
                });

                // If no files are found at all, show a message
                if (!anyFileFound && $('#fileGrid').children(':visible').length === 0) {
                    $('#fileGrid').html('<p class="text-center text-white text-3xl font-bold p-4">No files match your search.</p>');
                } else if (anyFileFound && $('#fileGrid').find('p.text-center').length > 0) {
                    // If files are found after a previous "no files" message, re-load to rebuild the grid
                    // Re-load with original category and subfolder parameters
                    loadFiles(loadFilesCategory, loadFilesSubfolder, groupDates);
                }
            });

            $('#confirmDelete').on('click', function () {
                performDeleteFile();
            });
        });

        // Modified loadFiles to accept subfolder and a groupDates flag
        async function loadFiles(category = null, subfolder = null, groupDates = false) {
            try {
                // Construct URL for list_files.php based on parameters
                let fetchUrl = './php/list_files.php';
                const queryParams = [];

                if (category) {
                    queryParams.push(`category=${encodeURIComponent(category)}`);
                }
                if (subfolder) {
                    queryParams.push(`subfolder=${encodeURIComponent(subfolder)}`);
                }

                if (queryParams.length > 0) {
                    fetchUrl += '?' + queryParams.join('&');
                }

                const response = await fetch(fetchUrl);
                const allFiles = await response.json();

                if (!Array.isArray(allFiles)) {
                    console.error("Invalid data received from list_files.php");
                    $('#fileGrid').addClass('flex items-center justify-center min-h-[300px] w-full');
                    $('#fileGrid').html('<p class="text-center text-white text-xl p-4">Error: Could not retrieve file data.</p>');
                    return;
                }

                let filesToDisplay = allFiles;

                // Always sort files by upload_date in descending order (newest first)
                filesToDisplay.sort((a, b) => {
                    const dateA = new Date(a.upload_date);
                    const dateB = new Date(b.upload_date);
                    return dateB - dateA;
                });

                $('#fileGrid').empty(); // Clear existing content
                $('#fileGrid').removeClass('flex items-center justify-center min-h-[300px] w-full'); // Remove message styling

                // Hide the "No files found" message if there are files
                $('#noFilesMessage').addClass('hidden');

                if (filesToDisplay.length === 0) {
                    // Show the "No files found" message if no files are found
                    $('#noFilesMessage').removeClass('hidden');
                    return;
                }

                // Proceed with rendering files if they exist
                if (groupDates) {
                    const filesGroupedByDate = filesToDisplay.reduce((groups, file) => {
                        const uploadDate = file.upload_date ? new Date(file.upload_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
                        if (!groups[uploadDate]) {
                            groups[uploadDate] = [];
                        }
                        groups[uploadDate].push(file);
                        return groups;
                    }, {});

                    for (const dateHeading in filesGroupedByDate) {
                        const filesInDateGroup = filesGroupedByDate[dateHeading];

                        $('#fileGrid').append(`
                    <div class="col-span-full text-left text-2xl font-bold text-blue-500 mb-4 date-group-heading">
                        ${dateHeading}
                    </div>
                `);

                        filesInDateGroup.forEach(function (file) {
                            const fileName = file.filename;
                            const filePath = file.filepath;
                            const fileExtension = fileName.split('.').pop();
                            const uploadDateFormatted = file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A';

                            const fileCard = `
                        <div class="file-card glass" data-file-name="${fileName.toLowerCase()}" data-file-id="${file.id}">
                            <div class="file-thumbnail">
                                ${getFileThumbnail(fileExtension, filePath)}
                            </div>
                            <div class="file-details">
                                <h3 class="text-base font-semibold text-blue-700 truncate mb-1" title="${fileName}">${fileName}</h3>
                                <div class="flex items-center text-xs text-blue-500 mb-2">
                                    <span class="mr-2"><i class="fas fa-file-alt mr-1"></i> ${fileExtension.toUpperCase()} File</span>
                                </div>
                                <div class="text-xs text-blue-400 mb-3">
                                    <i class="fas fa-calendar-alt mr-1"></i> Uploaded: ${uploadDateFormatted}
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <button class="text-green-500 hover:text-green-700" onclick="downloadFile(${file.id})">
                                        <i class="fas fa-download mr-1"></i> Download
                                    </button>
                                    <button class="text-red-500 hover:text-red-700" onclick="deleteFile(${file.id})">
                                        <i class="fas fa-trash-alt mr-1"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                            $('#fileGrid').append(fileCard);
                        });
                    }
                } else {
                    filesToDisplay.forEach(function (file) {
                        const fileName = file.filename;
                        const filePath = file.filepath;
                        const fileExtension = fileName.split('.').pop();
                        const uploadDateFormatted = file.upload_date ? new Date(file.upload_date).toLocaleDateString() : 'N/A';

                        const fileCard = `
                    <div class="file-card glass" data-file-name="${fileName.toLowerCase()}" data-file-id="${file.id}">
                        <div class="file-thumbnail">
                            ${getFileThumbnail(fileExtension, filePath)}
                        </div>
                        <div class="file-details">
                            <h3 class="text-base font-semibold text-blue-700 truncate mb-1" title="${fileName}">${fileName}</h3>
                            <div class="flex items-center text-xs text-blue-500 mb-2">
                                <span class="mr-2"><i class="fas fa-file-alt mr-1"></i> ${fileExtension.toUpperCase()} File</span>
                            </div>
                            <div class="text-xs text-blue-400 mb-3">
                                <i class="fas fa-calendar-alt mr-1"></i> Uploaded: ${uploadDateFormatted}
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <button class="text-green-500 hover:text-green-700" onclick="downloadFile(${file.id})">
                                    <i class="fas fa-download mr-1"></i> Download
                                </button>
                                <button class="text-red-500 hover:text-red-700" onclick="deleteFile(${file.id})">
                                    <i class="fas fa-trash-alt mr-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                        $('#fileGrid').append(fileCard);
                    });
                }

            } catch (error) {
                console.error("Error loading files: ", error);
                $('#fileGrid').addClass('flex items-center justify-center min-h-[300px] w-full');
                $('#fileGrid').html('<p class="text-center text-white text-xl p-4">Failed to load files. Please try again later.</p>');
            }
        }

        // --- Delete Modal Functions ---
        function openDeleteModal() {
            $('#deleteModal').addClass('active');
            $('#deleteMessage').text('');
        }

        function closeDeleteModal() {
            const deleteModal = document.getElementById('deleteModal');
            if (deleteModal.classList.contains('active')) {
                deleteModal.classList.remove('active');
            }
            fileIdToDelete = null;
            $('#deleteMessage').text('');
        }

        // Function to open the delete modal and re-enable the delete button
        function deleteFile(fileId) {
            fileIdToDelete = fileId;

            // Re-enable the delete button in case it was disabled previously
            const deleteButton = $('#confirmDelete');
            deleteButton.prop('disabled', false); // Re-enable button
            deleteButton.css('background-color', ''); // Reset background color
            deleteButton.css('cursor', ''); // Reset cursor

            $.ajax({
                url: `./php/get_files.php?id=${fileId}`,
                method: 'GET',
                success: function (response) {
                    if (response.success) {
                        $('#deleteFileNameText').html(`Are you sure you want to delete <strong>"${response.filename}"</strong>?`);
                        openDeleteModal();
                    } else {
                        alert('Error: Could not retrieve file information for deletion.');
                        console.error('Error fetching file for delete:', response.error);
                    }
                },
                error: function (xhr, status, error) {
                    alert('Error: Could not connect to server to get file information.');
                    console.error('AJAX error fetching file for delete:', status, error);
                }
            });
        }

        // Modified performDeleteFile to disable the button after a successful deletion
        async function performDeleteFile() {
            if (!fileIdToDelete) {
                console.error('No file ID to delete.');
                return;
            }

            try {
                const response = await fetch(`./php/delete_file.php?id=${fileIdToDelete}`, {
                    method: 'DELETE'
                });

                const responseText = await response.text();
                console.log('Raw response from delete_file.php:', responseText);

                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (jsonError) {
                    console.error('JSON parsing error:', jsonError);
                    console.error('Response text that caused error:', responseText);
                    $('#deleteMessage').text('Server returned invalid response. Check console for details.');
                    $('#deleteMessage').css('color', 'red');
                    return;
                }

                const messageBox = $('#deleteMessage');
                const deleteButton = $('#confirmDelete'); // Get the delete button

                if (result.status === 'success') {
                    // Disable the delete button after successful deletion
                    deleteButton.prop('disabled', true); // Disable button
                    deleteButton.css('background-color', '#ccc'); // Optional: change button color to indicate it's disabled
                    deleteButton.css('cursor', 'not-allowed'); // Change cursor to 'not-allowed'

                    messageBox.text('File deleted successfully.');
                    messageBox.css('color', 'limegreen');

                    const urlParams = new URLSearchParams(window.location.search);
                    const category = urlParams.get('category');
                    const subfolder = urlParams.get('subfolder'); // Get subfolder again
                    // Reload files with current category and subfolder, maintaining grouping logic
                    const currentGroupDates = !category; // True if category is null/undefined
                    loadFiles(category, subfolder, currentGroupDates); // Pass subfolder to loadFiles
                    setTimeout(closeDeleteModal, 1000);
                } else {
                    messageBox.text(`Error deleting the file: ${result.message || 'Unknown error occurred.'}`);
                    messageBox.css('color', 'red');
                }
            } catch (err) {
                console.error('Error deleting file (network or unexpected):', err);
                $('#deleteMessage').text('An error occurred while deleting the file. Please check your network connection or server logs.');
                $('#deleteMessage').css('color', 'red');
            }
        }

        function downloadFile(fileId) {
            window.location.href = `./php/download_file.php?id=${fileId}`;
        }
