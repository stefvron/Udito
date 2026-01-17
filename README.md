# Introduction
Udito is just a small hobby project. The name means Untitled Dithering Tool and that's mostly what it is. This tool is meant to convert images to pixel art using various methods of colour matching and colour accuracy throughout a given colour palette.

# Features
## Colour palettes
- Pico-8 (both with and without secret colours)
- Wplace (both free and free+premium)
## Colour Models
- CIEDE2000
- CIE76
- Euclidian sRGB
## Colour accuracy algorithms
### Non-dithering
- Nearest colour
### Dithering
- Floyd-Steinberg (Synchronous JavaScript)
- Atkinson (Synchronous JavaScript)
- Bayer-Matrix 4x4 and 8x8 (GLSL)
## Basic image operations
- Box blur
- Contrast
- Brightness
- Saturation
- Alpha threshhold
- Image scaling
## Preview
- Original image
- Preprocessed and scaled image
- Live result preview with download (1:1 and 20:1 grid)