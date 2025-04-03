/*
 * Copyright (c) Adam J Schwartz
 * Author: DevVerx
 * URL: devverx.com
 */

document.getElementById("help-button").addEventListener("click", function () {
    document.getElementById("help-window").style.display = "block";
}),
    document.getElementById("close-help").addEventListener("click", function () {
        document.getElementById("help-window").style.display = "none";
    });
let pdfDoc = null,
    pageNum = 1,
    pageCount = 0,
    zoomLevel = 1.25,
    rotationAngle = 0,
    currentDocIndex = 0,
    canvas = document.getElementById("pdf-canvas"),
    ctx = canvas.getContext("2d"),
    fileArray = [],
    pinnedDocs = JSON.parse(localStorage.getItem("pinnedDocs")) || [],
    tags = JSON.parse(localStorage.getItem("tags")) || [],
    selectedTagIndex = null,
    renderTask = null;
let isRendering = false;

function updateTagList() {
    let e = document.getElementById("tag-list");
    (e.innerHTML = ""),
        tags.forEach((t, n) => {
            let o = document.createElement("li");
            (o.textContent = t.name),
                (o.style.backgroundColor = t.color),
                (o.style.color = getContrastColor(t.color)),
                o.addEventListener("click", (e) => {
                    e.stopPropagation(),
                        document.querySelectorAll("#tag-list li").forEach((e) => e.classList.remove("selected")),
                        o.classList.add("selected"),
                        (selectedTagIndex = n),
                        (document.getElementById("tag-input").value = t.name),
                        (document.getElementById("tag-color").value = t.color);
                }),
                e.appendChild(o);
        });
}
function getContrastColor(e) {
    return 128 <= (299 * parseInt((e = e.replace("#", "")).substr(0, 2), 16) + 587 * parseInt(e.substr(2, 2), 16) + 114 * parseInt(e.substr(4, 2), 16)) / 1e3 ? "black" : "white";
}
function saveTagsToLocalStorage() {
    localStorage.setItem("tags", JSON.stringify(tags));
}
function updateTagDropdown() {
    document.querySelectorAll(".tag-dropdown").forEach((n) => {
        (n.innerHTML = '<option value="">Select Tag</option>'),
            tags.forEach((e) => {
                var t = document.createElement("option");
                (t.value = e.name), (t.textContent = e.name), n.appendChild(t);
            });
    });
}
function updatePinnedDocsList() {
    let d = document.getElementById("pinned-list");
    d.innerHTML = "";

    // Only show Select All if there are pinned docs
    if (pinnedDocs.length > 0) {
        // Add "Select All" checkbox
        let selectAllCheckbox = document.createElement("input");
        selectAllCheckbox.type = "checkbox";
        selectAllCheckbox.id = "select-all-pinned";
        selectAllCheckbox.addEventListener("change", function () {
            const allCheckboxes = document.querySelectorAll(".pinned-checkbox");
            allCheckboxes.forEach(checkbox => checkbox.checked = this.checked);
            updateDeleteButtonState();
        });

        let selectAllLabel = document.createElement("label");
        selectAllLabel.textContent = "Select All";
        selectAllLabel.htmlFor = "select-all-pinned";

        d.appendChild(selectAllCheckbox);
        d.appendChild(selectAllLabel);
    }

    pinnedDocs.forEach((o, e) => {
        let t = document.createElement("li");

        // Add checkbox for each pinned document
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "pinned-checkbox";
        checkbox.addEventListener("change", updateDeleteButtonState);
        t.appendChild(checkbox);

        // Create a link for the document name
        let docLink = document.createElement("a");
        docLink.textContent = o.name;
        docLink.href = "#";
        docLink.style.cursor = "pointer";
        docLink.classList.add("pin-a-doc");
        docLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default anchor behavior
            const docIndex = fileArray.findIndex(file => file.name === o.name);
            if (docIndex !== -1) {
                loadDocument(docIndex); // Load the document
                // Scroll to the document viewer
                document.getElementById("pdf-canvas").scrollIntoView({ behavior: "smooth" });
            }
        });
        t.appendChild(docLink);

        // Add tag dropdown (moved to the left side)
        let a = document.createElement("select");
        a.classList.add("tag-dropdown");
        a.innerHTML = '<option value="">Select Tag</option>';
        tags.forEach((e) => {
            var t = document.createElement("option");
            t.value = e.name;
            t.textContent = e.name;
            a.appendChild(t);
        });
        a.addEventListener("change", () => {
            var e = tags.find((e) => e.name === a.value);
            e && addTagToDocument(o, e);
            a.value = "";
        });
        t.appendChild(a);

        // Add delete icon (moved to the right side)
        var n = document.createElement("span");
        (n.innerHTML = `
            <svg fill="#fff" width="16" height="16" viewBox="-3 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"></path></svg>
         `),
            n.style.cursor = "pointer";
        n.classList.add("tag-trash");
        n.style.marginLeft = "auto"; // Move to the right side
        n.addEventListener("click", () => {
            unpinDocument(e);
        });
        t.appendChild(n);

        // Add tags container
        let l = document.createElement("div");
        l.style.marginTop = "5px";
        if (o.tags) {
            o.tags.forEach((e) => {
                var t = document.createElement("span");
                t.textContent = e.name;
                t.className = "assigned-tag";
                t.style.backgroundColor = e.color;
                t.style.color = getContrastColor(e.color);
                var n = document.createElement("span");
                (n.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L9 3M3 3L9 9" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                 `),
                    n.style.cursor = "pointer";
                n.addEventListener("click", () => removeTagFromDocument(o, e));
                t.appendChild(n);
                l.appendChild(t);
            });
        }

        t.appendChild(l);
        d.appendChild(t);
    });

    savePinnedDocsToLocalStorage();
}
function clearSearchResults() {
    // Clear the search input
    document.getElementById("search-text").value = "";

    // Clear the results list
    const resultsList = document.getElementById("results-list");
    resultsList.innerHTML = "";

    // Add default "no results" message
    const li = document.createElement("li");
    li.textContent = "No results found";
    li.style.color = "white";
    resultsList.appendChild(li);

    // Reset search type buttons
    document.getElementById("search-doc").classList.remove("active");
    document.getElementById("search").classList.remove("active");
}

// Add click handler for clear button
document.getElementById("clear-search").addEventListener("click", clearSearchResults);

function updateDeleteButtonState() {
    const selectedCheckboxes = document.querySelectorAll(".pinned-checkbox:checked");
    const deleteButton = document.getElementById("delete-pinned-docs");
    if (selectedCheckboxes.length > 0) {
        deleteButton.disabled = false;
        deleteButton.textContent = selectedCheckboxes.length === pinnedDocs.length ? "Delete All" : "Delete Selected";
    } else {
        deleteButton.disabled = true;
        deleteButton.textContent = "Delete";
    }
}

