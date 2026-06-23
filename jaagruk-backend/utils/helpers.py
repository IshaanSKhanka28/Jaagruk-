import os
import io
import logging
import asyncio
import requests
import cloudinary
import cloudinary.uploader
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def upload_to_cloudinary(file_content: bytes) -> dict:
    """Uploads file bytes to Cloudinary in an async threadpool."""
    try:
        # Run synchronous Cloudinary upload in a separate thread
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            file_content,
            folder="jaagruk_issues"
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }
    except Exception as e:
        logging.error(f"Cloudinary upload error: {e}")
        raise e

async def get_image_bytes(url: str) -> bytes:
    """Downloads image bytes from a public URL in an async threadpool."""
    try:
        response = await asyncio.to_thread(requests.get, url, timeout=15)
        response.raise_for_status()
        return response.content
    except Exception as e:
        logging.error(f"Error fetching image bytes: {e}")
        raise e

def generate_pdf_report(issue_data: dict) -> bytes:
    """Generates a structured PDF grievance report using ReportLab."""
    buffer = io.BytesIO()
    
    # Establish document layout
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    story = []
    styles = getSampleStyleSheet()

    # Define custom typographic parameters
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1D4ED8'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#F97316'),
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=8
    )

    label_style = ParagraphStyle(
        'DocLabel',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1D4ED8')
    )

    # Document Title / Branding
    story.append(Paragraph("JAAGRUK AI CIVIC ACTION REPORT", title_style))
    story.append(Paragraph(f"Official Grievance Record • Issue ID: {issue_data.get('id', 'N/A')}", subtitle_style))
    story.append(Spacer(1, 10))

    # Basic Metadata Table
    metadata = [
        [Paragraph("Reported By:", label_style), Paragraph(issue_data.get("citizen_id", "Anonymous"), body_style)],
        [Paragraph("Category:", label_style), Paragraph(issue_data.get("category", "OTHER"), body_style)],
        [Paragraph("Severity Index:", label_style), Paragraph(f"{issue_data.get('severity', 1)} / 5", body_style)],
        [Paragraph("Assigned Priority:", label_style), Paragraph(issue_data.get("priority", "LOW"), body_style)],
        [Paragraph("Target Department:", label_style), Paragraph(issue_data.get("department", "Unassigned"), body_style)],
        [Paragraph("Location Address:", label_style), Paragraph(issue_data.get("address", "Not specified"), body_style)],
        [Paragraph("Coordinates:", label_style), Paragraph(f"Lat: {issue_data.get('lat', 'N/A')}, Lng: {issue_data.get('lng', 'N/A')}", body_style)],
        [Paragraph("Timestamp:", label_style), Paragraph(str(issue_data.get("created_at", "N/A")), body_style)],
    ]

    t = Table(metadata, colWidths=[130, 400])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Citizen Raw Description
    story.append(Paragraph("Citizen Submission Notes:", label_style))
    story.append(Paragraph(issue_data.get("description") or "No description provided by the citizen.", body_style))
    story.append(Spacer(1, 15))

    # Image Insertion
    image_url = issue_data.get("image_url")
    if image_url:
        try:
            resp = requests.get(image_url, timeout=10)
            if resp.status_code == 200:
                img_data = io.BytesIO(resp.content)
                img = PILImage.open(img_data)
                w, h = img.size
                aspect = h / w
                target_w = 280
                target_h = int(target_w * aspect)
                
                rl_img = RLImage(img_data, width=target_w, height=target_h)
                rl_img.hAlign = 'CENTER'
                story.append(Paragraph("Attached Photographic Evidence:", label_style))
                story.append(Spacer(1, 6))
                story.append(rl_img)
                story.append(Spacer(1, 15))
        except Exception as e:
            logging.error(f"ReportLab failed to draw image: {e}")
            story.append(Paragraph(f"Attached Photographic Evidence: [Could not embed image: {e}]", label_style))

    # Footer Disclaimer
    story.append(Spacer(1, 10))
    story.append(Paragraph("Verification Statement:", label_style))
    story.append(Paragraph(
        "This civic grievance record has been digitally authenticated by the Jaagruk AI multi-agent verification pipeline. "
        "The coordinates and visual data have been cross-checked, and routing has been dispatch-processed to ensure administrative accountability.", 
        body_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
