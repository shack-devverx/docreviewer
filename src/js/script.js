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
        selectAllCheckbox.addEventListener("change", function() {
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

        let textSpan = document.createElement("span");
        textSpan.textContent = o.name;
        t.appendChild(textSpan);

        var n = document.createElement("span");
        (n.innerHTML = `
            <svg fill="#fff" width="16" height="16" viewBox="-3 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"></path></svg>
         `),
        n.style.cursor = "pointer";
        n.style.marginLeft = "10px";
        n.addEventListener("click", () => {
            unpinDocument(e);
        });

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
                // n.textContent = "❌";
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

        t.appendChild(n);
        t.appendChild(a);
        t.appendChild(l);
        d.appendChild(t);
    });

    savePinnedDocsToLocalStorage();
}
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
    var t, n, o, a;
    e < 0 ||
        e >= fileArray.length ||
        ((currentDocIndex = e),
        (t = fileArray[e]),
        hideAllViewers(),
        (n = "pdf" === t.type),
        (o = "image" === t.type),
        (document.getElementById("prev-page").disabled = !n),
        (document.getElementById("next-page").disabled = !n),
        (document.getElementById("zoom-in").disabled = !(n || o)),
        (document.getElementById("zoom-out").disabled = !(n || o)),
        (document.getElementById("rotate").disabled = !(n || o)),
        (a = JSON.parse(localStorage.getItem("docState_" + t.name)) || {}),
        (zoomLevel = a.zoomLevel || 1.25),
        (pageNum = a.pageNum || 1),
        (rotationAngle = a.rotationAngle || 0),
        n ? displayPDF(t.content) : "docx" === t.type ? displayDocx(t.content) : "xlsx" === t.type ? displayXlsx(t.content) : "txt" === t.type ? displayTxtFile(t.content) : o && displayImage(t.content),
        (document.getElementById("document-select").value = e));
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
    // Cancel any ongoing render task
    if (renderTask) {
        renderTask.cancel();
    }

    document.getElementById("loading-indicator").style.display = "block";

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
        }).catch(function (error) {
            if (error.name === "RenderingCancelledException") {
                console.log("Render was cancelled, likely due to a new render request:", error.message);
            } else {
                console.error("An error occurred during rendering:", error);
                document.getElementById("loading-indicator").style.display = "none";
            }
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
// function populateDocumentSelectbk() {
//     let o = document.getElementById("document-select");
//     (o.innerHTML = ""),
//         fileArray.sort((e, t) => e.name.localeCompare(t.name)),
//         fileArray.forEach((e, t) => {
//             var n = document.createElement("option");
//             (n.value = t), (n.textContent = e.name), o.appendChild(n);
//         }),
//         0 < fileArray.length && loadDocument((o.value = currentDocIndex)),
//         updateRemoveButtonVisibility(),
//         o.addEventListener("change", function () {
//             loadDocument(this.selectedIndex);
//         });
// }

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
    selectElement.addEventListener("change", function() {
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
            // { description: "Next Document", windows: "Ctrl + â†’", mac: "Cmd + â†’" },
            // { description: "Previous Document", windows: "Ctrl + â†", mac: "Cmd + â†" },
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
    e < 0 ||
        e >= fileArray.length ||
        (50 < fileArray.length
            ? ((document.getElementById("spinner-loader").style.display = "block"),
              setTimeout(() => {
                  hideAllViewers(), loadDocumentContent(e), (document.getElementById("spinner-loader").style.display = "none");
              }, 1250))
            : (hideAllViewers(), loadDocumentContent(e)));
}
function loadDocumentContent(e) {
    currentDocIndex = e;
    var t = fileArray[e],
        n = (hideAllViewers(), "pdf" === t.type),
        o = "image" === t.type;
    (document.getElementById("prev-page").disabled = !n),
        (document.getElementById("next-page").disabled = !n),
        (document.getElementById("zoom-in").disabled = !(n || o)),
        (document.getElementById("zoom-out").disabled = !(n || o)),
        (document.getElementById("rotate").disabled = !(n || o)),
        (zoomLevel = 1.25),
        (pageNum = 1),
        (rotationAngle = 0),
        n ? displayPDF(t.content) : "docx" === t.type ? displayDocx(t.content) : "xlsx" === t.type ? displayXlsx(t.content) : "txt" === t.type ? displayTxtFile(t.content) : o && displayImage(t.content),
        (document.getElementById("document-select").value = e);
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
    // document.getElementById("unpin-all").addEventListener("click", () => {
    //     confirm(
    //         "Are you sure you want to clear all pins and tags? This action cannot be undone. It is recommended you download the record of your pins and tags before proceeding. If you are sure you want to clear all the pins and tags, click delete."
    //     ) && ((pinnedDocs = []), updatePinnedDocsList(), alert("All pins and tags have been cleared."));
    // }),
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
    document.getElementById("folder-select").addEventListener("click", () => {
        document.getElementById("file-input").click();
    }),
    document.getElementById("file-input").addEventListener("change", (e) => {
        let n = [],
            o = 0,
            a = e.target.files.length;
        for (let t of e.target.files) {
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
    document.getElementById("search").addEventListener("click", () => {
        (document.getElementById("spinner-search").style.display = "block"),
            setTimeout(() => {
                let l = document.getElementById("search-text").value.toLowerCase(),
                    d = document.getElementById("results-list"),
                    r = ((d.innerHTML = ""), !1),
                    t = [];
                fileArray.forEach((o, a) => {
                    var e;
                    "pdf" === o.type
                        ? ((e = pdfjsLib.getDocument({ data: atob(o.content.split(",")[1]) }).promise.then((e) =>
                              e.getPage(1).then((e) =>
                                  e.getTextContent().then((e) => {
                                      var t;
                                      e.items
                                          .map((e) => e.str)
                                          .join(" ")
                                          .toLowerCase()
                                          .includes(l) &&
                                          ((r = !0),
                                          (e = document.createElement("li")),
                                          ((t = document.createElement("a")).textContent = o.name),
                                          (t.href = "#"),
                                          (t.style.color = "white"),
                                          t.addEventListener("click", () => loadDocument(a)),
                                          e.appendChild(t),
                                          d.appendChild(e));
                                  })
                              )
                          )),
                          t.push(e))
                        : "txt" === o.type
                        ? ((e = fetch(o.content)
                              .then((e) => e.text())
                              .then((e) => {
                                  var t;
                                  e.toLowerCase().includes(l) &&
                                      ((r = !0),
                                      (e = document.createElement("li")),
                                      ((t = document.createElement("a")).textContent = o.name),
                                      (t.href = "#"),
                                      (t.style.color = "white"),
                                      t.addEventListener("click", () => loadDocument(a)),
                                      e.appendChild(t),
                                      d.appendChild(e));
                              })),
                          t.push(e))
                        : "docx" === o.type
                        ? ((e = fetch(o.content)
                              .then((e) => e.arrayBuffer())
                              .then((e) => mammoth.extractRawText({ arrayBuffer: e }))
                              .then((e) => {
                                  var t;
                                  e.value.toLowerCase().includes(l) &&
                                      ((r = !0),
                                      (e = document.createElement("li")),
                                      ((t = document.createElement("a")).textContent = o.name),
                                      (t.href = "#"),
                                      (t.style.color = "white"),
                                      t.addEventListener("click", () => loadDocument(a)),
                                      e.appendChild(t),
                                      d.appendChild(e));
                              })),
                          t.push(e))
                        : "xlsx" === o.type &&
                          ((e = fetch(o.content)
                              .then((e) => e.arrayBuffer())
                              .then((e) => {
                                  let n = XLSX.read(e, { type: "array" });
                                  n.SheetNames.forEach((e) => {
                                      var t,
                                          e = n.Sheets[e];
                                      XLSX.utils.sheet_to_csv(e).toLowerCase().includes(l) &&
                                          ((r = !0),
                                          (e = document.createElement("li")),
                                          ((t = document.createElement("a")).textContent = o.name),
                                          (t.href = "#"),
                                          (t.style.color = "white"),
                                          t.addEventListener("click", () => loadDocument(a)),
                                          e.appendChild(t),
                                          d.appendChild(e));
                                  });
                              })),
                          t.push(e));
                }),
                    Promise.all(t).then(() => {
                        var e;
                        r || (((e = document.createElement("li")).textContent = "No matches found"), (e.style.color = "white"), d.appendChild(e)), (document.getElementById("spinner-search").style.display = "none");
                    });
            }, 1250);
    }),
    document.getElementById("search-doc").addEventListener("click", () => {
        document.getElementById("search-doc").classList.add("active");
        document.getElementById("search").classList.remove("active");
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
    document.getElementById("search").addEventListener("click", () => {
        document.getElementById("search").classList.add("active");
        document.getElementById("search-doc").classList.remove("active");
        (document.getElementById("spinner-search").style.display = "block"),
            setTimeout(() => {
                let a = document.getElementById("search-text").value.toLowerCase(),
                    l = document.getElementById("results-list"),
                    d = ((l.innerHTML = ""), !1),
                    t = [];
                fileArray.forEach((n, o) => {
                    var e;
                    "pdf" === n.type &&
                        ((e = pdfjsLib.getDocument({ data: atob(n.content.split(",")[1]) }).promise.then((e) =>
                            e.getPage(1).then((e) =>
                                e.getTextContent().then((e) => {
                                    var t;
                                    e.items
                                        .map((e) => e.str)
                                        .join(" ")
                                        .toLowerCase()
                                        .includes(a) &&
                                        ((d = !0),
                                        (e = document.createElement("li")),
                                        ((t = document.createElement("a")).textContent = n.name),
                                        (t.href = "#"),
                                        (t.style.color = "white"),
                                        t.addEventListener("click", () => loadDocument(o)),
                                        e.appendChild(t),
                                        l.appendChild(e));
                                })
                            )
                        )),
                        t.push(e));
                }),
                    Promise.all(t).then(() => {
                        var e;
                        d || (((e = document.createElement("li")).textContent = "No matches found"), (e.style.color = "white"), l.appendChild(e)), (document.getElementById("spinner-search").style.display = "none");
                    });
            }, 1250);
    });
