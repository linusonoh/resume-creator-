import { PersonalInfo, ResumeSection, ResumeItem } from './resumeStore';

/**
 * Serializes the resume state (PersonalInfo and Sections) into a single Markdown document.
 */
export function serializeResumeToMarkdown(personalInfo: PersonalInfo, sections: ResumeSection[]): string {
  let md = '';

  // 1. Title / Name
  if (personalInfo.name) {
    md += `# ${personalInfo.name}\n`;
  } else {
    md += `# \n`;
  }

  // 2. Contact details
  if (personalInfo.email) md += `Email: ${personalInfo.email}\n`;
  if (personalInfo.phone) md += `Phone: ${personalInfo.phone}\n`;
  if (personalInfo.website) md += `Website: ${personalInfo.website}\n`;
  if (personalInfo.github) md += `GitHub: ${personalInfo.github}\n`;
  if (personalInfo.linkedin) md += `LinkedIn: ${personalInfo.linkedin}\n`;

  // 3. Sections
  sections.forEach((section) => {
    md += `\n## ${section.title}\n`;
    
    const isTextSection = section.type === 'summary' || section.type === 'skills' || section.type === 'custom-text';
    
    if (isTextSection) {
      md += `${section.content || ''}\n`;
    } else {
      section.items.forEach((item) => {
        md += `### ${item.title || ''}`;
        if (item.subtitle || item.dates) {
          md += ` | ${item.subtitle || ''}`;
        }
        if (item.dates) {
          md += ` | ${item.dates || ''}`;
        }
        md += `\n`;
        
        if (item.description) {
          md += `${item.description}\n`;
        }
        md += `\n`;
      });
      // Remove trailing double newlines for lists
      md = md.trimEnd() + '\n';
    }
  });

  return md.trim();
}

/**
 * Deserializes a Markdown string back into PersonalInfo and Sections list.
 * Preserves section IDs and types from existing sections if they match by title.
 */
export function deserializeMarkdownToResume(
  markdownStr: string,
  existingSections: ResumeSection[]
): { personalInfo: PersonalInfo; sections: ResumeSection[] } {
  const lines = markdownStr.split('\n');
  const personalInfo: PersonalInfo = {
    name: '',
    email: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
  };

  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  let currentItem: ResumeItem | null = null;
  let customSectionCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines at the very beginning of the document or between contact details
    if (trimmed === '' && !currentSection) {
      continue;
    }

    // 1. Name Heading (# )
    if (trimmed.startsWith('# ')) {
      personalInfo.name = trimmed.substring(2).trim();
      continue;
    }

    // 2. Contact details (case insensitive prefix match)
    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed.startsWith('email:')) {
      personalInfo.email = trimmed.substring(6).trim();
      continue;
    }
    if (lowerTrimmed.startsWith('phone:')) {
      personalInfo.phone = trimmed.substring(6).trim();
      continue;
    }
    if (lowerTrimmed.startsWith('website:')) {
      personalInfo.website = trimmed.substring(8).trim();
      continue;
    }
    if (lowerTrimmed.startsWith('github:')) {
      personalInfo.github = trimmed.substring(7).trim();
      continue;
    }
    if (lowerTrimmed.startsWith('linkedin:')) {
      personalInfo.linkedin = trimmed.substring(9).trim();
      continue;
    }

    // 3. Section Heading (## )
    if (trimmed.startsWith('## ')) {
      const title = trimmed.substring(3).trim();
      const lowerTitle = title.toLowerCase();

      let type: ResumeSection['type'] = 'custom-text';
      let id = '';

      // Match standard section IDs and types
      if (lowerTitle.includes('summary') || lowerTitle.includes('about')) {
        type = 'summary';
        id = 'summary';
      } else if (
        lowerTitle.includes('experience') ||
        lowerTitle.includes('work') ||
        lowerTitle.includes('employment') ||
        lowerTitle.includes('history')
      ) {
        type = 'experience';
        id = 'experience';
      } else if (lowerTitle.includes('project')) {
        type = 'projects';
        id = 'projects';
      } else if (lowerTitle.includes('education') || lowerTitle.includes('academic')) {
        type = 'education';
        id = 'education';
      } else if (
        lowerTitle.includes('skills') ||
        lowerTitle.includes('expertise') ||
        lowerTitle.includes('technologies')
      ) {
        type = 'skills';
        id = 'skills';
      } else {
        // Find if this custom section existed previously to preserve its ID and type
        const existing = existingSections.find(s => s.title.toLowerCase() === lowerTitle);
        if (existing) {
          type = existing.type;
          id = existing.id;
        } else {
          customSectionCount++;
          type = 'custom-text'; // default to text, can upgrade to list if we see '###'
          id = `custom-${customSectionCount}`;
        }
      }

      currentSection = {
        id,
        type,
        title,
        content: '',
        items: [],
      };
      sections.push(currentSection);
      currentItem = null;
      continue;
    }

    // 4. Item Heading (### )
    if (trimmed.startsWith('### ') && currentSection) {
      // If we see ### in a text section, convert it to a list section
      if (currentSection.type === 'custom-text') {
        currentSection.type = 'custom-list';
      }

      const itemContent = trimmed.substring(4).trim();
      const parts = itemContent.split('|').map(p => p.trim());
      
      const title = parts[0] || '';
      const subtitle = parts[1] || '';
      const dates = parts[2] || '';

      const itemId = `${currentSection.id}-item-${currentSection.items.length + 1}-${Math.random()
        .toString(36)
        .substring(2, 7)}`;

      currentItem = {
        id: itemId,
        title,
        subtitle,
        dates,
        description: '',
      };
      currentSection.items.push(currentItem);
      continue;
    }

    // 5. Normal lines: Append to section content or current item description
    if (currentSection) {
      const isTextSection =
        currentSection.type === 'summary' ||
        currentSection.type === 'skills' ||
        currentSection.type === 'custom-text';

      if (isTextSection) {
        if (currentSection.content) {
          currentSection.content += '\n' + line;
        } else {
          currentSection.content = line;
        }
      } else if (currentItem) {
        if (currentItem.description) {
          currentItem.description += '\n' + line;
        } else {
          currentItem.description = line;
        }
      }
    }
  }

  // Post-process to trim all values
  sections.forEach((s) => {
    s.content = s.content.trim();
    s.items.forEach((item) => {
      item.description = item.description.trim();
    });
  });

  return { personalInfo, sections };
}
