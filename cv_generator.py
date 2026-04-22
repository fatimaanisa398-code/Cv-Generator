#!/usr/bin/env python3
"""
CV Generator - Create professional PDF CVs from JSON data
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


class CVGenerator:
    """Generate professional PDF CVs from JSON data"""
    
    def __init__(self, cv_data, output_filename="cv.pdf", template="modern"):
        self.cv_data = cv_data
        self.output_filename = output_filename
        self.template = template
        self.pagesize = letter
        self.left_margin = 0.5 * inch
        self.right_margin = 0.5 * inch
        self.top_margin = 0.5 * inch
        self.bottom_margin = 0.5 * inch
        
    def load_json(self, json_path):
        """Load CV data from JSON file"""
        with open(json_path, 'r') as f:
            self.cv_data = json.load(f)
    
    def create_styles(self):
        """Create custom paragraph styles based on template"""
        styles = getSampleStyleSheet()
        
        if self.template == 'minimal':
            # Minimal, clean design
            styles.add(ParagraphStyle(
                name='CustomTitle',
                parent=styles['Heading1'],
                fontSize=20,
                textColor=black,
                spaceAfter=4,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ))
            
            styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=styles['Heading2'],
                fontSize=11,
                textColor=black,
                spaceAfter=6,
                spaceBefore=10,
                fontName='Helvetica-Bold'
            ))
        elif self.template == 'creative':
            # Creative, colorful design
            styles.add(ParagraphStyle(
                name='CustomTitle',
                parent=styles['Heading1'],
                fontSize=28,
                textColor=HexColor('#FF6B6B'),
                spaceAfter=8,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ))
            
            styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=styles['Heading2'],
                fontSize=13,
                textColor=HexColor('#FF6B6B'),
                spaceAfter=8,
                spaceBefore=12,
                fontName='Helvetica-Bold'
            ))
        else:  # modern (default)
            styles.add(ParagraphStyle(
                name='CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=HexColor('#1f4788'),
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ))
            
            styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=styles['Heading2'],
                fontSize=12,
                textColor=HexColor('#1f4788'),
                spaceAfter=8,
                spaceBefore=12,
                fontName='Helvetica-Bold',
                borderPadding=5
            ))
        
        # Common styles for all templates
        styles.add(ParagraphStyle(
            name='ContactInfo',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor('#555555'),
            alignment=TA_CENTER,
            spaceAfter=12
        ))
        
        styles.add(ParagraphStyle(
            name='JobTitle',
            parent=styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold',
            textColor=black,
            spaceAfter=2
        ))
        
        styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=styles['Normal'],
            fontSize=10,
            textColor=HexColor('#666666'),
            spaceAfter=4,
            fontName='Helvetica-Oblique'
        ))
        
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=12
        ))
        
        return styles
    
    def generate(self):
        """Generate the PDF"""
        doc = SimpleDocTemplate(
            self.output_filename,
            pagesize=self.pagesize,
            leftMargin=self.left_margin,
            rightMargin=self.right_margin,
            topMargin=self.top_margin,
            bottomMargin=self.bottom_margin
        )
        
        styles = self.create_styles()
        story = []
        
        # Header with name
        personal = self.cv_data.get('personal', {})
        name = personal.get('full_name', 'Your Name')
        story.append(Paragraph(name, styles['CustomTitle']))
        
        # Contact info
        contact_parts = []
        if personal.get('email'):
            contact_parts.append(personal['email'])
        if personal.get('phone'):
            contact_parts.append(personal['phone'])
        if personal.get('location'):
            contact_parts.append(personal['location'])
        
        contact_text = " | ".join(contact_parts)
        story.append(Paragraph(contact_text, styles['ContactInfo']))
        
        # Professional summary
        if personal.get('professional_summary'):
            story.append(Spacer(1, 0.1*inch))
            summary_style = ParagraphStyle(
                'Summary',
                parent=styles['CustomBody'],
                fontSize=10,
                textColor=HexColor('#333333')
            )
            story.append(Paragraph(
                personal['professional_summary'],
                summary_style
            ))
        
        story.append(Spacer(1, 0.15*inch))
        
        # Experience section
        if self.cv_data.get('experience'):
            story.append(Paragraph("PROFESSIONAL EXPERIENCE", styles['SectionHeader']))
            
            for job in self.cv_data['experience']:
                # Job title and company
                job_title = job.get('position', '')
                company = job.get('company', '')
                story.append(Paragraph(f"{job_title}", styles['JobTitle']))
                
                # Company and dates
                start_date = job.get('start_date', '')
                end_date = job.get('end_date', '')
                date_range = f"{start_date} – {end_date}" if start_date and end_date else start_date
                company_info = f"{company} | {date_range}"
                story.append(Paragraph(company_info, styles['CompanyInfo']))
                
                # Description
                if job.get('description'):
                    story.append(Paragraph(
                        f"• {job['description']}",
                        styles['CustomBody']
                    ))
                
                story.append(Spacer(1, 0.1*inch))
        
        # Education section
        if self.cv_data.get('education'):
            story.append(Paragraph("EDUCATION", styles['SectionHeader']))
            
            for edu in self.cv_data['education']:
                degree = edu.get('degree', '')
                field = edu.get('field', '')
                institution = edu.get('institution', '')
                year = edu.get('graduation_year', '')
                
                story.append(Paragraph(
                    f"{degree} in {field}",
                    styles['JobTitle']
                ))
                story.append(Paragraph(
                    f"{institution} | {year}",
                    styles['CompanyInfo']
                ))
                story.append(Spacer(1, 0.1*inch))
        
        # Skills section
        if self.cv_data.get('skills'):
            story.append(Paragraph("SKILLS", styles['SectionHeader']))
            
            skills_text = ", ".join(self.cv_data['skills'])
            story.append(Paragraph(skills_text, styles['CustomBody']))
            story.append(Spacer(1, 0.1*inch))
        
        # Certifications section
        if self.cv_data.get('certifications'):
            story.append(Paragraph("CERTIFICATIONS", styles['SectionHeader']))
            
            for cert in self.cv_data['certifications']:
                story.append(Paragraph(f"• {cert}", styles['CustomBody']))
            
            story.append(Spacer(1, 0.1*inch))
        
        # Build PDF
        doc.build(story)
        print(f"✓ CV generated successfully: {self.output_filename}")


def main():
    """Main entry point"""
    # Default input and output files
    input_file = "sample_cv.json"
    output_file = "cv.pdf"
    template = "modern"
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    if len(sys.argv) > 3:
        template = sys.argv[3]
    
    # Check if input file exists
    if not Path(input_file).exists():
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    # Load CV data
    with open(input_file, 'r') as f:
        cv_data = json.load(f)
    
    # Generate PDF
    generator = CVGenerator(cv_data, output_file, template)
    generator.generate()


if __name__ == "__main__":
    main()