// Add event listener for delete button
document.getElementById("delete-pinned-docs").addEventListener("click", () => {
    const selectedCheckboxes = document.querySelectorAll(".pinned-checkbox:checked");
    const allCheckboxes = document.querySelectorAll(".pinned-checkbox");

    const confirmMessage = selectedCheckboxes.length === allCheckboxes.length
        ? "Remove all pinned documents?"
        : `Remove ${selectedCheckboxes.length} selected document(s)?`;

    Swal.fire({
        title: 'Are you sure?',
        text: confirmMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0DB14B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        customClass: {
            popup: 'small-swal'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (selectedCheckboxes.length === allCheckboxes.length) {
                pinnedDocs.length = 0;
            } else {
                const indices = Array.from(selectedCheckboxes).map(checkbox =>
                    Array.from(allCheckboxes).indexOf(checkbox)
                ).sort((a, b) => b - a);

                indices.forEach(index => {
                    pinnedDocs.splice(index, 1);
                });
            }
            updatePinnedDocsList();
            savePinnedDocsToLocalStorage();

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Documents unpinned successfully.',
                timer: 1500,
                customClass: {
                    popup: 'small-swal'
                }
            });
        }
    });
});

function unpinDocument(e) {
    pinnedDocs.splice(e, 1);
    updatePinnedDocsList();
    savePinnedDocsToLocalStorage(); // Save changes to localStorage
}
function addTagToDocument(e, t) {
    e.tags || (e.tags = []), e.tags.some((e) => e.name === t.name) || (e.tags.push(t), updatePinnedDocsList());
}
function removeTagFromDocument(e, t) {
    (e.tags = e.tags.filter((e) => e.name !== t.name)), updatePinnedDocsList();
}
function savePinnedDocsToLocalStorage() {
    localStorage.setItem("pinnedDocs", JSON.stringify(pinnedDocs));
}
function loadDocument(e) {
    e < 0 ||
        e >= fileArray.length ||
        (50 < fileArray.length
            ? ((document.getElementById("spinner-loader").style.display = "block"),
                setTimeout(() => {
                    hideAllViewers(), loadDocumentContent(e), (document.getElementById("spinner-loader").style.display = "none");
                }, 1250))
            : (hideAllViewers(), loadDocumentContent(e)));
}
function hideAllViewers() {
    (document.getElementById("pdf-viewer").style.display = "none"),
        (document.getElementById("docx-viewer").style.display = "none"),
        (document.getElementById("xlsx-viewer").style.display = "none"),
        (document.getElementById("txt-viewer").style.display = "none"),
        (document.getElementById("image-viewer").style.display = "none");
}
function displayPDF(e) {
    document.getElementById("pdf-viewer").style.display = "block";
    const loadingTask = pdfjsLib.getDocument({ data: atob(e.split(",")[1]) });
    loadingTask.promise.then((e) => {
        pdfDoc = e;
        pageCount = e.numPages;
        document.getElementById("page-count").textContent = pageCount;
        rotationAngle = 0;
        renderPage(pageNum = 1);
    }).catch(error => {
        console.error('Error loading PDF:', error);
    });
}
function displayDocx(e) {
    (document.getElementById("docx-viewer").style.display = "block"),
        fetch(e)
            .then((e) => e.arrayBuffer())
            .then((e) => mammoth.convertToHtml({ arrayBuffer: e }))
            .then((e) => {
                document.getElementById("docx-viewer").innerHTML = e.value;
            })
            .catch(console.error);
}
function displayXlsx(e) {
    (document.getElementById("xlsx-viewer").style.display = "block"),
        fetch(e)
            .then((e) => e.arrayBuffer())
            .then((e) => {
                (e = XLSX.read(e, { type: "array" })), (e = XLSX.utils.sheet_to_html(e.Sheets[e.SheetNames[0]])), (document.getElementById("xlsx-viewer").innerHTML = e);
            })
            .catch(console.error);
}
function displayTxtFile(e) {
    (document.getElementById("txt-viewer").style.display = "block"),
        fetch(e)
            .then((e) => e.text())
            .then((e) => {
                document.getElementById("txt-viewer").innerText = e;
            })
            .catch(console.error);
}
function displayImage(e) {
    (document.getElementById("image-viewer").style.display = "block"), (document.getElementById("image-viewer").src = e);
}

