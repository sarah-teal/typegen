document.addEventListener('DOMContentLoaded', function() {
  // Get essential DOM elements
  const richTextEditor = document.getElementById('richTextEditor');
  const textPreview = document.getElementById('textPreview');
  const fontSelect = document.getElementById('fontSelect');
  const fontSize = document.getElementById('fontSize');
  const textColor = document.getElementById('textColor');
  const letterSpacing = document.getElementById('letterSpacing');
  const letterSpacingValue = document.getElementById('letterSpacingValue');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const underlineBtn = document.getElementById('underlineBtn');
  const strikeBtn = document.getElementById('strikeBtn');
  const alignLeftBtn = document.getElementById('alignLeftBtn');
  const alignCenterBtn = document.getElementById('alignCenterBtn');
  const alignRightBtn = document.getElementById('alignRightBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const resetBtn = document.getElementById('resetBtn');
  const customFontBtn = document.getElementById('customFontBtn');
  const fontUploader = document.getElementById('fontUploader');
  const customFontsList = document.getElementById('customFontsList');

  // Font mapping
  const fontMap = {
    'font1': 'InstacartContrastHeadline',
    'font2': 'InstacartContrastHeadlineBold',
    'font3': 'InstacartContrastHeadlineExtraBold',
    'font4': 'InstacartContrastTextBold',
    'font5': 'InstacartSansHeadlineRegular',
    'font6': 'InstacartSansHeadlineSemiBold',
    'font7': 'InstacartSansTextRegularItalic',
    'font8': 'BaguetScriptRegular',
    'font9': 'InstacartSansTextRegular'
  };

  // Default settings
  const defaultSettings = {
    fontFamily: 'font1',
    fontSize: '36',
    textColor: '#000000',
    letterSpacing: '0',
    alignment: 'center'
  };

  // Custom fonts array
  const customFonts = [];
  let customFontCounter = 1;

  // Enable CSS styling
  document.execCommand("styleWithCSS", false, true);

  // Initialize with sample text
  if (richTextEditor) richTextEditor.innerHTML = '<span style="color: #000000;">Sample Text</span>';

  // Preload the background image
  const bgImage = new Image();
  bgImage.src = 'produce-green.jpg';

  // Function to check if an image exists
  function imageExists(url, callback) {
    const img = new Image();
    img.onload = function() { callback(true); };
    img.onerror = function() { callback(false); };
    img.src = url;
  }

  // Check if the background image exists
  imageExists('produce-green.jpg', function(exists) {
    if (!exists) {
      console.error("CRITICAL ERROR: Background image 'produce-green.jpg' not found!");
    } else {
      console.log("Background image verified: produce-green.jpg exists");
    }
  });

  // Helper functions for selection preservation
  function saveSelection(containerEl) {
    if (window.getSelection && document.createRange) {
      var range = window.getSelection().getRangeAt(0);
      var preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(containerEl);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      var start = preSelectionRange.toString().length;

      return {
        start: start,
        end: start + range.toString().length
      };
    } else {
      return null;
    }
  }

  function restoreSelection(containerEl, savedSel) {
    if (window.getSelection && document.createRange) {
      let charIndex = 0, range = document.createRange();
      range.setStart(containerEl, 0);
      range.collapse(true);
      
      let nodeStack = [containerEl], node, foundStart = false, stop = false;
      
      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType == 3) {
          var nextCharIndex = charIndex + node.length;
          if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
            range.setStart(node, savedSel.start - charIndex);
            foundStart = true;
          }
          if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
            range.setEnd(node, savedSel.end - charIndex);
            stop = true;
          }
          charIndex = nextCharIndex;
        } else {
          var i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }
      
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // Helper function to get elements in a selection
  function getSelectedElements(range) {
    const elements = [];
    
    // If there's no selection or it's collapsed (cursor only)
    if (range.collapsed) {
      // Get the parent element of the cursor position
      let node = range.startContainer;
      if (node.nodeType === 3) { // Text node
        node = node.parentNode;
      }
      elements.push(node);
      return elements;
    }
    
    // For actual selections, get all elements in the range
    const startElement = range.startContainer.nodeType === 3 ? 
                        range.startContainer.parentNode : range.startContainer;
    const endElement = range.endContainer.nodeType === 3 ? 
                      range.endContainer.parentNode : range.endContainer;
    
    // If selection is within a single element
    if (startElement === endElement) {
      elements.push(startElement);
      return elements;
    }
    
    // If selection spans multiple elements
    let currentNode = startElement;
    const endParent = endElement.parentNode;
    
    while (currentNode && currentNode !== endParent) {
      if (currentNode.nodeType === 1) { // Element node
        elements.push(currentNode);
      }
      
      // Get the next node
      if (currentNode.firstChild) {
        currentNode = currentNode.firstChild;
      } else if (currentNode.nextSibling) {
        currentNode = currentNode.nextSibling;
      } else {
        // Go up and find the next sibling
        let parent = currentNode.parentNode;
        while (parent && !parent.nextSibling) {
          parent = parent.parentNode;
        }
        if (parent) {
          currentNode = parent.nextSibling;
        } else {
          break;
        }
      }
    }
    
    // Also add the end element
    elements.push(endElement);
    
    return elements;
  }

  // NEW FUNCTION: Ensure proper coloring in dark mode without cursor issues
  function ensureProperColoringInDarkMode() {
    if (!richTextEditor || !document.body.classList.contains('dark-mode')) return;
    
    // Save current selection and cursor position
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
    
    // Get all direct text nodes in the editor (not inside spans)
    const textNodes = [];
    const walker = document.createTreeWalker(richTextEditor, NodeFilter.SHOW_TEXT, null, false);
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentNode === richTextEditor) {
        textNodes.push(node);
      }
    }
    
    // Process each text node only if it's directly under the editor
    textNodes.forEach(textNode => {
      const textContent = textNode.textContent;
      if (textContent.trim()) {
        const span = document.createElement('span');
        span.style.color = "#000000";
        span.textContent = textContent;
        
        // Adjust range if this node is involved in the selection
        if (savedRange) {
          if (textNode === savedRange.startContainer) {
            savedRange.setStart(span.firstChild, savedRange.startOffset);
          }
          if (textNode === savedRange.endContainer) {
            savedRange.setEnd(span.firstChild, savedRange.endOffset);
          }
        }
        
        textNode.parentNode.replaceChild(span, textNode);
      }
    });
    
    // Restore selection
    if (savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  }

  // Function to apply text color with special dark mode handling
  function applyTextColor(color) {
    if (!richTextEditor) return;
    
    richTextEditor.focus();
    
    // Get current selection
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      // No selection, handle appropriately
      // If there's no text yet, or all text is selected
      if (richTextEditor.textContent.trim() === '' || 
          selection.toString() === richTextEditor.textContent) {
        // Insert a new span with the color or replace all content
        richTextEditor.innerHTML = `<span style="color: ${color};">${richTextEditor.textContent || 'Sample Text'}</span>`;
      } else {
        // Just apply the standard command
        document.execCommand('foreColor', false, color);
      }
      
      updatePreview();
      return;
    }
    
    // Execute standard command first
    document.execCommand('foreColor', false, color);
    
    // Then force apply the color with direct manipulation
    const range = selection.getRangeAt(0);
    
    // If range is collapsed (just cursor), wrap parent text
    if (range.collapsed) {
      let parentElement = range.startContainer.parentNode;
      if (parentElement === richTextEditor) {
        // We need to create a new span to wrap current text
        const newSpan = document.createElement('span');
        newSpan.style.color = color;
        
        // Wrap all text nodes
        Array.from(richTextEditor.childNodes).forEach(node => {
          if (node.nodeType === 3) { // Text node
            const textContent = node.textContent;
            if (textContent.trim()) {
              const span = document.createElement('span');
              span.style.color = color;
              span.textContent = textContent;
              richTextEditor.replaceChild(span, node);
            }
          }
        });
      } else {
        // Set the color directly
        parentElement.style.color = color;
      }
    } else {
      // For an actual selection
      try {
        const selectedElements = getSelectedElements(range);
        
        selectedElements.forEach(el => {
          // Force color via inline style
          el.style.color = color;
        });
      } catch (e) {
        console.error("Error applying color:", e);
      }
    }
    
    // Update preview
    updatePreview();
  }

  // CORE PREVIEW FUNCTIONALITY
  function updatePreview() {
    if (!richTextEditor || !textPreview) {
      console.error("Missing critical elements for preview");
      return;
    }

    // Store the original HTML content
    const originalHTML = richTextEditor.innerHTML;
    
    // Copy HTML content
    textPreview.innerHTML = originalHTML;
    
    // Apply font family
    if (fontSelect && fontMap[fontSelect.value]) {
      textPreview.style.fontFamily = fontMap[fontSelect.value];
      richTextEditor.style.fontFamily = fontMap[fontSelect.value];
    }
    
    // Apply font size
    if (fontSize) {
      const size = fontSize.value + 'px';
      textPreview.style.fontSize = size;
      richTextEditor.style.fontSize = size;
    }
    
    // Apply letter spacing
    if (letterSpacing) {
      const spacing = letterSpacing.value + 'px';
      textPreview.style.letterSpacing = spacing;
      richTextEditor.style.letterSpacing = spacing;
      if (letterSpacingValue) {
        letterSpacingValue.textContent = spacing;
      }
    }
    
    // Fix text decoration colors
    fixTextDecorationColors();
    
    // Ensure alignments are properly synced
    syncTextAlignment();

    // CRITICAL COLOR PRESERVATION in dark mode
    if (document.body.classList.contains('dark-mode')) {
      // Process the preview
      const textNodes = [];
      const walker = document.createTreeWalker(textPreview, NodeFilter.SHOW_TEXT, null, false);
      
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentNode === textPreview) {
          textNodes.push(node);
        }
      }
      
      // Wrap text nodes with spans in the preview
      textNodes.forEach(textNode => {
        const textContent = textNode.textContent;
        if (textContent.trim()) {
          const span = document.createElement('span');
          span.style.color = "#000000";
          span.textContent = textContent;
          textNode.parentNode.replaceChild(span, textNode);
        }
      });
      
      // Force colors on all spans without color in preview
      textPreview.querySelectorAll('span:not([style*="color"])').forEach(span => {
        span.style.color = "#000000";
      });
      
      // Re-apply any explicit colors in preview
      textPreview.querySelectorAll('[style*="color"]').forEach(el => {
        const match = el.getAttribute('style').match(/color:\s*(.*?)(;|$)/);
        if (match && match[1]) {
          const originalColor = match[1].trim();
          el.style.setProperty('color', originalColor, 'important');
        }
      });
      
      // Ensure proper coloring in editor without disturbing cursor
      ensureProperColoringInDarkMode();
    }
    
    console.log("Enhanced preview updated with color preservation");
  }

  // Function to sync text alignment between editor and preview
  function syncTextAlignment() {
    // Get current alignment from buttons
    let currentAlignment = 'center'; // Default
    
    if (alignLeftBtn && alignLeftBtn.classList.contains('active')) {
      currentAlignment = 'left';
    } else if (alignRightBtn && alignRightBtn.classList.contains('active')) {
      currentAlignment = 'right';
    }
    
    // Apply to both elements
    if (textPreview) textPreview.style.textAlign = currentAlignment;
    if (richTextEditor) richTextEditor.style.textAlign = currentAlignment;
  }

  // Function to fix text decoration colors
  function fixTextDecorationColors() {
    if (!textPreview) return;
    
    // Find all text elements in the preview
    const elements = textPreview.querySelectorAll('span, font');
    
    elements.forEach(element => {
      try {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        
        // If this element has an underline or strikethrough
        if (computedStyle.textDecoration.includes('underline') || 
            computedStyle.textDecoration.includes('line-through')) {
          
          // Set the text-decoration-color to match the text color
          element.style.textDecorationColor = color;
        }
      } catch (e) {
        console.error("Error fixing decoration color:", e);
      }
    });
  }

  // Add event listeners to update preview
  if (richTextEditor) {
    // Modified input handler with dark mode cursor fix
    richTextEditor.addEventListener('input', function() {
      // If in dark mode, ensure proper text coloring without cursor issues
      if (document.body.classList.contains('dark-mode')) {
        ensureProperColoringInDarkMode();
      }
      updatePreview();
    });
    
    richTextEditor.addEventListener('blur', updatePreview);
  }
  
  if (fontSelect) {
    fontSelect.addEventListener('change', updatePreview);
  }
  
  if (fontSize) {
    fontSize.addEventListener('change', updatePreview);
  }
  
  if (letterSpacing) {
    letterSpacing.addEventListener('input', function() {
      if (letterSpacingValue) {
        letterSpacingValue.textContent = this.value + 'px';
      }
      updatePreview();
    });
  }

  // COLOR HANDLING - IMPROVED for dark mode
  if (textColor) {
    // Add an input event listener to update color as it's being selected
    textColor.addEventListener('input', function() {
      applyTextColor(this.value);
    });
    
    // Add the same handling to change event for consistency
    textColor.addEventListener('change', function() {
      applyTextColor(this.value);
    });
  }

  // COLOR SWATCHES - IMPROVED for dark mode
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', function() {
      const color = this.getAttribute('data-color');
      if (textColor) textColor.value = color;
      
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
      });
      this.classList.add('active');
      
      applyTextColor(color);
    });
  });

  // FORMATTING BUTTONS - FIXED

  // Bold button - Fixed
  if (boldBtn) {
    boldBtn.addEventListener('click', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('bold', false, null);
        
        // Check current style after applying command
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            let node = range.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode; // Text node
            
            const style = window.getComputedStyle(node);
            const isBold = style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 600;
            
            // Set button state to match current style
            this.classList.toggle('active', isBold);
          } catch (e) {
            // Just toggle if we can't determine
            this.classList.toggle('active');
          }
        }
        
        updatePreview();
      }
    });
  }
  
  // Italic button - Fixed
  if (italicBtn) {
    italicBtn.addEventListener('click', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('italic', false, null);
        
        // Check current style after applying command
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            let node = range.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode; // Text node
            
            const style = window.getComputedStyle(node);
            const isItalic = style.fontStyle === 'italic';
            
            // Set button state to match current style
            this.classList.toggle('active', isItalic);
          } catch (e) {
            // Just toggle if we can't determine
            this.classList.toggle('active');
          }
        }
        
        updatePreview();
      }
    });
  }
  
  // Underline button - Fixed
  if (underlineBtn) {
    underlineBtn.addEventListener('click', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('underline', false, null);
        
        // Check current style after applying command
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            let node = range.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode; // Text node
            
            const style = window.getComputedStyle(node);
            const isUnderlined = style.textDecoration.includes('underline');
            
            // Set button state to match current style
            this.classList.toggle('active', isUnderlined);
          } catch (e) {
            // Just toggle if we can't determine
            this.classList.toggle('active');
          }
        }
        
        updatePreview();
      }
    });
  }
  
  // Strikethrough button - Fixed
  if (strikeBtn) {
    strikeBtn.addEventListener('click', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('strikeThrough', false, null);
        
        // Check current style after applying command
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            let node = range.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode; // Text node
            
            const style = window.getComputedStyle(node);
            const isStrikethrough = style.textDecoration.includes('line-through');
            
            // Set button state to match current style
            this.classList.toggle('active', isStrikethrough);
          } catch (e) {
            // Just toggle if we can't determine
            this.classList.toggle('active');
          }
        }
        
        updatePreview();
      }
    });
  }

  // ALIGNMENT BUTTONS
  if (alignLeftBtn) {
    alignLeftBtn.addEventListener('click', function() {
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.add('active');
      if (alignCenterBtn) alignCenterBtn.classList.remove('active');
      if (alignRightBtn) alignRightBtn.classList.remove('active');
      
      // Call updatePreview which now includes syncTextAlignment
      updatePreview();
    });
  }
  
  if (alignCenterBtn) {
    alignCenterBtn.addEventListener('click', function() {
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.remove('active');
      if (alignCenterBtn) alignCenterBtn.classList.add('active');
      if (alignRightBtn) alignRightBtn.classList.remove('active');
      
      // Call updatePreview which now includes syncTextAlignment
      updatePreview();
    });
  }
  
  if (alignRightBtn) {
    alignRightBtn.addEventListener('click', function() {
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.remove('active');
      if (alignCenterBtn) alignCenterBtn.classList.remove('active');
      if (alignRightBtn) alignRightBtn.classList.add('active');
      
      // Call updatePreview which now includes syncTextAlignment
      updatePreview();
    });
  }

  // RESET BUTTON
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      // Reset controls to defaults
      if (fontSelect) fontSelect.value = defaultSettings.fontFamily;
      if (fontSize) fontSize.value = defaultSettings.fontSize;
      if (textColor) textColor.value = defaultSettings.textColor;
      if (letterSpacing) {
        letterSpacing.value = defaultSettings.letterSpacing;
        if (letterSpacingValue) {
          letterSpacingValue.textContent = defaultSettings.letterSpacing + 'px';
        }
      }
      
      // Reset text content but preserve the text itself
      if (richTextEditor) {
        const currentText = richTextEditor.textContent || 'Sample Text';
        // In dark mode, wrap with a black color span
        if (document.body.classList.contains('dark-mode')) {
          richTextEditor.innerHTML = `<span style="color: #000000;">${currentText}</span>`;
        } else {
          richTextEditor.innerHTML = currentText;
        }
      }
      
      // Reset color swatches
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
      });
      // Set black swatch as active
      const blackSwatch = document.querySelector('.color-swatch[data-color="#000000"]');
      if (blackSwatch) blackSwatch.classList.add('active');
      
      // Reset formatting buttons
      if (boldBtn) boldBtn.classList.remove('active');
      if (italicBtn) italicBtn.classList.remove('active');
      if (underlineBtn) underlineBtn.classList.remove('active');
      if (strikeBtn) strikeBtn.classList.remove('active');
      
      // Reset alignment to center
      if (alignLeftBtn) alignLeftBtn.classList.remove('active');
      if (alignCenterBtn) alignCenterBtn.classList.add('active');
      if (alignRightBtn) alignRightBtn.classList.remove('active');
      
      // Update preview
      updatePreview();
      
      // Show toast notification
      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }
    });
  }

  // CUSTOM FONT UPLOAD
  if (customFontBtn && fontUploader) {
    customFontBtn.addEventListener('click', function() {
      fontUploader.click();
    });
    
    fontUploader.addEventListener('change', function(e) {
      if (e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // Check file type
      if (!['ttf', 'otf', 'woff', 'woff2'].includes(fileExtension)) {
        alert('Please upload a valid font file (.ttf, .otf, .woff, or .woff2)');
        return;
      }
      
      // Show loading state
      customFontBtn.textContent = "Loading font...";
      customFontBtn.disabled = true;
      
      // Read font file
      const reader = new FileReader();
      reader.onload = function(fileEvent) {
        try {
          const fontFamilyName = `CustomFont${customFontCounter}`;
          const fontName = fileName.replace(/\.[^/.]+$/, "");
          
          // Create font face
          const styleEl = document.createElement('style');
          styleEl.textContent = `
            @font-face {
              font-family: '${fontFamilyName}';
              src: url(${fileEvent.target.result}) format('${getFormatString(fileExtension)}');
              font-weight: normal;
              font-style: normal;
            }
          `;
          document.head.appendChild(styleEl);
          
          // Create a test element to ensure font is loaded
          const testEl = document.createElement('span');
          testEl.style.fontFamily = fontFamilyName;
          testEl.style.visibility = 'hidden';
          testEl.textContent = 'Font Test';
          document.body.appendChild(testEl);
          
          // Wait for font to load or timeout
          setTimeout(() => {
            // Add to font map
            const fontKey = `custom${customFontCounter}`;
            fontMap[fontKey] = fontFamilyName;
            
            // Add to custom fonts array
            customFonts.push({
              id: fontKey,
              name: fontName,
              fontFamily: fontFamilyName
            });
            
            // Add to dropdown
            if (fontSelect) {
              const option = document.createElement('option');
              option.value = fontKey;
              option.textContent = fontName + ' (Custom)';
              option.style.fontFamily = fontFamilyName;
              fontSelect.appendChild(option);
              fontSelect.value = fontKey;
            }
            
            // Add to custom fonts list
            addCustomFontToList(fontKey, fontName, fontFamilyName);
            
            // Update preview
            updatePreview();
            
            // Increment counter
            customFontCounter++;
            
            // Reset file input
            fontUploader.value = '';
            
            // Show notification
            const toast = document.getElementById('toast-notification');
            if (toast) {
              toast.textContent = `Font "${fontName}" was added`;
              toast.classList.add('show');
              setTimeout(() => {
                toast.classList.remove('show');
                toast.textContent = 'Formatting has been reset'; // Reset for next usage
              }, 3000);
            }
            
            // Reset button state
            customFontBtn.textContent = "Upload Custom Font";
            customFontBtn.disabled = false;
            
            // Clean up test element
            document.body.removeChild(testEl);
            
          }, 500); // Give the font 500ms to load
          
        } catch (error) {
          console.error('Error loading font:', error);
          alert('Error loading font. Please try another file.');
          customFontBtn.textContent = "Upload Custom Font";
          customFontBtn.disabled = false;
        }
      };
      
      reader.onerror = function() {
        alert('Error reading font file. Please try again.');
        customFontBtn.textContent = "Upload Custom Font";
        customFontBtn.disabled = false;
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Helper for font format
  function getFormatString(extension) {
    switch(extension.toLowerCase()) {
      case 'ttf': return 'truetype';
      case 'otf': return 'opentype';
      case 'woff': return 'woff';
      case 'woff2': return 'woff2';
      default: return 'truetype';
    }
  }
  
  // Helper to add custom font to list
  function addCustomFontToList(id, name, fontFamily) {
    if (!customFontsList) return;
    
    const fontItem = document.createElement('div');
    fontItem.className = 'custom-font-item';
    fontItem.innerHTML = `
      <span class="custom-font-name" style="font-family: '${fontFamily}';">${name}</span>
      <button class="use-font-btn" data-font-id="${id}">Use</button>
    `;
    
    // Add event listener to the "Use" button
    fontItem.querySelector('.use-font-btn').addEventListener('click', function() {
      const fontId = this.getAttribute('data-font-id');
      if (fontSelect) {
        fontSelect.value = fontId;
        updatePreview();
      }
    });
    
    customFontsList.appendChild(fontItem);
  }

  // DOWNLOAD FUNCTIONALITY
  if (downloadBtn && textPreview) {
    downloadBtn.addEventListener('click', function() {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.padding = '50px';
      container.style.background = 'transparent';
      container.style.left = '-9999px';
      
      const previewClone = textPreview.cloneNode(true);
      container.appendChild(previewClone);
      document.body.appendChild(container);
      
      // Show download in progress
      downloadBtn.textContent = "Generating...";
      downloadBtn.disabled = true;
      
      html2canvas(container, {
        backgroundColor: null,
        scale: 2
      }).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'typegen tool.png';
        downloadLink.click();
        
        document.body.removeChild(container);
        downloadBtn.textContent = "Download as PNG";
        downloadBtn.disabled = false;
      }).catch(error => {
        console.error("Error generating PNG:", error);
        alert("There was an error generating your PNG. Please try again.");
        downloadBtn.textContent = "Download as PNG";
        downloadBtn.disabled = false;
      });
    });
  }

  // Set up improved dark mode toggle with more aggressive color handling
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      // Store all colored spans to preserve their colors
      const coloredElements = [];
      if (richTextEditor) {
        richTextEditor.querySelectorAll('[style*="color"]').forEach(el => {
          const match = el.getAttribute('style').match(/color:\s*(.*?)(;|$)/);
          if (match && match[1]) {
            coloredElements.push({
              element: el,
              color: match[1].trim()
            });
          }
        });
      }
      
      // Add transitioning class for visual feedback
      document.body.classList.add('bg-transitioning');
      
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        console.log("Dark mode enabled");
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        console.log("Light mode enabled");
      }
      
      // Remove transitioning class after animation completes
      setTimeout(function() {
        // Restore all original colors with !important
        coloredElements.forEach(item => {
          item.element.style.setProperty('color', item.color, 'important');
        });
        
        // Handle plain text in dark mode
        if (document.body.classList.contains('dark-mode')) {
          if (richTextEditor) {
            // Check if there's any styled content
            const hasStyledContent = richTextEditor.querySelector('[style*="color"]');
            if (!hasStyledContent) {
              // Save selection before modifying
              let savedSelection = null;
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (richTextEditor.contains(range.commonAncestorContainer)) {
                  savedSelection = saveSelection(richTextEditor);
                }
              }
              
              // No styled content, wrap everything in black
              const content = richTextEditor.textContent;
              richTextEditor.innerHTML = `<span style="color: #000000 !important;">${content}</span>`;
              
              // Restore selection if we had one
              if (savedSelection) {
                restoreSelection(richTextEditor, savedSelection);
              }
            }
          }
        }
        
        document.body.classList.remove('bg-transitioning');
        updatePreview();
        
        // Log current colors for debugging
        console.log("Current text color in color picker:", textColor ? textColor.value : 'N/A');
        if (richTextEditor) {
          richTextEditor.querySelectorAll('[style*="color"]').forEach(el => {
            console.log("Element color:", el.style.color, "Element:", el);
          });
        }
      }, 500);
    });
    
    // Initialize dark mode if needed
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
      
      // On initial load in dark mode, ensure text is properly colored
      setTimeout(function() {
        // Ensure all content has color styling in dark mode
        if (richTextEditor) {
          // Check if there's any styled content
          const hasStyledContent = richTextEditor.querySelector('[style*="color"]');
          if (!hasStyledContent) {
            // No styled content, wrap everything in black
            const content = richTextEditor.textContent;
            richTextEditor.innerHTML = `<span style="color: #000000 !important;">${content}</span>`;
          }
        }
        
        updatePreview();
      }, 100);
    }
  }

  // Set default alignment
  if (textPreview) textPreview.style.textAlign = 'center';
  if (alignCenterBtn) alignCenterBtn.classList.add('active');
  
  // Set initial preview
  updatePreview();
  
  // Log initial state
  console.log("Text editor initialized");
});

// Add CSS for background transition effect
const styleElement = document.createElement('style');
styleElement.textContent = `
.bg-transitioning::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: -1;
  animation: fadeInOut 0.5s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
`;
document.head.appendChild(styleElement);