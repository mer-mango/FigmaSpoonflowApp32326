# Logo Setup Guide for PDF Documents

## Step 1: Create a PNG Version of Your Logo

Your logo is currently an SVG file, but PDFs need a PNG format. Here's how to convert it:

### Option A: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload your SVG logo file
3. Set the **width to 600px** (this gives good quality for PDFs)
4. Download the PNG file
5. Save it as `empower-logo.png`

### Option B: Using Figma (if you have your logo in Figma)
1. Select your logo in Figma
2. Right-click → Export
3. Choose PNG format
4. Set scale to 2x or 3x for crisp quality
5. Export and save as `empower-logo.png`

### Option C: Using an Image Editor
1. Open your SVG in Photoshop, GIMP, or similar
2. Set canvas width to 600px (height will adjust automatically)
3. Export as PNG with transparent background
4. Save as `empower-logo.png`

---

## Step 2: Convert PNG to Base64

Once you have your PNG file:

1. Go to https://www.base64-image.de/
2. Upload your `empower-logo.png` file
3. Click "Copy image" or "Copy to clipboard"
4. The result will look like: `data:image/png;base64,iVBORw0KGgoAAAANS...` (very long string)
5. Copy this entire string

---

## Step 3: Provide the Base64 String

Once you have the base64 string copied, paste it here in the chat. It will look something like this:

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAASwCAYAAADkJI...
```

(The string will be very long - that's normal!)

I'll then update the Invoice PDF file with your logo, and all your client-facing documents will have the professional Empower Health Strategies branding!

---

## Why Base64?

Base64 encoding converts your image into text that can be embedded directly in the PDF code. This means:
- ✅ No external file dependencies
- ✅ PDFs work anywhere without broken images
- ✅ Cleaner, more portable PDF documents

---

**Ready?** Follow Step 1, then Step 2, then paste the result here!
