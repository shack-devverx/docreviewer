<div id="loading-indicator" style="display: none;">Loading...</div>
<div id="spinner-loader" class="spinner" style="display: none;">
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
</div>

<div id="toolbar">
<button id="folder-select">&#x1F4C2;</button>
<input type=file id="file-input" multiple accept=.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpeg,.jpg,.png,.gif,.tiff style=display:none;font-size:36px>&nbsp;&nbsp;
<button id="prev-doc">&#x23ee;</button>
<select id="document-select" style=min-width:140px;max-width:140px></select>
<button id="next-doc">&#x23ed;</button>
<button id=remove-file title="Remove selected file">❌</button>&nbsp;&nbsp;
<button id=prev-page>&#x25c0;</button>
<span style=padding-top:3px;font-weight:700;text-decoration:underline>Page: <span id=page-num></span> / <span id=page-count></span></span>
<button id=next-page>&#x25b6;</button>&nbsp;&nbsp;
<button id=zoom-out>&#x2796;</button>
<button id=zoom-in>&#x2795;</button>
<button id=rotate>&#x1F504;</button>&nbsp;&nbsp;
<input id=search-text placeholder=Search...>
<button id=search-doc>&#128270;</button>
<button id=search style=width:60px>&#128270;&#128270;</button>&nbsp;
<button id=remove-all-files title="Remove all files">❌&nbsp;❌</button>&nbsp;&nbsp;
<button id=flag-doc>
    <svg width=17 height=16 viewBox="0 0 17 16" fill=none xmlns=http://www.w3.org/2000/svg>
        <g clip-path=url(#a)>
            <path d="M.826 16c-.37-.16-.43-.43-.18-.75 1.15-1.45 2.37-2.84 3.69-4.13.63-.62 1.25-1.24 1.88-1.88-.04-.05-.08-.09-.12-.13-.82-.83-1.65-1.65-2.47-2.48-.26-.26-.26-.49.01-.74.7-.64 1.75-.69 2.51-.11.03.03.07.05.11.08l4.66-4c-.15-.29-.21-.59-.16-.91.05-.34.2-.62.45-.85.14-.13.35-.13.51-.02.04.03.07.06.11.09 1.45 1.45 2.9 2.9 4.36 4.35.13.13.21.26.15.45a.5.5 0 0 1-.11.2c-.41.43-1.07.55-1.61.31-.08-.03-.13-.05-.2.03-1.29 1.51-2.59 3.02-3.89 4.53-.01.02-.02.03-.04.06.28.34.46.72.48 1.16.04.6-.16 1.1-.58 1.53-.18.19-.43.17-.64-.03-.79-.78-1.57-1.57-2.35-2.35-.04-.04-.07-.09-.11-.15-.07.06-.11.11-.16.15-1.31 1.29-2.57 2.63-3.96 3.84-.64.56-1.3 1.09-1.96 1.63-.07.05-.15.09-.23.13h-.16z" fill=#000 /></g>
        </svg>
</button>
<button id=add-tag>
<svg width=18 height=18 viewBox="0 0 20 14" fill=none xmlns=http://www.w3.org/2000/svg><g clip-path=url(#a)><path d="M.692 9.136v-.329c.071-.402.317-.692.597-.971 2.319-2.311 4.632-4.63 6.954-6.94.165-.165.378-.286.583-.403.125-.073.276-.1.417-.147h5.62c.014.006.026.016.041.019.692.137 1.095.626 1.095 1.337q.002 2.577 0 5.155c0 .457-.162.864-.483 1.187q-3.591 3.602-7.198 7.193c-.143.143-.33.265-.52.334-.54.197-1.002.033-1.398-.364q-2.549-2.554-5.105-5.103c-.28-.278-.529-.566-.602-.968zm11.463-3.689c.679.026 1.265-.544 1.292-1.257.026-.68-.543-1.265-1.257-1.292-.68-.025-1.278.543-1.29 1.258-.01.673.495 1.26 1.255 1.292" fill=#000 /></g><defs><clipPath id=a><path fill=#fff d="M.346 0h16v16h-16z"/></clipPath></defs></svg>
</button>
<button id=export-list style=width:35px>
<svg width=20 height=20 viewBox="0 0 16 16" xmlns=http://www.w3.org/2000/svg><path fill=#000 fill-rule=evenodd d="M14 9a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a1 1 0 0 1 2 0v3h10v-3a1 1 0 0 1 1-1M8 1a1 1 0 0 1 1 1v4.586l1.293-1.293a1 1 0 1 1 1.414 1.414L8 10.414 4.293 6.707a1 1 0 0 1 1.414-1.414L7 6.586V2a1 1 0 0 1 1-1"/></svg>
</button>
<button id=unpin-all title="Unpin All Documents">
<svg fill=#000 width=16 height=16 viewBox="-3 -2 24 24" xmlns=http://www.w3.org/2000/svg preserveAspectRatio=xMinYMin class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"/></svg>
</button>
<button id=help-button>
<svg width=16 height=16 viewBox="0 0 16 16" fill=none xmlns=http://www.w3.org/2000/svg><path d="M8.313 0C5.82 0 4.203 1.022 2.935 2.845a.75.75 0 0 0 .162 1.027l1.348 1.022a.75.75 0 0 0 1.039-.13c.783-.98 1.363-1.545 2.586-1.545.961 0 2.15.619 2.15 1.551 0 .705-.581 1.067-1.53 1.599-1.107.62-2.572 1.393-2.572 3.325V10c0 .414.335.75.75.75h2.264a.75.75 0 0 0 .75-.75v-.18c0-1.34 3.915-1.396 3.915-5.02 0-2.73-2.831-4.8-5.484-4.8M8 11.67a2.167 2.167 0 0 0-2.165 2.165C5.835 15.03 6.806 16 8 16a2.167 2.167 0 0 0 2.165-2.165A2.167 2.167 0 0 0 8 11.671" fill=#000 /></svg>
</button>&nbsp;
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
<ul id=pinned-list></ul>
</div>
<div id=docreview-logo>
<a href="<?php echo esc_url(site_url()); ?>">
    <img src="<?php echo esc_url(get_template_directory_uri() . '/doc-reviewer/images/logo.jpg'); ?>" alt="Doc Review Logo">
</a>
</div>
<div id=security-logo>
<img src="<?php echo esc_url( get_template_directory_uri() . '/doc-reviewer/images/security.png' ); ?>" alt="Security Logo">
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
    <span id="close-help" class="close">&times;</span>
    
    <div class="info-text"><h2 style="font-size:18px;margin:10px 0;padding:0">We're here to help! Have a question not answered below?</h2></div>

    <div class="help-container">
        <div class="help-section">
            <h2>Help Content</h2>
            
            <!-- <ul>
                <li>&#x1F4C2; - Open Folder/Files</li>
                <li>&#x23ee; - Previous Document</li>
                <li>&#x23ed; - Next Document</li>
                <li>&#x25c0; - Previous Page<sup>*</sup></li>
                <li>&#x25b6; - Next Page<sup>*</sup></li>
                <li>&#x2796; / &#x2795; - Zoom<sup>*</sup></li>
                <li>&#x1F504; - Rotate<sup>*</sup></li>
                <li>&#128270; - Search Within Document</li>
                <li>&#128270;&#128270; - Search Across Documents</li>
                <li>&#x1f4cc; - Pin Document</li>
                <li>&#x1f4cc;&#x2b07; - Export List of Pinned Docs (.csv)</li><br>
                <li><sup>*</sup>&nbsp;<i>Only for PDFs and Image Files</i></li>
            </ul> -->
            
            <table class="help-table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>&#x1F4C2;</td>
                        <td>Open Folder/Files</td>
                    </tr>
                    <tr>
                        <td>&#x23ee;</td>
                        <td>Previous Document</td>
                    </tr>
                    <tr>
                        <td>&#x23ed;</td>
                        <td>Next Document</td>
                    </tr>
                    <tr>
                        <td>&#x25c0;</td>
                        <td>Previous Page<sup>*</sup></td>
                    </tr>
                    <tr>
                        <td>&#x25b6;</td>
                        <td>Next Page<sup>*</sup></td>
                    </tr>
                    <tr>
                        <td>&#x2796; / &#x2795;</td>
                        <td>Zoom<sup>*</sup></td>
                    </tr>
                    <tr>
                        <td>&#x1F504;</td>
                        <td>Rotate<sup>*</sup></td>
                    </tr>
                    <tr>
                        <td>&#128270;</td>
                        <td>Search Within Document</td>
                    </tr>
                    <tr>
                        <td>&#128270;&#128270;</td>
                        <td>Search Across Documents</td>
                    </tr>
                    <tr>
                        <td><svg width=17 height=16 viewBox="0 0 17 16" fill=none xmlns=http://www.w3.org/2000/svg><g clip-path=url(#a)><path d="M.826 16c-.37-.16-.43-.43-.18-.75 1.15-1.45 2.37-2.84 3.69-4.13.63-.62 1.25-1.24 1.88-1.88-.04-.05-.08-.09-.12-.13-.82-.83-1.65-1.65-2.47-2.48-.26-.26-.26-.49.01-.74.7-.64 1.75-.69 2.51-.11.03.03.07.05.11.08l4.66-4c-.15-.29-.21-.59-.16-.91.05-.34.2-.62.45-.85.14-.13.35-.13.51-.02.04.03.07.06.11.09 1.45 1.45 2.9 2.9 4.36 4.35.13.13.21.26.15.45a.5.5 0 0 1-.11.2c-.41.43-1.07.55-1.61.31-.08-.03-.13-.05-.2.03-1.29 1.51-2.59 3.02-3.89 4.53-.01.02-.02.03-.04.06.28.34.46.72.48 1.16.04.6-.16 1.1-.58 1.53-.18.19-.43.17-.64-.03-.79-.78-1.57-1.57-2.35-2.35-.04-.04-.07-.09-.11-.15-.07.06-.11.11-.16.15-1.31 1.29-2.57 2.63-3.96 3.84-.64.56-1.3 1.09-1.96 1.63-.07.05-.15.09-.23.13h-.16z" fill=#000 /></g><defs><clipPath id=a><path fill=#fff d="M.496 0h15.85v16H.496z"/></clipPath></defs></svg></td>
                        <td>Pin Document</td>
                    </tr>
                    <tr>
                        <td><svg width=20 height=20 viewBox="0 0 16 16" xmlns=http://www.w3.org/2000/svg><path fill=#000 fill-rule=evenodd d="M14 9a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a1 1 0 0 1 2 0v3h10v-3a1 1 0 0 1 1-1M8 1a1 1 0 0 1 1 1v4.586l1.293-1.293a1 1 0 1 1 1.414 1.414L8 10.414 4.293 6.707a1 1 0 0 1 1.414-1.414L7 6.586V2a1 1 0 0 1 1-1"/></svg></td>
                        <td>Export List of Pinned Docs (.csv)</td>
                    </tr>
                    <tr>
                        <td><svg width=18 height=18 viewBox="0 0 20 14" fill=none xmlns=http://www.w3.org/2000/svg><g clip-path=url(#a)><path d="M.692 9.136v-.329c.071-.402.317-.692.597-.971 2.319-2.311 4.632-4.63 6.954-6.94.165-.165.378-.286.583-.403.125-.073.276-.1.417-.147h5.62c.014.006.026.016.041.019.692.137 1.095.626 1.095 1.337q.002 2.577 0 5.155c0 .457-.162.864-.483 1.187q-3.591 3.602-7.198 7.193c-.143.143-.33.265-.52.334-.54.197-1.002.033-1.398-.364q-2.549-2.554-5.105-5.103c-.28-.278-.529-.566-.602-.968zm11.463-3.689c.679.026 1.265-.544 1.292-1.257.026-.68-.543-1.265-1.257-1.292-.68-.025-1.278.543-1.29 1.258-.01.673.495 1.26 1.255 1.292" fill=#000 /></g><defs><clipPath id=a><path fill=#fff d="M.346 0h16v16h-16z"/></clipPath></defs></svg></td>
                        <td>Manage Tags</td>
                    </tr>
                    <tr>
                        <td><svg fill=#000 width=16 height=16 viewBox="-3 -2 24 24" xmlns=http://www.w3.org/2000/svg preserveAspectRatio=xMinYMin class="jam jam-trash-f"><path d="M12 2h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm3.8 6-.613 9.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.205 8zM7 9a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1m4 0a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0v-7a1 1 0 0 0-1-1"/></svg></td>
                        <td>Clear All Pinned Docs</td>
                    </tr>
                    <tr>
                        <td>❌</td>
                        <td>Delete/Remove Current File</td>
                    </tr>
                    <tr>
                        <td>❌ ❌</td>
                        <td>Delete/Remove All Files</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><sup>*</sup> Only for PDFs and Image Files</td>
                    </tr>
                </tfoot>
            </table>

        </div>
        <div class="help-section">
            <h2>Keyboard Shortcuts</h2>
            <!-- <ul id="keyboard-shortcuts">
              
            </ul> -->

            <table class="shortcut-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Windows</th>
                        <th>Mac</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Next Document</td>
                        <td>Ctrl + →</td>
                        <td>Cmd + →</td>
                    </tr>
                    <tr>
                        <td>Previous Document</td>
                        <td>Ctrl + ←</td>
                        <td>Cmd + ←</td>
                    </tr>
                    <tr>
                        <td>Zoom In</td>
                        <td>Ctrl + Alt + =</td>
                        <td>Cmd + Shift + =</td>
                    </tr>
                    <tr>
                        <td>Zoom Out</td>
                        <td>Ctrl + Alt + -</td>
                        <td>Cmd + shift + -</td>
                    </tr>
                    <tr>
                        <td>Focus Search Box</td>
                        <td>Ctrl + F</td>
                        <td>Cmd + F</td>
                    </tr>
                </tbody>
            </table>
            

        </div>
    </div>
    <div class="contact-us">
        <a href="<?php echo esc_url(site_url().'/contact/'); ?>" target="_new" style="color:#000000;font-weight:600;text-align:center;font-size:18px">Contact Us Here.</a>
    </div>
</div>
<div class="help-overlay"></div>

<!-- for spinner -->
    <div id="spinner" class="spinner" style="display: none;">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
  </div>