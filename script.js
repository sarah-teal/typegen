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
  if (richTextEditor) richTextEditor.innerHTML = 'Sample Text';

  // CORE PREVIEW FUNCTIONALITY
  function updatePreview() {
    if (!richTextEditor || !textPreview) {
      console.error("Missing critical elements for preview");
      return;
    }

    // Copy HTML content
    textPreview.innerHTML = richTextEditor.innerHTML;
    
    // Apply font family
    if (fontSelect && fontMap[fontSelect.value]) {
      textPreview.style.fontFamily = fontMap[fontSelect.value];
    }
    
    // Apply font size
    if (fontSize) {
      textPreview.style.fontSize = fontSize.value + 'px';
    }
    
    // Apply letter spacing
    if (letterSpacing) {
      textPreview.style.letterSpacing = letterSpacing.value + 'px';
      if (letterSpacingValue) {
        letterSpacingValue.textContent = letterSpacing.value + 'px';
      }
    }
    
    // Fix text decoration colors
    fixTextDecorationColors();
    
    console.log("Preview updated");
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
    richTextEditor.addEventListener('input', updatePreview);
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

  // COLOR HANDLING
if (textColor) {
    // Add an input event listener to update color as it's being selected
    textColor.addEventListener('input', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('foreColor', false, this.value);
        updatePreview();
      }
    });
    
    // Keep the change event listener for browser compatibility
    textColor.addEventListener('change', function() {
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('foreColor', false, this.value);
        updatePreview();
      }
    });
}
  
  // COLOR SWATCHES
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', function() {
      const color = this.getAttribute('data-color');
      if (textColor) textColor.value = color;
      
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
      });
      this.classList.add('active');
      
      if (richTextEditor) {
        richTextEditor.focus();
        document.execCommand('foreColor', false, color);
        updatePreview();
      }
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
      if (textPreview) textPreview.style.textAlign = 'left';
      
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.add('active');
      if (alignCenterBtn) alignCenterBtn.classList.remove('active');
      if (alignRightBtn) alignRightBtn.classList.remove('active');
    });
  }
  
  if (alignCenterBtn) {
    alignCenterBtn.addEventListener('click', function() {
      if (textPreview) textPreview.style.textAlign = 'center';
      
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.remove('active');
      if (alignCenterBtn) alignCenterBtn.classList.add('active');
      if (alignRightBtn) alignRightBtn.classList.remove('active');
    });
  }
  
  if (alignRightBtn) {
    alignRightBtn.addEventListener('click', function() {
      if (textPreview) textPreview.style.textAlign = 'right';
      
      // Update button states
      if (alignLeftBtn) alignLeftBtn.classList.remove('active');
      if (alignCenterBtn) alignCenterBtn.classList.remove('active');
      if (alignRightBtn) alignRightBtn.classList.add('active');
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
        richTextEditor.innerHTML = currentText;
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
      if (textPreview) textPreview.style.textAlign = defaultSettings.alignment;
      
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
          
        } catch (error) {
          console.error('Error loading font:', error);
          alert('Error loading font. Please try another file.');
        }
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

  // Set up dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
    });
    
    // Initialize dark mode if needed
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }
  }

  // Set default alignment
  if (textPreview) textPreview.style.textAlign = 'center';
  if (alignCenterBtn) alignCenterBtn.classList.add('active');
  
  // Set initial preview
  updatePreview();
});