function renderPage(n) {
    if (isRendering) {
        console.log('Rendering is already in progress.');
        return;
    }
    isRendering = true;

    // Cancel any ongoing render task
    if (renderTask) {
        renderTask.cancel();
        console.debug('Cancelled ongoing render task before starting a new one.');
    }

    // document.getElementById("loading-indicator").style.display = "block";

    pdfDoc.getPage(n).then(function (page) {
        var viewport = page.getViewport({ scale: zoomLevel, rotation: rotationAngle });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";

        // Prepare the render context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        // Render the page
        renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
            document.getElementById("page-num").textContent = n;
            saveDocumentState();
            document.getElementById("loading-indicator").style.display = "none";
            renderTask = null;
            isRendering = false;
        }).catch(function (error) {
            if (error.name === "RenderingCancelledException") {
                console.log("Render was cancelled, likely due to a new render request:", error.message);
            } else {
                console.error("An error occurred during rendering:", error);
            }
            document.getElementById("loading-indicator").style.display = "none";
            renderTask = null;
            isRendering = false;
        });
    });
}
function adjustImageViewer() {
    var e = document.getElementById("image-viewer");
    (e.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`), (e.style.maxWidth = 100 * zoomLevel + "%"), (e.style.maxHeight = 100 * zoomLevel + "%");
}
function saveFilesToLocalStorage() {
    localStorage.setItem("savedFiles", JSON.stringify(fileArray));
}
function loadFilesFromLocalStorage() {
    fileArray = JSON.parse(localStorage.getItem("savedFiles")) || [];
}
function getFileType(e) {
    switch (e.split(".").pop().toLowerCase()) {
        case "pdf":
            return "pdf";
        case "docx":
            return "docx";
        case "xlsx":
            return "xlsx";
        case "txt":
            return "txt";
        case "jpeg":
        case "jpg":
        case "png":
        case "gif":
        case "tiff":
            return "image";
        // Restrict pptx file type
        case "pptx":
            return "unknown"; // Treat pptx as unknown
        default:
            return "unknown";
    }
}
let CHUNK_SIZE = 20;
function loadDocumentChunk(t) {
    let n = Math.min(t + CHUNK_SIZE, fileArray.length);
    for (let e = t; e < n; e++) {
        var o = document.createElement("option");
        (o.value = e), (o.textContent = fileArray[e].name), document.getElementById("document-select").appendChild(o);
    }
    n < fileArray.length && setTimeout(() => loadDocumentChunk(n), 0);
}
function populateDocumentSelect() {
    let selectElement = document.getElementById("document-select");
    selectElement.innerHTML = "";

    // New natural sorting function
    const naturalSort = (a, b) => {
        // Extract numbers from file names
        const extractNumbers = str => str.split(/(\d+)/).map(part =>
            /^\d+$/.test(part) ? parseInt(part) : part.toLowerCase()
        );

        const aParts = extractNumbers(a.name);
        const bParts = extractNumbers(b.name);

        // Compare parts
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
            if (aParts[i] !== bParts[i]) {
                // If both parts are numbers, compare numerically
                if (typeof aParts[i] === 'number' && typeof bParts[i] === 'number') {
                    return aParts[i] - bParts[i];
                }
                // Otherwise, compare as strings
                return aParts[i] < bParts[i] ? -1 : 1;
            }
        }
        return aParts.length - bParts.length;
    };

    // Sort fileArray using natural sort
    fileArray.sort(naturalSort);

    fileArray.forEach((file, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = file.name;
        selectElement.appendChild(option);
    });

    if (fileArray.length > 0) {
        loadDocument(selectElement.value = currentDocIndex);
    }
    updateRemoveButtonVisibility();
    selectElement.addEventListener("change", function () {
        loadDocument(this.selectedIndex);
    });
}

function updateRemoveButtonVisibility() {
    document.getElementById("remove-file").style.display = 0 < fileArray.length ? "inline-block" : "none";
}
function getContrastColor(e) {
    return "#" === e.slice(0, 1) && (e = e.slice(1)), 128 <= (299 * parseInt(e.substr(0, 2), 16) + 587 * parseInt(e.substr(2, 2), 16) + 114 * parseInt(e.substr(4, 2), 16)) / 1e3 ? "black" : "white";
}
function saveDocumentState() {
    var e;
    fileArray[currentDocIndex] && ((e = { pageNum: pageNum, zoomLevel: zoomLevel, rotationAngle: rotationAngle }), localStorage.setItem("docState_" + fileArray[currentDocIndex].name, JSON.stringify(e)));
}
function openDatabase() {
    return new Promise((t, n) => {
        var e = indexedDB.open("DocumentDatabase", 1);
        (e.onupgradeneeded = function (e) {
            e.target.result.createObjectStore("files", { keyPath: "name" });
        }),
            (e.onsuccess = function (e) {
                t(e.target.result);
            }),
            (e.onerror = function (e) {
                n("Error opening database: " + e.target.errorCode);
            });
    });
}
function saveFileToIndexedDB(a) {
    return openDatabase().then(
        (o) =>
            new Promise((e, t) => {
                var n = o.transaction(["files"], "readwrite").objectStore("files").put(a);
                (n.onsuccess = function () {
                    e();
                }),
                    (n.onerror = function (e) {
                        t("Error saving file: " + e.target.error);
                    });
            })
    );
}
function getFileFromIndexedDB(a) {
    return openDatabase().then(
        (o) =>
            new Promise((t, n) => {
                var e = o.transaction(["files"], "readonly").objectStore("files").get(a);
                (e.onsuccess = function (e) {
                    t(e.target.result);
                }),
                    (e.onerror = function (e) {
                        n("Error retrieving file: " + e.target.error);
                    });
            })
    );
}
function deleteFileFromIndexedDB(a) {
    return openDatabase().then(
        (o) =>
            new Promise((e, t) => {
                var n = o.transaction(["files"], "readwrite").objectStore("files").delete(a);
                (n.onsuccess = function () {
                    e();
                }),
                    (n.onerror = function (e) {
                        t("Error deleting file: " + e.target.error);
                    });
            })
    );
}
function saveFilesToLocalStorage() {
    fileArray.forEach((t) => {
        saveFileToIndexedDB(t)
            .then(() => console.log(`File ${t.name} saved to IndexedDB`))
            .catch((e) => console.error(`Error saving file ${t.name}:`, e));
    });
}
function loadFilesFromLocalStorage() {
    return openDatabase().then(
        (o) =>
            new Promise((t, n) => {
                var e = o.transaction(["files"], "readonly").objectStore("files").getAll();
                (e.onsuccess = function (e) {
                    (fileArray = e.target.result), t();
                }),
                    (e.onerror = function (e) {
                        n("Error loading files: " + e.target.error);
                    });
            })
    );
}
function zoomIn() {
    fileArray[currentDocIndex] &&
        ["pdf", "image"].includes(fileArray[currentDocIndex].type) &&
        ((zoomLevel = Math.min(zoomLevel + 0.25, 3)), "pdf" === fileArray[currentDocIndex].type ? renderPage(pageNum) : adjustImageViewer(), saveDocumentState());
}
function zoomOut() {
    fileArray[currentDocIndex] &&
        ["pdf", "image"].includes(fileArray[currentDocIndex].type) &&
        ((zoomLevel = Math.max(zoomLevel - 0.25, 0.5)), "pdf" === fileArray[currentDocIndex].type ? renderPage(pageNum) : adjustImageViewer(), saveDocumentState());
}
function updateHelpWindowWithShortcuts() {
    var e = document.querySelector(".shortcut-table tbody");
    e &&
        (e.innerHTML = [
            { description: "Next Document", windows: "Ctrl + →", mac: "" },
            { description: "Previous Document", windows: "Ctrl + ←", mac: "" },
            { description: "Zoom In", windows: "Ctrl + Alt + =", mac: "Cmd + Shift + =" },
            { description: "Zoom Out", windows: "Ctrl + Alt + -", mac: "Cmd + Shift + -" },
            { description: "Focus Search Box", windows: "Ctrl + F", mac: "Cmd + F" },
            { description: "Next Doc Page", windows: "Shift + →", mac: "Shift + →" },
            { description: "Prev Doc Page", windows: "Shift + ←", mac: "Shift + ←" },
        ]
            .map(
                (e) => `
            <tr>
                <td>${e.description}</td>
                <td>${e.windows}</td>
                <td>${e.mac}</td>
            </tr>
        `
            )
            .join(""));
}
function navigateDocument(e) {
    e = currentDocIndex + e;
    // Ensure e is within bounds
    if (0 <= e && e < fileArray.length) {
        loadDocument(e); // Load the document without skipping
    }
}
function navigatePage(e) {
    1 === e && pageNum < pageCount ? renderPage(++pageNum) : -1 === e && 1 < pageNum && renderPage(--pageNum), saveDocumentState();
}
function loadDocument(e) {
    // Check if the index is valid
    if (e < 0 || e >= fileArray.length) return;

    // Show spinner for large file arrays
    if (fileArray.length > 50) {
        document.getElementById("spinner-loader").style.display = "block";
        setTimeout(() => {
            hideAllViewers();
            loadDocumentContent(e);
            document.getElementById("spinner-loader").style.display = "none";
        }, 1250);
    } else {
        hideAllViewers();
        loadDocumentContent(e);
    }
}

function loadDocumentContent(e) {
    // Set the current document index
    currentDocIndex = e;
    const currentDoc = fileArray[currentDocIndex];

    // Determine document type
    const isPDF = currentDoc.type === "pdf";
    const isImage = currentDoc.type === "image";

    // Enable/disable UI controls based on document type
    document.getElementById("prev-page").disabled = !isPDF;
    document.getElementById("next-page").disabled = !isPDF;
    document.getElementById("zoom-in").disabled = !(isPDF || isImage);
    document.getElementById("zoom-out").disabled = !(isPDF || isImage);
    document.getElementById("rotate").disabled = !(isPDF || isImage);

    // Load saved state from localStorage
    const savedState = JSON.parse(localStorage.getItem("docState_" + currentDoc.name)) || {};
    zoomLevel = savedState.zoomLevel || 1.25;
    pageNum = savedState.pageNum || 1;
    rotationAngle = savedState.rotationAngle || 0;

    // Display the document based on its type
    switch (currentDoc.type) {
        case "pdf":
            displayPDF(currentDoc.content);
            break;
        case "docx":
            displayDocx(currentDoc.content);
            break;
        case "xlsx":
            displayXlsx(currentDoc.content);
            break;
        case "txt":
            displayTxtFile(currentDoc.content);
            break;
        case "image":
            displayImage(currentDoc.content);
            break;
        default:
            console.error("Unsupported document type:", currentDoc.type);
    }

    // Update the document select dropdown
    document.getElementById("document-select").value = currentDocIndex;
}
document.addEventListener("contextmenu", (e) => e.preventDefault()),
    document.addEventListener(
        "keydown",
        function (e) {
            if (123 == e.keyCode || (e.ctrlKey && 85 == e.keyCode) || (e.ctrlKey && e.shiftKey && (73 == e.keyCode || 74 == e.keyCode || 67 == e.keyCode))) return e.preventDefault(), !1;
        },
        !1
    ),
    document.getElementById("add-tag").addEventListener("click", () => {
        (document.getElementById("tag-popup").style.display = "block"),
            (document.getElementById("tag-input").value = ""),
            (document.getElementById("tag-color").value = "#007BFF"),
            (document.getElementById("error-message").style.display = "none"),
            (selectedTagIndex = null),
            updateTagList();
    }),
    document.getElementById("close-tag-popup").addEventListener("click", () => {
        document.getElementById("tag-popup").style.display = "none";
    }),
    document.getElementById("save-tag").addEventListener("click", (e) => {
        e.stopPropagation();
        let t = document.getElementById("tag-input").value.trim(),
            n = document.getElementById("tag-color").value,
            o = document.getElementById("error-message");
        t
            ? 9 <= tags.length && null === selectedTagIndex
                ? ((o.textContent = "You can only create a maximum of 9 tags."), (o.style.display = "block"))
                : tags.some((e) => e.name.toLowerCase() === t.toLowerCase()) && null === selectedTagIndex
                    ? ((o.textContent = "A tag with this name already exists."), (o.style.display = "block"))
                    : ((o.style.display = "none"),
                        null !== selectedTagIndex ? (tags[selectedTagIndex] = { name: t, color: n }) : tags.push({ name: t, color: n }),
                        saveTagsToLocalStorage(),
                        (document.getElementById("tag-input").value = ""),
                        (document.getElementById("tag-color").value = "#007BFF"),
                        (selectedTagIndex = null),
                        updateTagList(),
                        updateTagDropdown())
            : ((o.textContent = "Tag name can't be empty!"), (o.style.display = "block"));
    }),
    document.getElementById("delete-tag").addEventListener("click", (e) => {
        e.stopPropagation(),
            (e = document.getElementById("error-message")),
            null !== selectedTagIndex
                ? (tags.splice(selectedTagIndex, 1),
                    saveTagsToLocalStorage(),
                    updateTagList(),
                    updateTagDropdown(),
                    (selectedTagIndex = null),
                    (document.getElementById("tag-input").value = ""),
                    (document.getElementById("tag-color").value = "#007BFF"),
                    (e.style.display = "none"))
                : ((e.textContent = "Please select a tag to delete."), (e.style.display = "block"));
    }),
    document.getElementById("tag-popup").addEventListener("click", () => {
        document.getElementById("error-message").style.display = "none";
    }),
    document.querySelectorAll("#tag-popup input, #tag-popup button").forEach((e) => {
        e.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }),
    document.addEventListener("DOMContentLoaded", () => {
        updateTagList(), updateTagDropdown(), updatePinnedDocsList();
    }),
    document.addEventListener("DOMContentLoaded", () => {
        updateTagList(), updatePinnedDocsList();
    }),
    document.getElementById("zoom-in").addEventListener("click", () => {
        "pdf" === fileArray[currentDocIndex].type ? ((zoomLevel = Math.min(zoomLevel + 0.25, 3)), renderPage(pageNum)) : "image" === fileArray[currentDocIndex].type && ((zoomLevel = Math.min(zoomLevel + 0.25, 3)), adjustImageViewer()),
            saveDocumentState();
    }),
    document.getElementById("zoom-out").addEventListener("click", () => {
        "pdf" === fileArray[currentDocIndex].type ? ((zoomLevel = Math.max(zoomLevel - 0.25, 0.5)), renderPage(pageNum)) : "image" === fileArray[currentDocIndex].type && ((zoomLevel = Math.max(zoomLevel - 0.25, 0.5)), adjustImageViewer()),
            saveDocumentState();
    }),
    document.getElementById("rotate").addEventListener("click", () => {
        (rotationAngle = (rotationAngle + 90) % 360), "pdf" === fileArray[currentDocIndex].type ? renderPage(pageNum) : "image" === fileArray[currentDocIndex].type && adjustImageViewer();
    }),
    document.getElementById("prev-page").addEventListener("click", () => {
        1 < pageNum && (renderPage(--pageNum), saveDocumentState());
    }),
    document.getElementById("next-page").addEventListener("click", () => {
        pageNum < pageCount && (renderPage(++pageNum), saveDocumentState());
    }),

    // this is for drop box
document.addEventListener("DOMContentLoaded", function() {
    const folderSelect = document.getElementById('folder-select');
    const fileInput = document.getElementById('file-input');
    const uploadPopup = document.getElementById('uploadPopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const uploadLocalBtn = document.getElementById('uploadLocalBtn');
    const uploadDropboxBtn = document.getElementById('uploadDropboxBtn');

    // Function to open the popup
    function openUploadPopup() {
        uploadPopup.style.display = 'flex';
    }

    // Function to close the popup
    function closeUploadPopup() {
        uploadPopup.style.display = 'none';
    }

    // Event listeners
    folderSelect.addEventListener('click', openUploadPopup);

    closePopupBtn.addEventListener('click', closeUploadPopup);

    uploadLocalBtn.addEventListener('click', () => {
        console.log('Upload from Local Storage clicked');
        fileInput.click(); // Trigger file input click when "Upload from Local Storage" is clicked
    });

    uploadDropboxBtn.addEventListener('click', () => {
        console.log('Upload from Dropbox Storage clicked');
        // Add actual Dropbox upload logic here if needed
    });

    // Handle file input change (original functionality)
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Files selected:', files);
            // Add your file handling logic here (e.g., upload, process)
        }
        closeUploadPopup(); // Close popup after selection
    });
});

//   ----------------------
document.getElementById("file-input").addEventListener("change", (e) => {
    let n = [],
        o = 0,
        a = e.target.files.length;
    for (let t of e.target.files) {
        // Check for unsupported file types
        if (getFileType(t.name) === "unknown") {
            // Skip this file without showing an alert
            continue;
        }
        var l = new FileReader();
        (l.onload = function (e) {
            (e = { name: t.name, type: getFileType(t.name), content: e.target.result }),
                n.push(e),
                ++o === a && ((fileArray = [...fileArray, ...n]), saveFilesToLocalStorage(), populateDocumentSelect(), 0 < n.length) && loadDocument(fileArray.length - n.length);
        }),
            l.readAsDataURL(t);
    }
}),
    document.getElementById("remove-file").addEventListener("click", () => {
        let e = parseInt(document.getElementById("document-select").value);
        if (0 <= e) {
            Swal.fire({
                title: 'Do you really want to delete the document?',
                text: "",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#0DB14B',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                customClass: {
                    popup: 'small-swal'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    let t = fileArray[e];
                    deleteFileFromIndexedDB(t.name)
                        .then(() => {
                            console.log(`File ${t.name} deleted from IndexedDB`);
                            fileArray.splice(e, 1);
                            populateDocumentSelect();
                            0 < fileArray.length ? loadDocument(0) : hideAllViewers();
                        })
                        .catch((e) => {
                            console.error(`Error deleting file ${t.name} from IndexedDB:`, e);
                            Swal.fire({
                                title: 'Error',
                                text: 'Error deleting file. Try again.',
                                icon: 'error',
                                confirmButtonColor: '#0DB14B',
                                customClass: {
                                    popup: 'small-swal'
                                }
                            });
                        });
                }
            });
        }
    }),
    document.getElementById("remove-all-files").addEventListener("click", () => {
        Swal.fire({
            title: 'Are you sure you want to delete all Documents?',
            text: "",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0DB14B',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            customClass: {
                popup: 'small-swal'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const promises = fileArray.map(file =>
                    deleteFileFromIndexedDB(file.name)
                        .then(() => console.log(`File ${file.name} deleted from IndexedDB`))
                        .catch(err => console.error(`Error deleting file ${file.name}:`, err))
                );

                Promise.all(promises)
                    .then(() => {
                        fileArray = [];
                        populateDocumentSelect();
                        hideAllViewers();
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'All documents have been deleted.',
                            customClass: {
                                popup: 'small-swal'
                            }
                        });
                    })
                    .catch(err => {
                        console.error("Error deleting all files:", err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error removing files. Try again.',
                            customClass: {
                                popup: 'small-swal'
                            }
                        });
                    });
            }
        });
    }),
    document.addEventListener("DOMContentLoaded", () => {
        loadFilesFromLocalStorage()
            .then(() => {
                populateDocumentSelect(), 0 < fileArray.length && loadDocument(0), updateTagList(), updatePinnedDocsList();
            })
            .catch((e) => console.error("Error loading files:", e));
    }),
    document.getElementById("flag-doc").addEventListener("click", () => {
        var e = fileArray[currentDocIndex];
        pinnedDocs.includes(e) || (pinnedDocs.push(e), updatePinnedDocsList());
    }),
    document.getElementById("export-list").addEventListener("click", () => {
        if (0 === pinnedDocs.length) {
            Swal.fire({
                title: 'No Documents',
                text: 'No pinned documents to export.',
                icon: 'info',
                confirmButtonColor: '#0DB14B',
                customClass: {
                    popup: 'small-swal'
                }
            });
        } else {
            let o = [],
                t =
                    (pinnedDocs.forEach((e) => {
                        e.tags &&
                            e.tags.forEach((t) => {
                                o.some((e) => e.name === t.name) || o.push(t);
                            });
                    }),
                        "data:text/csv;charset=utf-8,Document Name," + o.map((e) => e.name).join(",") + "\n");
            pinnedDocs.forEach((e) => {
                let n = e.name + ",";
                o.forEach((t) => {
                    n += e.tags && e.tags.some((e) => e.name === t.name) ? "1," : "0,";
                }),
                    (t += n.slice(0, -1) + "\n");
            });
            var e = encodeURI(t),
                n = document.createElement("a");
            n.setAttribute("href", e), n.setAttribute("download", "pinned_documents_with_tags.csv"), document.body.appendChild(n), n.click(), document.body.removeChild(n);
        }
    }),
    document.getElementById("prev-doc").addEventListener("click", () => {
        0 < currentDocIndex && loadDocument(currentDocIndex - 1);
    }),
    document.getElementById("next-doc").addEventListener("click", () => {
        currentDocIndex < fileArray.length - 1 && loadDocument(currentDocIndex + 1);
    }),
    // Start of Selection
    window.loadDocumentAtPage = function (index, pageNum) {
        console.debug(`Attempting to load document at index: ${index} and page number: ${pageNum}`);
        try {
            loadDocumentContent(index);
            console.debug(`Document loaded successfully at index: ${index}`);

            // Cancel any ongoing render task before starting a new one
            if (renderTask) {
                renderTask.cancel();
                console.debug('Cancelled ongoing render task.');
            }

            try {
                renderPage(pageNum);
                console.debug(`Page ${pageNum} rendered successfully.`);
            } catch (error) {
                if (error.name === "RenderingCancelledException") {
                    console.log("Render was cancelled, likely due to a new render request:", error.message);
                } else {
                    console.error(`Failed to render page ${pageNum}:`, error);
                }
            }
        } catch (error) {
            console.error(`Failed to load document at index ${index}:`, error);
        }
    };
document.getElementById("search").addEventListener("click", () => {
    document.getElementById("search").classList.add("active");
    document.getElementById("search-doc").classList.remove("active");
    let searchText = document.getElementById("search-text").value.toLowerCase().trim();
    let resultsList = document.getElementById("results-list");
    resultsList.innerHTML = ""; // Clear previous results

    if (!searchText) {
        Swal.fire({
            icon: 'error',
            title: 'Empty Search',
            text: 'Please enter some text to search.',
            customClass: {
                popup: 'small-swal'
            }
        });
        let li = document.createElement("li");
        li.textContent = "No results found";
        li.style.color = "white";
        resultsList.appendChild(li);
        return;
    }

    document.getElementById("spinner-search").style.display = "block";
    setTimeout(() => {
        let found = false,
            promises = [];

        fileArray.forEach((file, index) => {
            if (file.type === "pdf") {
                let loadingTask = pdfjsLib.getDocument({ data: atob(file.content.split(",")[1]) });
                let promise = loadingTask.promise.then(pdfDoc => {
                    let numPages = pdfDoc.numPages;
                    let pagePromises = [];
                    let pagesFound = [];
                    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                        let pagePromise = pdfDoc.getPage(pageNum).then(page => {
                            return page.getTextContent().then(textContent => {
                                let text = textContent.items.map(item => item.str).join(" ").toLowerCase();
                                if (text.includes(searchText)) {
                                    pagesFound.push(pageNum);
                                }
                            });
                        });
                        pagePromises.push(pagePromise);
                    }
                    return Promise.all(pagePromises).then(() => {
                        if (pagesFound.length > 0) {
                            found = true;
                            let li = document.createElement("li");
                            let docLink = document.createElement("a");
                            docLink.textContent = file.name;
                            docLink.href = "#";
                            docLink.style.color = "white";
                            docLink.addEventListener("click", (e) => {
                                e.preventDefault();
                                loadDocument(index).then(() => {
                                    navigatePage(pagesFound[0] - 1); // Navigate to the first found page
                                });
                            });
                            li.appendChild(docLink);

                            // Sort pagesFound to ensure the page numbers are in order
                            pagesFound.sort((a, b) => a - b);

                            pagesFound.forEach(pageNum => {
                                let pageLink = document.createElement("a");
                                pageLink.textContent = "- Page " + pageNum.toString();
                                pageLink.href = "#";
                                pageLink.className = "page-number";
                                pageLink.style.color = "white";
                                pageLink.addEventListener("click", (e) => {
                                    e.preventDefault();
                                    loadDocumentAtPage(index, pageNum);
                                });
                                li.appendChild(pageLink);
                            });

                            resultsList.appendChild(li);
                        }
                    });
                });
                promises.push(promise);
            }
            // Add similar logic for other file types if needed
        });

        Promise.all(promises).then(() => {
            if (!found) {
                let li = document.createElement("li");
                li.textContent = "No matches found";
                li.style.color = "white";
                resultsList.appendChild(li);
            }
            document.getElementById("spinner-search").style.display = "none";
        });
    }, 2500); // Increased delay to observe the results
}),
    document.getElementById("search-doc").addEventListener("click", () => {
        document.getElementById("search-doc").classList.add("active");
        document.getElementById("search").classList.remove("active");

        let searchText = document.getElementById("search-text").value.toLowerCase().trim();
        let resultsList = document.getElementById("results-list");
        resultsList.innerHTML = ""; // Clear previous results

        if (!searchText) {
            Swal.fire({
                icon: 'error',
                title: 'Empty Search',
                text: 'Please enter some text to search.',
                customClass: {
                    popup: 'small-swal'
                }
            });
            let li = document.createElement("li");
            li.textContent = "No results found";
            li.style.color = "white";
            resultsList.appendChild(li);
            return;
        }

        (document.getElementById("spinner-search").style.display = "block")
        setTimeout(() => {
            let a = document.getElementById("search-text").value.toLowerCase(),
                l = document.getElementById("results-list");
            if (((l.innerHTML = ""), "pdf" === fileArray[currentDocIndex].type)) {
                var t = [];
                for (let e = 1; e <= pageCount; e++) t.push(pdfDoc.getPage(e).then((e) => e.getTextContent()));
                Promise.all(t).then((e) => {
                    let o = !1;
                    e.forEach((e, t) => {
                        var n;
                        e.items
                            .map((e) => e.str)
                            .join(" ")
                            .toLowerCase()
                            .includes(a) &&
                            ((o = !0),
                                (e = document.createElement("li")),
                                ((n = document.createElement("a")).textContent = "Page " + (t + 1)),
                                (n.href = "#"),
                                (n.style.color = "white"),
                                n.addEventListener("click", () => {
                                    renderPage(t + 1);
                                }),
                                e.appendChild(n),
                                l.appendChild(e));
                    }),
                        o || (((e = document.createElement("li")).textContent = "No matches found"), (e.style.color = "white"), l.appendChild(e)),
                        (document.getElementById("spinner-search").style.display = "none");
                });
            } else (l.innerHTML = "<li>Search is not supported for this file type</li>"), (document.getElementById("spinner-search").style.display = "none");
        }, 1250);
    }),
    document.getElementById("search-text").addEventListener("keypress", (e) => {
        "Enter" === e.key && document.getElementById("search-doc").click();
    }),
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey)
            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault();
                    // Navigate to the next document without skipping
                    if (!isLoadingDocument && currentDocIndex < fileArray.length - 1) {
                        isLoadingDocument = true; // Set loading flag
                        setTimeout(() => {
                            loadDocument(currentDocIndex + 1);
                            isLoadingDocument = false; // Reset loading flag after loading
                        }, 1000); // Delay of 100 milliseconds
                    }
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    // Navigate to the previous document without skipping
                    if (!isLoadingDocument && currentDocIndex > 0) {
                        isLoadingDocument = true; // Set loading flag
                        setTimeout(() => {
                            loadDocument(currentDocIndex - 1);
                            isLoadingDocument = false; // Reset loading flag after loading
                        }, 1000); // Delay of 100 milliseconds
                    }
                    break;
                case "f":
                    e.preventDefault();
                    document.getElementById("search-text").focus();
            }
        if ((e.ctrlKey && e.altKey) || (e.metaKey && e.shiftKey))
            switch (e.key) {
                case "=":
                    e.preventDefault(), zoomIn();
                    break;
                case "-":
                    e.preventDefault(), zoomOut();
            }
    }),
    document.addEventListener("DOMContentLoaded", () => {
        updateHelpWindowWithShortcuts();
    }),
    document.addEventListener("DOMContentLoaded", () => {
        loadFilesFromLocalStorage()
            .then(() => {
                populateDocumentSelect(), 0 < fileArray.length && loadDocument(0), updateTagList(), updatePinnedDocsList();
            })
            .catch((e) => console.error("Error loading files:", e));
    }),
    document.addEventListener("DOMContentLoaded", function () {
        var e = document.getElementById("help-button");
        let t = document.getElementById("help-window");
        var n = document.getElementById("close-help");
        e.addEventListener("click", function () {
            (t.style.display = "block"), t.classList.add("show");
        }),
            n.addEventListener("click", function () {
                (t.style.display = "none"), t.classList.remove("show");
            }),
            window.addEventListener("click", function (e) {
                e.target === t && ((t.style.display = "none"), t.classList.remove("show"));
            }),
            updateHelpWindowWithShortcuts();
    }),
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey)
            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault(), navigateDocument(1);
                    break;
                case "ArrowLeft":
                    e.preventDefault(), navigateDocument(-1);
                    break;
                case "f":
                    e.preventDefault(), document.getElementById("search-text").focus();
            }
        if (e.shiftKey)
            switch (e.key) {
                case "ArrowRight":
                    e.preventDefault(), navigatePage(1);
                    break;
                case "ArrowLeft":
                    e.preventDefault(), navigatePage(-1);
            }
        if ((e.ctrlKey && e.altKey) || (e.metaKey && e.shiftKey))
            switch (e.key) {
                case "=":
                    e.preventDefault(), zoomIn();
                    break;
                case "-":
                    e.preventDefault(), zoomOut();
            }
    }),
    document.getElementById("zoom-in").addEventListener("click", zoomIn),
    document.getElementById("zoom-out").addEventListener("click", zoomOut),
    document.addEventListener("DOMContentLoaded", () => {
        loadFilesFromLocalStorage()
            .then(() => {
                populateDocumentSelect(), 0 < fileArray.length && loadDocument(0), updateTagList(), updatePinnedDocsList(), updateHelpWindowWithShortcuts();
            })
            .catch((e) => console.error("Error loading files:", e));
    }),
    // Update the file input to restrict file selection
    document.getElementById("file-input").setAttribute("accept", ".pdf,.docx,.xlsx,.txt,.jpeg,.jpg,.png,.gif,.tiff");


// ------------------dropbox

document.addEventListener("DOMContentLoaded", function() {
    const folderSelect = document.getElementById('folder-select');
    const fileInput = document.getElementById('file-input');
    const uploadPopup = document.getElementById('uploadPopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const uploadLocalBtn = document.getElementById('uploadLocalBtn');
    const uploadDropboxBtn = document.getElementById('uploadDropboxBtn');
    const dropboxAlert = document.getElementById('dropboxAlert');
    const alertOkBtn = document.getElementById('alertOkBtn');

    // Dropbox App credentials
    const APP_KEY = 'kibwqto5p1y8t4r'; // Your app key
    const APP_SECRET = '3l2etd4s2juimgk'; // Your app secret
    const REDIRECT_URI = 'http://localhost:5501'; // Your redirect URI

    let dbx; // Dropbox client instance

    // Function to open the popup
    function openUploadPopup() {
        uploadPopup.style.display = 'flex';
    }

    // Function to close the popup
    function closeUploadPopup() {
        uploadPopup.style.display = 'none';
    }

    // Function to show Dropbox alert
    function showDropboxAlert() {
        dropboxAlert.classList.remove('hidden');
    }

    // Function to hide Dropbox alert
    function hideDropboxAlert() {
        dropboxAlert.classList.add('hidden');
    }

    // Step 1: Initiate OAuth flow
    function initiateDropboxAuth() {
        console.log('Initiating Dropbox OAuth flow...');
        const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
        console.log('Redirecting to Dropbox auth URL:', authUrl);
        window.location.href = authUrl;
    }

    // Step 2: Handle the redirect and exchange code for token
    function handleAuthCallback() {
        console.log('Checking for authorization code in URL...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            console.log('Found authorization code:', code);
            fetch('https://api.dropboxapi.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                    client_id: APP_KEY,
                    client_secret: APP_SECRET,
                    redirect_uri: REDIRECT_URI,
                }),
            })
            .then(response => {
                console.log('Token response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Token response data:', data);
                const accessToken = data.access_token;
                const refreshToken = data.refresh_token;
                if (accessToken) {
                    dbx = new Dropbox.Dropbox({ accessToken });
                    localStorage.setItem('dropbox_token', accessToken);
                    if (refreshToken) {
                        localStorage.setItem('dropbox_refresh_token', refreshToken);
                    }
                    console.log('Dropbox authenticated successfully. Token:', accessToken);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    alert('Dropbox authentication successful! Please click "Upload from Dropbox" again to select a file.');
                } else {
                    console.error('No access token received:', data);
                    alert('Failed to authenticate with Dropbox. Check console for details.');
                }
            })
            .catch(error => {
                console.error('Error fetching access token:', error);
                alert('Error during authentication: ' + error.message);
            });
        } else {
            console.log('No code in URL, proceeding with stored token if available...');
        }
    }

    // Function to initialize Dropbox client
    function initializeDropbox() {
        const storedToken = localStorage.getItem('dropbox_token');
        if (storedToken) {
            dbx = new Dropbox.Dropbox({ accessToken: storedToken });
            console.log('Using stored Dropbox token:', storedToken);
            // Validate the token
            dbx.usersGetCurrentAccount()
                .then(response => {
                    console.log('Token is valid. User account:', response);
                })
                .catch(error => {
                    console.error('Token validation failed:', error);
                    if (error.status === 401) {
                        localStorage.removeItem('dropbox_token');
                        localStorage.removeItem('dropbox_refresh_token');
                        dbx = null;
                        console.log('Token invalid or expired, removed from storage.');
                    }
                });
        } else {
            console.log('No stored token.');
            dbx = null;
        }
    }

    // Function to show the Dropbox Chooser
    function showDropboxChooser() {
        if (!dbx) {
            console.log('Dropbox not connected, prompting authentication...');
            alert('Please connect to Dropbox first.');
            initiateDropboxAuth();
            return;
        }
        // Validate token before showing Chooser
        dbx.usersGetCurrentAccount()
            .then(() => {
                console.log('Token is valid, showing Dropbox Chooser...');
                const options = {
                    success: function(files) {
                        console.log('Chooser success callback triggered. Files:', files);
                        if (files.length > 0) {
                            const file = files[0];
                            console.log('Selected file from Dropbox:', file);
                            console.log('File ID:', file.id);
                            if (!file.id) {
                                console.error('File ID is undefined or empty');
                                alert('Error: Selected file does not have a valid ID.');
                                return;
                            }
                            dbx.filesDownload({ path: file.id })
                                .then(response => {
                                    console.log('File downloaded from Dropbox:', response);
                                    const fileBlob = response.result.fileBlob;
                                    if (fileBlob) {
                                        const url = window.URL.createObjectURL(fileBlob);
                                        const reader = new FileReader();
                                        reader.onload = function(event) {
                                            const fileContent = event.target.result;
                                            const newFile = {
                                                name: file.name,
                                                type: getFileType(file.name),
                                                content: fileContent
                                            };
                                            fileArray.push(newFile);
                                            saveFilesToLocalStorage();
                                            populateDocumentSelect();
                                            loadDocument(fileArray.length - 1);
                                            alert('File selected from Dropbox successfully!');
                                            closeUploadPopup();
                                        };
                                        reader.readAsDataURL(fileBlob);
                                    } else {
                                        alert('Error: No file content received.');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error downloading file from Dropbox:', error);
                                    if (error.status === 401) {
                                        localStorage.removeItem('dropbox_token');
                                        localStorage.removeItem('dropbox_refresh_token');
                                        dbx = null;
                                        alert('Dropbox session expired. Please reconnect.');
                                        initiateDropboxAuth();
                                    } else {
                                        alert('Error selecting file from Dropbox: ' + error.message);
                                    }
                                });
                        } else {
                            console.log('No files selected in Chooser.');
                            showDropboxAlert();
                        }
                    },
                    cancel: function() {
                        console.log('Chooser cancel callback triggered.');
                        showDropboxAlert();
                    },
                    linkType: "direct",
                    multiselect: false,
                    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.jpeg', '.jpg', '.png', '.gif', '.tiff'],
                    folderselect: false,
                    iframe: false
                };
                try {
                    console.log('Opening Dropbox Chooser...');
                    Dropbox.choose(options);
                } catch (error) {
                    console.error('Error opening Dropbox Chooser:', error);
                    alert('Error opening Dropbox Chooser: ' + error.message);
                }
            })
            .catch(error => {
                console.error('Token validation failed before showing Chooser:', error);
                if (error.status === 401) {
                    localStorage.removeItem('dropbox_token');
                    localStorage.removeItem('dropbox_refresh_token');
                    dbx = null;
                    alert('Dropbox session expired. Please reconnect.');
                    initiateDropboxAuth();
                } else {
                    alert('Error validating Dropbox token: ' + error.message);
                }
            });
    }

    // Check for redirect on page load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
        console.log('Redirect detected, handling auth callback...');
        handleAuthCallback();
    } else {
        console.log('No redirect code in URL on page load.');
    }

    // Drag and drop event listeners
    uploadPopup.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadPopup.classList.add('dragover');
    });

    uploadPopup.addEventListener('dragenter', (event) => {
        event.preventDefault();
        uploadPopup.classList.add('dragover');
    });

    uploadPopup.addEventListener('dragleave', (event) => {
        event.preventDefault();
        uploadPopup.classList.remove('dragover');
    });

    uploadPopup.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadPopup.classList.remove('dragover');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const fileContent = event.target.result;
                    const newFile = {
                        name: file.name,
                        type: getFileType(file.name),
                        content: fileContent
                    };
                    fileArray.push(newFile);
                    saveFilesToLocalStorage();
                    populateDocumentSelect();
                    loadDocument(fileArray.length - 1);
                };
                reader.readAsDataURL(file);
            });
            closeUploadPopup();
        } else {
            showDropboxAlert();
        }
    });

    // Event listeners
    folderSelect.addEventListener('click', openUploadPopup);
    closePopupBtn.addEventListener('click', closeUploadPopup);

    uploadDropboxBtn.addEventListener('click', () => {
        console.log('Upload from Dropbox button clicked');
        initializeDropbox();
        showDropboxChooser();
    });

    alertOkBtn.addEventListener('click', hideDropboxAlert);

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Files selected:', files);
        }
        closeUploadPopup();
    });
});

// ------------------dropbox

// ----------------- Production Modal
document.addEventListener("DOMContentLoaded", function() {
    // Get the button and modal elements
    const productionTagBtn = document.getElementById('production-tag');
    const processingModal = document.getElementById('processingModal');
    const closeModalBtn = document.querySelector('.close-button');
  
    // Function to open the modal
    function openProcessingModal() {
      processingModal.classList.remove('hidden');
    }
  
    // Function to close the modal
    function closeProcessingModal() {
      processingModal.classList.add('hidden');
    }
  
    // Event listener to open the modal
    productionTagBtn.addEventListener('click', openProcessingModal);
  
    // Event listener to close the modal
    closeModalBtn.addEventListener('click', closeProcessingModal);
  
    // Toggle visibility of Bates and Legend fields
    const batesCheckbox = document.querySelector('#processingModal section:nth-of-type(2) .checkbox-icon');
    const legendCheckbox = document.querySelector('#processingModal section:nth-of-type(3) .checkbox-icon');
    const batesFields = document.querySelector('.bates-fields');
    const legendFields = document.querySelector('.legend-fields');
  
    function toggleCheckbox(checkbox, fields) {
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('checked');
        if (checkbox.classList.contains('checked')) {
          // Show checkmark
          checkbox.innerHTML = `
            <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM5 19H19V5H5V19Z" fill="#FEF7FF"></path>
            <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#39138F"></path>
          `;
          fields.classList.remove('hidden');
        } else {
          // Show empty checkbox
          checkbox.innerHTML = `
            <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM5 19H19V5H5V19Z" fill="#FEF7FF"></path>
          `;
          fields.classList.add('hidden');
        }
      });
    }
  
    // Initialize checkbox toggles
    toggleCheckbox(batesCheckbox, batesFields);
    toggleCheckbox(legendCheckbox, legendFields);
  });

  // PDF Merging Functions
async function mergeDocuments(taggedDocs) {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    
    for (const doc of taggedDocs) {
      let pdfBytes;
      
      if (doc.type !== 'pdf') {
        const converted = await convertToPdf(doc);
        pdfBytes = converted;
      } else {
        const response = await fetch(doc.content);
        pdfBytes = await response.arrayBuffer();
      }
  
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
  
    return await mergedPdf.save();
  }
  
  async function convertToPdf(doc) {
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    
    switch(doc.type) {
      case 'image':
        const img = await pdfDoc.embedJpg(doc.content);
        const imgPage = pdfDoc.addPage([img.width, img.height]);
        imgPage.drawImage(img, { x: 0, y: 0 });
        break;
        
      case 'docx':
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await fetch(doc.content).then(r => r.arrayBuffer()) });
        const { default: html2pdf } = await import('html2pdf.js');
        const result = await html2pdf().from(html).outputPdf('arraybuffer');
        return result;
        
      case 'txt':
        const text = await fetch(doc.content).then(r => r.text());
        const txtPage = pdfDoc.addPage([612, 792]); // Letter size
        txtPage.drawText(text, { 
          x: 50, 
          y: 742, // Start from top
          size: 12, 
          color: rgb(0, 0, 0),
          maxWidth: 522 // Page width - margins
        });
        break;
    }
  
    return await pdfDoc.save();
  }
  
  // Update tag dropdown in processing modal
  function updateProductionTagDropdown() {
    const select = document.getElementById('productionTag');
    select.innerHTML = '<option value="">Select Tag</option>';
    tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag.name;
      option.textContent = tag.name;
      select.appendChild(option);
    });
  }
  
  // Add event listener for production button
  document.getElementById('runProduction').addEventListener('click', async () => {
    const selectedTag = document.getElementById('productionTag').value;
    const taggedDocs = pinnedDocs.filter(doc => 
      doc.tags?.some(tag => tag.name === selectedTag)
    );
  
    if (!selectedTag || taggedDocs.length === 0) {
      Swal.fire('No documents found with this tag!');
      return;
    }
  
    const loading = Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    
    try {
      const mergedPdf = await mergeDocuments(taggedDocs);
      const blob = new Blob([mergedPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const downloadBtn = document.getElementById('downloadMerged');
      downloadBtn.href = url;
      downloadBtn.download = `merged-${selectedTag}.pdf`;
      downloadBtn.style.display = 'block';
      
      loading.close();
      Swal.fire('Documents merged successfully!');
    } catch (error) {
      loading.close();
      console.error('Merge error:', error);
      Swal.fire('Error processing documents!');
    }
  });
  
  // Initialize production tag dropdown when tags update
  document.addEventListener('DOMContentLoaded', () => {
    updateProductionTagDropdown();
  });