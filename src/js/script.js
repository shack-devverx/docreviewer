alert('ATTN USER: select the folder button on the toolbar to choose a local folder of documents and images for review. This is a CONFIDENTIAL PROTOTYPE for demonstration purposes only. No other use is permitted. © 2024 Adam J Schwartz, All Rights Reserved');

        // Help button functionality
        document.getElementById('help-button').addEventListener('click', function() {
            const helpWindow = document.getElementById('help-window');
            helpWindow.style.display = 'block';
        });

        // Close help window
        document.getElementById('close-help').addEventListener('click', function() {
            const helpWindow = document.getElementById('help-window');
            helpWindow.style.display = 'none';
        });

        let pdfDoc = null,
            pageNum = 1,
            pageCount = 0,
            zoomLevel = 1.25,
            rotationAngle = 0,
            currentDocIndex = 0,
            canvas = document.getElementById('pdf-canvas'),
            ctx = canvas.getContext('2d'),
            fileArray = [],
            pinnedDocs = JSON.parse(localStorage.getItem('pinnedDocs')) || [];

        let tags = JSON.parse(localStorage.getItem('tags')) || [];
        let selectedTagIndex = null;

        // Show the tag popup when Add Tag button is clicked
        document.getElementById('add-tag').addEventListener('click', () => {
            document.getElementById('tag-popup').style.display = 'block';
            document.getElementById('tag-input').value = '';
            document.getElementById('tag-color').value = '#007BFF';
            document.getElementById('error-message').style.display = 'none';  // Hide error message on popup open
            selectedTagIndex = null;
            updateTagList();
        });

        // Close the tag popup when the close button is clicked
        document.getElementById('close-tag-popup').addEventListener('click', () => {
            document.getElementById('tag-popup').style.display = 'none';
        });

        // Save a new or edited tag with color
        document.getElementById('save-tag').addEventListener('click', (event) => {
            event.stopPropagation();  // Prevent closing the alert on button click
            const tagName = document.getElementById('tag-input').value.trim();
            const tagColor = document.getElementById('tag-color').value;
            const errorMessage = document.getElementById('error-message');

            // Prevent empty tag creation
            if (!tagName) {
                errorMessage.textContent = "Tag name can't be empty!";
                errorMessage.style.display = 'block';
                return;
            }

            // Check if the maximum number of tags has been reached
            if (tags.length >= 9 && selectedTagIndex === null) {
                errorMessage.textContent = "You can only create a maximum of 9 tags.";
                errorMessage.style.display = 'block';
                return;
            }

            // Check for duplicates
            const tagExists = tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
            if (tagExists && selectedTagIndex === null) {
                errorMessage.textContent = "A tag with this name already exists.";
                errorMessage.style.display = 'block';
                return;
            }

            // Clear error message upon successful tag creation
            errorMessage.style.display = 'none';

            if (selectedTagIndex !== null) {
                // Update the selected tag
                tags[selectedTagIndex] = { name: tagName, color: tagColor };
            } else {
                // Add a new tag
                tags.push({ name: tagName, color: tagColor });
            }

            saveTagsToLocalStorage();
            document.getElementById('tag-input').value = '';
            document.getElementById('tag-color').value = '#007BFF';
            selectedTagIndex = null;
            updateTagList();
            updateTagDropdown();
        });

        // Delete the selected tag when trash icon is clicked
        document.getElementById('delete-tag').addEventListener('click', (event) => {
            event.stopPropagation();  // Prevent closing the alert on button click
            const errorMessage = document.getElementById('error-message');

            if (selectedTagIndex !== null) {
                tags.splice(selectedTagIndex, 1);
                saveTagsToLocalStorage();
                updateTagList();
                updateTagDropdown();
                selectedTagIndex = null;
                document.getElementById('tag-input').value = '';
                document.getElementById('tag-color').value = '#007BFF';
                errorMessage.style.display = 'none';  // Clear any previous error message
            } else {
                errorMessage.textContent = "Please select a tag to delete.";
                errorMessage.style.display = 'block';
            }
        });

        // Function to hide the alert when clicking anywhere in the pop-up
        document.getElementById('tag-popup').addEventListener('click', () => {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'none';  // Hide the error message
        });

        // Function to prevent hiding the alert when clicking on input fields or buttons
        document.querySelectorAll('#tag-popup input, #tag-popup button').forEach(element => {
            element.addEventListener('click', (event) => {
                event.stopPropagation();  // Prevent event bubbling to the parent
            });
        });

        // Function to update the displayed tag list
        function updateTagList() {
            const tagList = document.getElementById('tag-list');
            tagList.innerHTML = '';  // Clear previous list

            tags.forEach((tag, index) => {
                const li = document.createElement('li');
                li.textContent = tag.name;
                li.style.backgroundColor = tag.color;
                li.style.color = getContrastColor(tag.color);

                // Add click event to toggle the selected state
                li.addEventListener('click', (event) => {
                    event.stopPropagation();  // Prevent closing the alert when clicking on tags

                    // Remove 'selected' class from all tags
                    document.querySelectorAll('#tag-list li').forEach(item => item.classList.remove('selected'));

                    // Add 'selected' class to the clicked tag
                    li.classList.add('selected');
                    selectedTagIndex = index;

                    // Update input fields with selected tag data
                    document.getElementById('tag-input').value = tag.name;
                    document.getElementById('tag-color').value = tag.color;
                });

                tagList.appendChild(li);
            });
        }

        // Helper function to determine text color based on background
        function getContrastColor(hexcolor) {
            hexcolor = hexcolor.replace('#', '');
            const r = parseInt(hexcolor.substr(0, 2), 16);
            const g = parseInt(hexcolor.substr(2, 2), 16);
            const b = parseInt(hexcolor.substr(4, 2), 16);
            const yiq = (r * 299 + g * 587 + b * 114) / 1000;
            return yiq >= 128 ? 'black' : 'white';
        }

        // Save tags to local storage
        function saveTagsToLocalStorage() {
            localStorage.setItem('tags', JSON.stringify(tags));
        }

        // Function to update the dropdown dynamically with the latest tags
        function updateTagDropdown() {
            document.querySelectorAll('.tag-dropdown').forEach(dropdown => {
                dropdown.innerHTML = '<option value="">Select Tag</option>';
                tags.forEach(tag => {
                    const option = document.createElement('option');
                    option.value = tag.name;
                    option.textContent = tag.name;
                    dropdown.appendChild(option);
                });
            });
        }

        // Load tags from local storage when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            updateTagList();
            updateTagDropdown();
            updatePinnedDocsList();
        });

        // Update the list of pinned documents
        function updatePinnedDocsList() {
            const pinnedList = document.getElementById('pinned-list');
            pinnedList.innerHTML = ''; // Clear previous list

            pinnedDocs.forEach((doc, index) => {
                const li = document.createElement('li');
                li.textContent = doc.name;

                // Create the individual unpin button using the embedded SVG icon
                const unpinButton = document.createElement('span');
                unpinButton.innerHTML = `
                   <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" stroke="#FF000D" stroke-miterlimit="10"><path d="M10.431 11.319a1.84 1.84 0 0 1-.56 1.468c-.176.177-.416.162-.61-.032q-1.131-1.13-2.26-2.262c-.04-.037-.068-.087-.108-.14-.067.062-.11.101-.151.141-1.257 1.242-2.468 2.531-3.803 3.691-.615.536-1.253 1.044-1.883 1.563-.065.052-.147.084-.22.126h-.15c-.353-.151-.415-.415-.17-.723a42 42 0 0 1 3.548-3.976c.604-.59 1.198-1.193 1.809-1.802l-.116-.122-2.38-2.38c-.253-.253-.25-.474.013-.714a1.865 1.865 0 0 1 2.412-.102q.044.036.102.08l1.118-.96 3.904 3.903-.919 1.07q-.016.02-.038.055c.273.322.437.692.462 1.114zm6.05-6.544a.5.5 0 0 1-.104.192 1.39 1.39 0 0 1-1.55.303c-.075-.033-.122-.051-.19.027Q13.232 6.94 11.823 8.58L7.919 4.678l3.365-2.89c-.14-.278-.2-.565-.153-.873q.075-.487.431-.82a.39.39 0 0 1 .486-.023 1 1 0 0 1 .102.09l4.186 4.183c.12.12.197.254.146.427z" fill="#FF000D" stroke-width=".249"/><path d="M14.538 11.498 4.237 1.447" stroke-width=".746" stroke-linecap="round"/></g><defs><clipPath id="a"><path fill="#fff" d="M.244 0h16.252v16H.244z"/></clipPath></defs></svg>
                `;
                unpinButton.style.cursor = 'pointer';
                unpinButton.style.marginLeft = '10px';
                unpinButton.addEventListener('click', () => {
                    // Unpin only this specific document
                    unpinDocument(index);
                });

                // Create the tag dropdown
                const dropdown = document.createElement('select');
                dropdown.classList.add('tag-dropdown');
                dropdown.innerHTML = '<option value="">Select Tag</option>';
                tags.forEach(tag => {
                    const option = document.createElement('option');
                    option.value = tag.name;
                    option.textContent = tag.name;
                    dropdown.appendChild(option);
                });
                dropdown.addEventListener('change', () => {
                    const selectedTag = tags.find(tag => tag.name === dropdown.value);
                    if (selectedTag) {
                        addTagToDocument(doc, selectedTag);
                    }
                    dropdown.value = ''; // Reset dropdown after selection
                });

                // Create tag container
                const tagContainer = document.createElement('div');
                tagContainer.style.marginTop = '5px';
                if (doc.tags) {
                    doc.tags.forEach(assignedTag => {
                        const tagSpan = document.createElement('span');
                        tagSpan.textContent = assignedTag.name;
                        tagSpan.className = 'assigned-tag';
                        tagSpan.style.backgroundColor = assignedTag.color;
                        tagSpan.style.color = getContrastColor(assignedTag.color);

                        const removeIcon = document.createElement('span');
                        removeIcon.textContent = '✖';
                        removeIcon.style.marginLeft = '5px';
                        removeIcon.style.cursor = 'pointer';
                        removeIcon.addEventListener('click', () => removeTagFromDocument(doc, assignedTag));

                        tagSpan.appendChild(removeIcon);
                        tagContainer.appendChild(tagSpan);
                    });
                }

                li.appendChild(unpinButton);
                li.appendChild(dropdown);
                li.appendChild(tagContainer);
                pinnedList.appendChild(li);
            });

            savePinnedDocsToLocalStorage();
        }

        // Unpin a specific document
        function unpinDocument(index) {
            pinnedDocs.splice(index, 1); // Remove the document at the given index
            updatePinnedDocsList(); // Refresh the pinned list display
        }

        // Global Unpin Button - remove all pinned documents
        document.getElementById('unpin-all').addEventListener('click', () => {
            // Show a confirmation prompt
            const confirmUnpin = confirm("Are you sure you want to clear all pins and tags? This action cannot be undone. It is recommended you download the record of your pins and tags before proceeding. If you are sure you want to clear all the pins and tags, click delete.");

            if (confirmUnpin) {
                // If confirmed, clear all pinned documents and tags
                pinnedDocs = []; // Clear the pinned documents array
                updatePinnedDocsList(); // Refresh the pinned list display
                alert("All pins and tags have been cleared.");
            }
        });

        // Add tag to a document
        function addTagToDocument(doc, tag) {
            if (!doc.tags) doc.tags = [];
            if (!doc.tags.some(t => t.name === tag.name)) {
                doc.tags.push(tag);
                updatePinnedDocsList();
            }
        }

        // Remove tag from a document
        function removeTagFromDocument(doc, tag) {
            doc.tags = doc.tags.filter(t => t.name !== tag.name);
            updatePinnedDocsList();
        }

        // Save pinned documents to local storage
        function savePinnedDocsToLocalStorage() {
            localStorage.setItem('pinnedDocs', JSON.stringify(pinnedDocs));
        }

        // Load the tags and pinned documents when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            updateTagList();
            updatePinnedDocsList();
        });

        // Load selected document
