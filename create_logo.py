from PIL import Image, ImageDraw, ImageFont
import os

# Create a professional company logo
width, height = 300, 120
logo = Image.new('RGB', (width, height), color='white')
draw = ImageDraw.Draw(logo)

# Draw gradient-like background using rectangles
for i in range(height):
    # Gradient from indigo-600 to indigo-700
    r = int(79 + (67-79) * (i/height))
    g = int(70 + (56-70) * (i/height))
    b = int(229 + (202-229) * (i/height))
    draw.line([(0, i), (width, i)], fill=(r, g, b))

# Draw text
try:
    # Try to use Arial font
    font = ImageFont.truetype("arial.ttf", 36)
except:
    # Fallback to default font
    font = ImageFont.load_default()

draw.text((20, 30), "MD GROUP", font=font, fill='white')

# Save the logo
output_path = 'c:/Users/welcome/Desktop/md-construction-app/public/company-logo.png'
os.makedirs(os.path.dirname(output_path), exist_ok=True)
logo.save(output_path)
print(f"Logo created successfully at {output_path}")
