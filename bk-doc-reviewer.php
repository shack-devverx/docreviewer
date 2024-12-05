<!-- loading indicator element -->
<div id="loading-indicator" style="display: none;">Loading...</div>
<!-- loading indicator element -->

<!-- Spinner Loader -->
<div id="spinner-loader" class="spinner" style="display: none;">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
</div>

<div id="toolbar">
    <figure class="main-logo"><a href="/">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/logo.svg'); ?>" alt="Logo">
    </a></figure>
    <div class="folder-select">
        <button id="folder-select"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/upload-file.svg'); ?>" alt="Upload">Add File</button>
        <input type=file id="file-input" multiple accept=.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpeg,.jpg,.png,.gif,.tiff style=display:none;font-size:36px>&nbsp;&nbsp;
    </div>
    <div class="document-select">
        <button id="prev-doc"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/left-double-arrow.svg'); ?>" alt="Left Arrow"></button>
        <select id="document-select"></select>
        <button id="next-doc"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/right-double-arrow.svg'); ?>" alt="Right Arrow"></button>
    </div>
    <span class="line"></span>
    <div class="pages">
        <button id=prev-page><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/left-arrow.svg'); ?>" alt="Left Arrow"></button>
        <span>Page: <span id=page-num></span> / <span id=page-count></span></span>
        <button id=next-page><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/right-arrow.svg'); ?>" alt="Right Arrow"></button>
    </div>
    <span class="line"></span>
    <div class="zoom">
        <button id=zoom-out><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/minus.svg'); ?>" alt="Minus"></button>
        <span>Zoom</span>
        <button id=zoom-in><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/plus.svg'); ?>" alt="Plus"></button>
    </div>
    <span class="line"></span>
    <button id=rotate><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/refresh.svg'); ?>" alt="Refresh"></button>
    <span class="line"></span>
    <button id=add-tag>
        <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/tag.svg'); ?>" alt="Tag">
    </button>
    <div class="toolbar-right-area">
        <div class="toolbar-button">
            <button class="button" id=flag-doc>
                <span>Pin Selected</span>
                <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/pin.svg'); ?>" alt="Pin">
            </button>
            <button class="button button-download" id=export-list>
                <span>Download Pinned</span>
                <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/download.svg'); ?>" alt="Download">
            </button>
        </div>
        <!-- <button id=unpin-all title="Unpin All Documents">
        <svg fill=#000 width=16 height=16 viewBox="-3 -2 24 24" xmlns=http://www.w3.org/2000/svg preserveAspectRatio=xMinYMin class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"/></svg>
        </button> -->
        <button id=help-button>
            <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/question-circle.svg'); ?>" alt="Question">
        </button>
    </div>
</div>
<div id=content>
    <div id=main-content>
    <div id=pdf-viewer>
        <canvas id=pdf-canvas></canvas>
    </div>
    <div id=docx-viewer></div>
    <div id=xlsx-viewer></div>
    <div id=txt-viewer></div>
    <img id=image-viewer>
</div>
<div id=search-results-container>
    <div id=search-results>
        <div class="input-icon">
            <input class="form-control" id="search-text" placeholder="Search...">
            <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/search.svg'); ?>" alt="Icon">
        </div>
        <div class="search-results-buttons">
            <button id=search-doc><span></span>Within Doc</button>
            <button id=search><span></span>Across Doc</button>
        </div>
        <div id="spinner-search" class="spinner-search" style="display: none;">
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
        </div>
        <h4>Search Results</h4>
        <ul id=results-list></ul>
    </div>
    <div id=pinned-docs>
        <h4>Pinned Documents</h4>
        <!-- <button class="delete-pinned-docs" style="float:right;width: 77px;font-size: 9px;font-weight: 800;padding: 2px 0;" id="delete-pinned-docs" disabled>Delete  Selected</button> -->
        <button class="delete-pinned-docs" id="delete-pinned-docs" disabled>Delete</button>
        <ul id=pinned-list></ul>
    </div>
    <div class="remove-files-btn">
        <button id=remove-file title="Remove selected file">Delete Document</button>
        <button id=remove-all-files title="Remove all files">Delete All Documents</button>
    </div>
    <div id=docreview-logo>
        <a href="/"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/dr-logo.svg'); ?>" alt="Doc Review Logo"></a>
    </div>
    <div id=security-logo>
        <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/sec-logo.svg'); ?>" alt="Security Logo">
    </div>
