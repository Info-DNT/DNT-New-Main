import os
import re

def update_file(filepath, mappings):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in mappings:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
    else:
        # print(f"No changes: {filepath}")
        pass

def get_mappings(level=0):
    if level == 0:
        # Root files
        p = r'(?:services/|\./services/)'
        target_p = 'services/'
    elif level == 1:
        # services/*.html
        p = r'(?:\./|services/|)'
        target_p = './'
    else:
        # services/subdir/*.html
        # Should match ../filename.html OR just filename.html (if it was in the same subdir)
        p = r'(?:\.\./|\.\./\.\./services/|)'
        target_p = '../'
    
    m = [
        # Business Growth Legacy
        (fr'href="{p}digital-marketing\.html#web"', f'href="{target_p}Business_Growth/website-development.html"'),
        (fr'href="{p}digital-marketing\.html#seo"', f'href="{target_p}Business_Growth/seo-services.html"'),
        (fr'href="{p}digital-marketing\.html#ads"', f'href="{target_p}Business_Growth/google-ads.html"'),
        (fr'href="{p}digital-marketing\.html#smm"', f'href="{target_p}Business_Growth/social-media-marketing.html"'),
        
        # AI Solutions Legacy
        (fr'href="{p}technology\.html#automation"', f'href="{target_p}AI_Solutions/ai-automation-services.html"'),
        (fr'href="{p}technology\.html#erp"', f'href="{target_p}AI_Solutions/process-automation-digital-workflow.html"'),
        (fr'href="{p}technology\.html#crm"', f'href="{target_p}AI_Solutions/process-automation-digital-workflow.html"'),
        (fr'href="{p}technology\.html"', f'href="{target_p}AI_Solutions/ai-automation-services.html"'),

        # Compliance Legacy -> NEW
        (fr'href="{p}compliance\.html#formation"', f'href="{target_p}company-registration/pvt-ltd.html"'),
        (fr'href="{p}compliance\.html#gst"', f'href="{target_p}compliances/gst-registration.html"'),
        (fr'href="{p}compliance\.html#itr"', f'href="{target_p}itr-filing.html"'),
        (fr'href="{p}compliance\.html#roc"', f'href="{target_p}compliances/company-annual-filing.html"'),
        (fr'href="{p}compliance\.html"', f'href="{target_p}compliances/index.html"'),
        
        # ITR & Advance Tax Consolidation
        # We need to be very specific for advance-tax-filing.html because it might be local or in compliances/
        (fr'href="{p}compliances/advance-tax-filing\.html"', f'href="{target_p}itr-filing.html"'),
        (fr'href="{p}advance-tax-filing\.html"', f'href="{target_p}itr-filing.html"'),
        (fr'href="{p}Income Tax Return filing\.html"', f'href="{target_p}itr-filing.html"'),
        (fr'href="{p}itr-filing\.html"', f'href="{target_p}itr-filing.html"'),

        # WhatsApp
        (fr'href="{p}whatsappMarketing\.html"', f'href="{target_p}whatsappMarketing.html"'),
    ]
    return m

# Root Level
root_files = ['index.html', 'about.html', 'contact.html', 'blog.html', 'privacy.html', 'terms.html', 'packages.html', 'dashboard.html', 'blog-post.html', '404.html']
root_mappings = get_mappings(0)
for filename in root_files:
    if os.path.exists(filename):
        update_file(filename, root_mappings)

# Services Root (itr-filing.html, whatsappMarketing.html)
services_root = ['services/itr-filing.html', 'services/whatsappMarketing.html']
services_root_mappings = get_mappings(1)
for filename in services_root:
    if os.path.exists(filename):
        update_file(filename, services_root_mappings)

# Sub-directories
sub_dirs = [
    'services/company-registration', 
    'services/compliances', 
    'services/ipr', 
    'services/iso',
    'services/Business_Growth',
    'services/AI_Solutions'
]
sub_mappings = get_mappings(2)
for sub_dir in sub_dirs:
    if os.path.exists(sub_dir):
        for filename in os.listdir(sub_dir):
            if filename.endswith('.html'):
                update_file(os.path.join(sub_dir, filename), sub_mappings)