function loadDocument(index) {
    if (index < 0 || index >= fileArray.length) return;
    currentDocIndex = index;
    const file = fileArray[index];

    // Hide all viewers before loading a new document
    hideAllViewers();

    // Determine if the file is a PDF, image, or other document type
    const isPDF = file.type === 'pdf';
    const isImage = file.type === 'image';

    // Enable or disable navigation, zoom, and rotate buttons based on the file type
    document.getElementById('prev-page').disabled = !isPDF; // Disable page navigation for non-PDFs
    document.getElementById('next-page').disabled = !isPDF; // Disable page navigation for non-PDFs
    document.getElementById('zoom-in').disabled = !(isPDF || isImage); // Enable for PDFs and images only
    document.getElementById('zoom-out').disabled = !(isPDF || isImage); // Enable for PDFs and images only
    document.getElementById('rotate').disabled = !(isPDF || isImage); // Enable for PDFs and images only

    if (isPDF) {
        displayPDF(file.content);
    } else if (file.type === 'docx') {
        displayDocx(file.content);
    } else if (file.type === 'xlsx') {
        displayXlsx(file.content);
    } else if (file.type === 'txt') {
        displayTxtFile(file.content);
    } else if (isImage) {
        displayImage(file.content);
    }

    document.getElementById('document-select').value = index;
}



        // Hide all viewers
        function hideAllViewers() {
            document.getElementById('pdf-viewer').style.display = 'none';
            document.getElementById('docx-viewer').style.display = 'none';
            document.getElementById('xlsx-viewer').style.display = 'none';
            document.getElementById('txt-viewer').style.display = 'none';
            document.getElementById('image-viewer').style.display = 'none';
        }

        // Display PDF files
        function displayPDF(fileUrl) {
            document.getElementById('pdf-viewer').style.display = 'block';
            pdfjsLib.getDocument({data: atob(fileUrl.split(',')[1])}).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                pageCount = pdfDoc.numPages;
                document.getElementById('page-count').textContent = pageCount;
                pageNum = 1; 
                rotationAngle = 0; 
                renderPage(pageNum);
            });
        }
        // Display Word documents (.docx) using Mammoth.js
        function displayDocx(fileUrl) {
            document.getElementById('docx-viewer').style.display = 'block';
            fetch(fileUrl)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
                .then(result => {
                    document.getElementById('docx-viewer').innerHTML = result.value;
                })
                .catch(console.error);
        }
        // Display Excel documents (.xlsx) using SheetJS
        function displayXlsx(fileUrl) {
            document.getElementById('xlsx-viewer').style.display = 'block';
            fetch(fileUrl)
                .then(response => response.arrayBuffer())
                .then(data => {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
                    document.getElementById('xlsx-viewer').innerHTML = html;
                })
                .catch(console.error);
        }
        // Display text (.txt) files
        function displayTxtFile(fileUrl) {
            document.getElementById('txt-viewer').style.display = 'block';
            fetch(fileUrl)
                .then(response => response.text())
                .then(text => {
                    document.getElementById('txt-viewer').innerText = text;
                })
                .catch(console.error);
        }
        // Display images
        function displayImage(fileUrl) {
            document.getElementById('image-viewer').style.display = 'block';
            document.getElementById('image-viewer').src = fileUrl;
        }
        // Function to render a PDF page with zoom and rotation