</div>
</div>
<div id=tag-popup>
<h3>Manage Tags
<button id=close-tag-popup class="icon-button close-btn">❌</button>
</h3>
<div class=popup-content>
<input id=tag-input placeholder="Enter tag name">
<input type=color id=tag-color value=#007BFF>
<span id=error-message style=color:red;display:none></span>
<div class=button-group>
<button id=save-tag class="icon-button save-btn">
<span style=color:green>✔</span>
</button>
<button id=delete-tag class="icon-button delete-btn"><svg fill=#FF000D width=16 height=16 viewBox="-3 -2 24 24" xmlns=http://www.w3.org/2000/svg preserveAspectRatio=xMinYMin class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"/></svg></button>
</div>
<ul id=tag-list></ul>
</div>
</div>
<div id="help-window" class="modal">
    <div class="help-window-header">
        <div class="help-window-header_title">
            <h2>We’re here to help! Have a question not answered below?</h2>
            <span id="close-help" class="close"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/x-mark-dark.svg'); ?>" alt="Icon"></span>
        </div>
        <a class="help-window-header_contact" href="https://documentreview.law/contact/">Contact Us Here</a>
    </div>
    <div class="help-shortcuts">
        <div class="help-shortcuts_title">
            <h3>Icon Actions</h3>
        </div>
        <ul class="help-shortcuts_list">
            <li><h4>Open Folder/Files</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/upload.svg'); ?>" alt="Icon"></li>
            <li><h4>Export List of Pinned Docs (.csv)</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/export.svg'); ?>" alt="Icon"></li>
            <li><h4>Previous Document</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/chevron-double-left.svg'); ?>" alt="Icon"></li>
            <li><h4>Manage Tags</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/tag.svg'); ?>" alt="Icon"></li>
            <li><h4>Next Document</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/chevron-double-right.svg'); ?>" alt="Icon"></li>
            <li><h4>Clear All Pinned Docs</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/trash.svg'); ?>" alt="Icon"></li>
            <li><h4>Previous Page</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/chevron-left.svg'); ?>" alt="Icon"></li>
            <li><h4>Delete/Remove Current File</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/chevron-left.svg'); ?>" alt="Icon"></li>
            <li><h4>Next Page</h4><img style="rotate: 180deg;" src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/chevron-left.svg'); ?>" alt="Icon"></li>
            <li><h4>Zoom</h4><figure><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/plus.svg'); ?>" alt="Icon"><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/minus.svg'); ?>" alt="Icon"></figure></li>
            <li><h4>Delete/Remove All Files</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/trash.svg'); ?>" alt="Icon"></li>
            <li><h4>Rotate</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/rotate.svg'); ?>" alt="Icon"></li>
            <li><h4>Search Across Documents</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/search.svg'); ?>" alt="Icon"></li>
            <li><h4>Search Within Document</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/search.svg'); ?>" alt="Icon"></li>
            <li><h4>Pin Document</h4><img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/help/pin.svg'); ?>" alt="Icon"></li>
        </ul>
    </div>
    <div class="keyboard-shortcuts">
        <div class="keyboard-shortcuts_main_title">
            <h3>Keyboard Shortcuts</h3>
        </div>
        <div class="keyboard-shortcuts_content">
            <ul class="keyboard-shortcuts_windows_list">
                <li class="keyboard-shortcuts_title"><h3>Actions</h3><h3>Windows</h3></li>
                <li class="keyboard-shortcuts_list_content">Zoom In <div class="Windows-shortcuts"><span class="shortcut">Ctrl</span>+<span class="shortcut">Alt</span>+<span class="shortcut shortcut_sm">=</span></div></li>
                <li class="keyboard-shortcuts_list_content">Zoom Out <div class="Windows-shortcuts"><span class="shortcut">Ctrl</span>+<span class="shortcut">Alt</span>+<span class="shortcut shortcut_sm">-</span></div></li>
                <li class="keyboard-shortcuts_list_content">Focus Search Box <div class="Windows-shortcuts"><span class="shortcut">Ctrl</span>+<span class="shortcut shortcut_sm">F</span></div></li>
                <li class="keyboard-shortcuts_list_content">Next Document <div class="Windows-shortcuts"><span class="shortcut">Ctrl</span>+<span class="shortcut shortcut_sm" style="rotate: 90deg;">⇧</span></div></li>
                <li class="keyboard-shortcuts_list_content">Previous Document <div class="Windows-shortcuts"><span class="shortcut">Ctrl</span>+<span class="shortcut shortcut_sm" style="rotate: -90deg;">⇧</span></div></li>
                <li class="keyboard-shortcuts_list_content">Next Doc Page <div class="Windows-shortcuts"><span class="shortcut">Shift</span>+<span class="shortcut shortcut_sm" style="rotate: 90deg;">⇧</span></div></li>
                <li class="keyboard-shortcuts_list_content">Prev Doc Page <div class="Windows-shortcuts"><span class="shortcut">Shift</span>+<span class="shortcut shortcut_sm" style="rotate: -90deg;">⇧</span></div></li>
            </ul>
            <ul class="keyboard-shortcuts_windows_list">
                <li class="keyboard-shortcuts_title"><h3>MAC</h3></li>
                <li class="keyboard-shortcuts_list_content"><div class="Windows-shortcuts"><span class="shortcut shortcut_sm">⌘</span>+<span class="shortcut">Shift</span>+<span class="shortcut shortcut_sm">=</span></div></li>
                <li class="keyboard-shortcuts_list_content"><div class="Windows-shortcuts"><span class="shortcut shortcut_sm">⌘</span>+<span class="shortcut">Shift</span>+<span class="shortcut shortcut_sm">-</span></div></li>
                <li class="keyboard-shortcuts_list_content"><div class="Windows-shortcuts"><span class="shortcut shortcut_sm">⌘</span>+<span class="shortcut shortcut_sm">F</span></div></li>
                <li class="keyboard-shortcuts_list_content"><div class="Windows-shortcuts"><span class="shortcut shortcut_sm">⌘</span>+<span class="shortcut shortcut_sm" style="rotate: 90deg;">⇧</span></div></li>
                <li class="keyboard-shortcuts_list_content"><div class="Windows-shortcuts"><span class="shortcut shortcut_sm">⌘</span>+<span class="shortcut shortcut_sm" style="rotate: -90deg;">⇧</span></div></li>
            </ul>
        </div>
    </div>
</div>
<div class="help-overlay"></div>

<!-- for spinner -->
<div id="spinner" class="spinner" style="display: none;">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
  </div>