alert(
    "ATTN USER: select the folder button on the toolbar to choose a local folder of documents and images for review. This is a CONFIDENTIAL PROTOTYPE for demonstration purposes only. No other use is permitted. Â© 2024 Adam J Schwartz, All Rights Reserved"
),
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
    (d.innerHTML = ""),
        pinnedDocs.forEach((o, e) => {
            var t = document.createElement("li"),
                n = ((t.textContent = o.name), document.createElement("span"));
            (n.innerHTML = `
                   <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" stroke="#FF000D" stroke-miterlimit="10"><path d="M10.431 11.319a1.84 1.84 0 0 1-.56 1.468c-.176.177-.416.162-.61-.032q-1.131-1.13-2.26-2.262c-.04-.037-.068-.087-.108-.14-.067.062-.11.101-.151.141-1.257 1.242-2.468 2.531-3.803 3.691-.615.536-1.253 1.044-1.883 1.563-.065.052-.147.084-.22.126h-.15c-.353-.151-.415-.415-.17-.723a42 42 0 0 1 3.548-3.976c.604-.59 1.198-1.193 1.809-1.802l-.116-.122-2.38-2.38c-.253-.253-.25-.474.013-.714a1.865 1.865 0 0 1 2.412-.102q.044.036.102.08l1.118-.96 3.904 3.903-.919 1.07q-.016.02-.038.055c.273.322.437.692.462 1.114zm6.05-6.544a.5.5 0 0 1-.104.192 1.39 1.39 0 0 1-1.55.303c-.075-.033-.122-.051-.19.027Q13.232 6.94 11.823 8.58L7.919 4.678l3.365-2.89c-.14-.278-.2-.565-.153-.873q.075-.487.431-.82a.39.39 0 0 1 .486-.023 1 1 0 0 1 .102.09l4.186 4.183c.12.12.197.254.146.427z" fill="#FF000D" stroke-width=".249"/><path d="M14.538 11.498 4.237 1.447" stroke-width=".746" stroke-linecap="round"/></g><defs><clipPath id="a"><path fill="#fff" d="M.244 0h16.252v16H.244z"/></clipPath></defs></svg>
                `),
                (n.style.cursor = "pointer"),
                (n.style.marginLeft = "10px"),
                n.addEventListener("click", () => {
                    unpinDocument(e);
                });
            let a = document.createElement("select"),
                l =
                    (a.classList.add("tag-dropdown"),
                    (a.innerHTML = '<option value="">Select Tag</option>'),
                    tags.forEach((e) => {
                        var t = document.createElement("option");
                        (t.value = e.name), (t.textContent = e.name), a.appendChild(t);
                    }),
                    a.addEventListener("change", () => {
                        var e = tags.find((e) => e.name === a.value);
                        e && addTagToDocument(o, e), (a.value = "");
                    }),
                    document.createElement("div"));
            (l.style.marginTop = "5px"),
                o.tags &&
                    o.tags.forEach((e) => {
                        var t = document.createElement("span"),
                            n = ((t.textContent = e.name), (t.className = "assigned-tag"), (t.style.backgroundColor = e.color), (t.style.color = getContrastColor(e.color)), document.createElement("span"));
                        (n.textContent = "âœ–"), (n.style.marginLeft = "5px"), (n.style.cursor = "pointer"), n.addEventListener("click", () => removeTagFromDocument(o, e)), t.appendChild(n), l.appendChild(t);
                    }),
                t.appendChild(n),
                t.appendChild(a),
                t.appendChild(l),
                d.appendChild(t);
        }),
        savePinnedDocsToLocalStorage();
}
function unpinDocument(e) {
    pinnedDocs.splice(e, 1), updatePinnedDocsList();
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
    (document.getElementById("pdf-viewer").style.display = "block"),
        pdfjsLib.getDocument({ data: atob(e.split(",")[1]) }).promise.then((e) => {
            (pdfDoc = e), (pageCount = e.numPages), (document.getElementById("page-count").textContent = pageCount), (rotationAngle = 0), renderPage((pageNum = 1));
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
    renderTask && renderTask.cancel(),
        (document.getElementById("loading-indicator").style.display = "block"),
        pdfDoc.getPage(n).then(function (e) {
            var t = e.getViewport({ scale: zoomLevel, rotation: rotationAngle }),
                t = ((canvas.height = t.height), (canvas.width = t.width), (canvas.style.width = t.width + "px"), (canvas.style.height = t.height + "px"), { canvasContext: ctx, viewport: t });
            (renderTask = e.render(t)).promise
                .then(() => {
                    (document.getElementById("page-num").textContent = n), saveDocumentState(), (document.getElementById("loading-indicator").style.display = "none");
                })
                .catch(function (e) {
                    "RenderingCancelledException" === e.name
                        ? console.log("Render was cancelled, likely due to a new render request:", e.message)
                        : (console.error("An error occurred during rendering:", e), (document.getElementById("loading-indicator").style.display = "none"));
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
function populateDocumentSelect() {
    let o = document.getElementById("document-select");
    (o.innerHTML = ""),
        fileArray.sort((e, t) => e.name.localeCompare(t.name)),
        fileArray.forEach((e, t) => {
            var n = document.createElement("option");
            (n.value = t), (n.textContent = e.name), o.appendChild(n);
        }),
        0 < fileArray.length && loadDocument((o.value = currentDocIndex)),
        updateRemoveButtonVisibility(),
        o.addEventListener("change", function () {
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
            { description: "Next Document", windows: "Ctrl + â†’", mac: "Cmd + â†’" },
            { description: "Previous Document", windows: "Ctrl + â†", mac: "Cmd + â†" },
            { description: "Zoom In", windows: "Ctrl + Alt + =", mac: "Cmd + Shift + =" },
            { description: "Zoom Out", windows: "Ctrl + Alt + -", mac: "Cmd + Shift + -" },
            { description: "Focus Search Box", windows: "Ctrl + F", mac: "Cmd + F" },
            { description: "Next Doc Page", windows: "Shift + â†’", mac: "Shift + â†’" },
            { description: "Prev Doc Page", windows: "Shift + â†", mac: "Shift + â†" },
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
    0 <= e && e < fileArray.length && loadDocument(e);
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
    document.getElementById("unpin-all").addEventListener("click", () => {
        confirm(
            "Are you sure you want to clear all pins and tags? This action cannot be undone. It is recommended you download the record of your pins and tags before proceeding. If you are sure you want to clear all the pins and tags, click delete."
        ) && ((pinnedDocs = []), updatePinnedDocsList(), alert("All pins and tags have been cleared."));
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
            let t = fileArray[e];
            deleteFileFromIndexedDB(t.name)
                .then(() => {
                    console.log(`File ${t.name} deleted from IndexedDB`), fileArray.splice(e, 1), populateDocumentSelect(), 0 < fileArray.length ? loadDocument(0) : hideAllViewers();
                })
                .catch((e) => {
                    console.error(`Error deleting file ${t.name} from IndexedDB:`, e), alert("Error deleting file. Please try again.");
                });
        }
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
        if (0 === pinnedDocs.length) alert("No pinned documents to export.");
        else {
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
                    e.preventDefault(), navigateDocument(1);
                    break;
                case "ArrowLeft":
                    e.preventDefault(), navigateDocument(-1);
                    break;
                case "f":
                    e.preventDefault(), document.getElementById("search-text").focus();
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