function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: zoomLevel, rotation: rotationAngle });

        // Adjust the canvas size based on the new viewport (to prevent squishing)
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Adjust the container's dimensions to fit the rotated/zoomed canvas
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            document.getElementById('page-num').textContent = num;
        });
    });
}

// Zoom In and Zoom Out functions
document.getElementById('zoom-in').addEventListener('click', () => {
    if (fileArray[currentDocIndex].type === 'pdf') {
        zoomLevel = Math.min(zoomLevel + 0.25, 3);  // Max zoom level is 3
        renderPage(pageNum);
    } else if (fileArray[currentDocIndex].type === 'image') {
        zoomLevel = Math.min(zoomLevel + 0.25, 3);  // Max zoom level for images
        adjustImageViewer();
    }
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (fileArray[currentDocIndex].type === 'pdf') {
        zoomLevel = Math.max(zoomLevel - 0.25, 0.5);  // Min zoom level is 0.5
        renderPage(pageNum);
    } else if (fileArray[currentDocIndex].type === 'image') {
        zoomLevel = Math.max(zoomLevel - 0.25, 0.5);  // Min zoom level for images
        adjustImageViewer();
    }
});

    // Rotate function
    document.getElementById('rotate').addEventListener('click', () => {
        rotationAngle = (rotationAngle + 90) % 360;  // Rotate by 90 degrees clockwise
        if (fileArray[currentDocIndex].type === 'pdf') {
            renderPage(pageNum);  // Re-render the page after rotation
        } else if (fileArray[currentDocIndex].type === 'image') {
            adjustImageViewer();  // Rotate image
        }
    });
    // Function to adjust the image viewer with zoom and rotation
    function adjustImageViewer() {
    const imageViewer = document.getElementById('image-viewer');
    imageViewer.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    imageViewer.style.maxWidth = `${100 * zoomLevel}%`;
    imageViewer.style.maxHeight = `${100 * zoomLevel}%`;
}
        // Page navigation for PDFs
        document.getElementById('prev-page').addEventListener('click', () => {
            if (pageNum > 1) {
                pageNum--;
                renderPage(pageNum);
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (pageNum < pageCount) {
                pageNum++;
                renderPage(pageNum);
            }
        });

        // Implement folder select button
        document.getElementById('folder-select').addEventListener('click', () => {
            document.getElementById('file-input').click();  // Trigger file input click
        });

        // Handle file uploads
        document.getElementById('file-input').addEventListener('change', (event) => {
            const newFiles = [];
            let filesProcessed = 0;

            for (const file of event.target.files) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileObj = {
                        name: file.name,
                        type: getFileType(file.name),
                        content: e.target.result
                    };
                    newFiles.push(fileObj);
                    filesProcessed++;

                    if (filesProcessed === event.target.files.length) {
                        // All files have been processed
                        fileArray = [...fileArray, ...newFiles];
                        saveFilesToLocalStorage();
                        populateDocumentSelect();
                        if (newFiles.length > 0) {
                            loadDocument(fileArray.length - 1); // Load the last added document
                        }
                    }
                };
                reader.readAsDataURL(file);
            }

            if (fileArray.length > 0) {
                loadDocument(0); // Load the first document by default
            }
        });

        // Function to save files to localStorage
        function saveFilesToLocalStorage() {
            localStorage.setItem('savedFiles', JSON.stringify(fileArray));
        }

        // Function to load files from localStorage
        function loadFilesFromLocalStorage() {
            const savedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
            fileArray = savedFiles;
        }

        // Helper function to get file type
        function getFileType(fileName) {
            if (fileName.endsWith('.pdf')) return 'pdf';
            if (/\.(docx)$/i.test(fileName)) return 'docx';
            if (/\.(xlsx)$/i.test(fileName)) return 'xlsx';
            if (fileName.endsWith('.txt')) return 'txt';
            if (/\.(jpeg|jpg|png|gif|tiff)$/i.test(fileName)) return 'image';
            return 'unknown';
        }

        // Populate dropdown with documents
        function populateDocumentSelect() {
            const docSelect = document.getElementById('document-select');
            docSelect.innerHTML = ''; // Clear previous options
            fileArray.sort((a, b) => a.name.localeCompare(b.name));
            fileArray.forEach((file, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = file.name;
                docSelect.appendChild(option);
            });

            // Update the selected option
            if (fileArray.length > 0) {
                docSelect.value = currentDocIndex;
            }

            // Add event listener for dropdown selection
            docSelect.addEventListener('change', (event) => {
                loadDocument(parseInt(event.target.value));
            });

            // Show/hide remove button based on selection
            updateRemoveButtonVisibility();
        }

        // Function to update remove button visibility
        function updateRemoveButtonVisibility() {
            const removeButton = document.getElementById('remove-file');
            removeButton.style.display = fileArray.length > 0 ? 'inline-block' : 'none';
        }

        // Add event listener for remove button
        document.getElementById('remove-file').addEventListener('click', () => {
            const docSelect = document.getElementById('document-select');
            const selectedIndex = parseInt(docSelect.value);
            if (selectedIndex >= 0) {
                fileArray.splice(selectedIndex, 1);
                saveFilesToLocalStorage();
                populateDocumentSelect();
                if (fileArray.length > 0) {
                    loadDocument(0);
                } else {
                    // Clear the viewer if no files remain
                    hideAllViewers();
                }
            }
        });

        // Load saved files when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            loadFilesFromLocalStorage();
            populateDocumentSelect();
            if (fileArray.length > 0) {
                loadDocument(0);
            }
            updateTagList();
            updatePinnedDocsList();
        });

        // Implement document pinning
        document.getElementById('flag-doc').addEventListener('click', () => {
            const currentDoc = fileArray[currentDocIndex];
            if (!pinnedDocs.includes(currentDoc)) {
                pinnedDocs.push(currentDoc);
                updatePinnedDocsList();
            }
        });

        // Update the export function to create separate columns for each tag
        document.getElementById('export-list').addEventListener('click', () => {
            if (pinnedDocs.length === 0) {
                alert("No pinned documents to export.");
                return;
            }

            // Step 1: Collect all unique tags from all documents
            let uniqueTags = [];
            pinnedDocs.forEach(doc => {
                if (doc.tags) {
                    doc.tags.forEach(tag => {
                        if (!uniqueTags.some(t => t.name === tag.name)) {
                            uniqueTags.push(tag);
                        }
                    });
                }
            });

            // Step 2: Start CSV content with header row
            let csvContent = "data:text/csv;charset=utf-8,Document Name," + uniqueTags.map(tag => tag.name).join(',') + "\n";

            // Step 3: Loop through each pinned document
            pinnedDocs.forEach(doc => {
                // Start the row with the document name
                let row = `${doc.name},`;

                // Step 4: For each tag in the uniqueTags list, add '1' or '0' depending on whether it's applied to the document
                uniqueTags.forEach(tag => {
                    const hasTag = doc.tags ? doc.tags.some(t => t.name === tag.name) : false;
                    row += hasTag ? '1,' : '0,'; // Add '1' if the tag is applied, '0' if it's not
                });

                // Remove the trailing comma and add the row to CSV content
                csvContent += row.slice(0, -1) + "\n";
            });

            // Step 5: Encode CSV content and trigger download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "pinned_documents_with_tags.csv");
            document.body.appendChild(link);

            link.click();
            document.body.removeChild(link);
        });

        // Implement navigation for documents (Next and Previous)
        document.getElementById('prev-doc').addEventListener('click', () => {
            if (currentDocIndex > 0) {
                loadDocument(currentDocIndex - 1);
            }
        });

        document.getElementById('next-doc').addEventListener('click', () => {
            if (currentDocIndex < fileArray.length - 1) {
                loadDocument(currentDocIndex + 1);
            }
        });

        // Implement search across all documents
document.getElementById('search').addEventListener('click', () => {
    const searchText = document.getElementById('search-text').value.toLowerCase();
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = ''; // Clear previous search results

    let found = false;  // Track if matches are found
    let searchPromises = [];

    fileArray.forEach((file, index) => {
        if (file.type === 'pdf') {
            // Search through PDFs
            const promise = pdfjsLib.getDocument({data: atob(file.content.split(',')[1])}).promise.then(pdfDoc_ => {
                return pdfDoc_.getPage(1).then(page => {
                    return page.getTextContent().then(textContent => {
                        const text = textContent.items.map(item => item.str).join(' ');
                        if (text.toLowerCase().includes(searchText)) {
                            found = true;
                            const li = document.createElement('li');
                            const link = document.createElement('a');
                            link.textContent = file.name;
                            link.href = "#";
                            link.style.color = 'white';
                            link.addEventListener('click', () => loadDocument(index));
                            li.appendChild(link);
                            resultsList.appendChild(li);
                        }
                    });
                });
            });
            searchPromises.push(promise);

        } else if (file.type === 'txt') {
            // Search through .txt files
            const promise = fetch(file.content)
                .then(response => response.text())
                .then(text => {
                    if (text.toLowerCase().includes(searchText)) {
                        found = true;
                        const li = document.createElement('li');
                        const link = document.createElement('a');
                        link.textContent = file.name;
                        link.href = "#";
                        link.style.color = 'white';
                        link.addEventListener('click', () => loadDocument(index));
                        li.appendChild(link);
                        resultsList.appendChild(li);
                    }
                });
            searchPromises.push(promise);

        } else if (file.type === 'docx') {
            // Search through .docx files
            const promise = fetch(file.content)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => mammoth.extractRawText({ arrayBuffer }))
                .then(result => {
                    const text = result.value;
                    if (text.toLowerCase().includes(searchText)) {
                        found = true;
                        const li = document.createElement('li');
                        const link = document.createElement('a');
                        link.textContent = file.name;
                        link.href = "#";
                        link.style.color = 'white';
                        link.addEventListener('click', () => loadDocument(index));
                        li.appendChild(link);
                        resultsList.appendChild(li);
                    }
                });
            searchPromises.push(promise);

        } else if (file.type === 'xlsx') {
            // Search through .xlsx files using SheetJS
            const promise = fetch(file.content)
                .then(response => response.arrayBuffer())
                .then(data => {
                    const workbook = XLSX.read(data, { type: 'array' });
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const text = XLSX.utils.sheet_to_csv(worksheet);
                        if (text.toLowerCase().includes(searchText)) {
                            found = true;
                            const li = document.createElement('li');
                            const link = document.createElement('a');
                            link.textContent = file.name;
                            link.href = "#";
                            link.style.color = 'white';
                            link.addEventListener('click', () => loadDocument(index));
                            li.appendChild(link);
                            resultsList.appendChild(li);
                        }
                    });
                });
            searchPromises.push(promise);
        }
    });

    // After all searches are done, check if any match was found
    Promise.all(searchPromises).then(() => {
        if (!found) {
            const li = document.createElement('li');
            li.textContent = "No matches found";
            li.style.color = 'white';
            resultsList.appendChild(li);
        }
    });
});


        // Implement search within the current document
        document.getElementById('search-doc').addEventListener('click', () => {
            const searchText = document.getElementById('search-text').value.toLowerCase();
            const resultsList = document.getElementById('results-list');
            resultsList.innerHTML = ''; // Clear previous search results

            if (fileArray[currentDocIndex].type === 'pdf') {
                let matches = [];

                for (let i = 1; i <= pageCount; i++) {
                    pdfDoc.getPage(i).then(page => {
                        page.getTextContent().then(textContent => {
                            const text = textContent.items.map(item => item.str).join(' ');
                            if (text.toLowerCase().includes(searchText)) {
                                matches.push(i);
                                const li = document.createElement('li');
                                const link = document.createElement('a');
                                link.textContent = `Page ${i}`;
                                link.href = "#";
                                link.style.color = 'white';
                                link.addEventListener('click', () => {
                                    pageNum = i;
                                    renderPage(pageNum);
                                });
                                li.appendChild(link);
                                resultsList.appendChild(li);
                            }
                        });
                    });
                }
                
            } else if (fileArray[currentDocIndex].type === 'txt') {
                fetch(fileArray[currentDocIndex].content)
                    .then(response => response.text())
                    .then(text => {
                        const lines = text.split('\n');
                        lines.forEach((line, index) => {
                            if (line.toLowerCase().includes(searchText)) {
                                const li = document.createElement('li');
                                li.textContent = `Line ${index + 1}: ${line}`;
                                li.style.color = 'white';
                                resultsList.appendChild(li);
                            }
                        });
                        if (resultsList.innerHTML === '') {
                            resultsList.innerHTML = '<li>No matches found</li>';
                        }
                    });
            
            } else {
                resultsList.innerHTML = '<li>Search is not supported for this file type</li>';
            }
        });

        // Search on Enter key
        document.getElementById('search-text').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                document.getElementById('search-doc').click();
            }
        });

        // Helper function to determine text color based on background color
        function getContrastColor(hexcolor) {
            // If a leading # is provided, remove it
            if (hexcolor.slice(0, 1) === '#') {
                hexcolor = hexcolor.slice(1);
            }

            // Convert to RGB value
            var r = parseInt(hexcolor.substr(0,2),16);
            var g = parseInt(hexcolor.substr(2,2),16);
            var b = parseInt(hexcolor.substr(4,2),16);

            // Get YIQ ratio
            var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

            // Check contrast
            return (yiq >= 128) ? 'black' : 'white';
        }