'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import type { PersonalInfo, ResumeItem, ResumeSection } from '@/store/resumeStore';
import { FONT_PAIRINGS } from '@/config/fonts';

interface ColorConfig {
  primaryText: string;
  secondaryText: string;
  borderClass: string;
  bgClass: string;
  linkHover: string;
}

const ACCENT_COLORS: Record<string, ColorConfig> = {
  indigo: {
    primaryText: 'text-indigo-950',
    secondaryText: 'text-indigo-800',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-600',
    linkHover: 'hover:text-indigo-600',
  },
  emerald: {
    primaryText: 'text-emerald-950',
    secondaryText: 'text-emerald-800',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-600',
    linkHover: 'hover:text-emerald-600',
  },
  rose: {
    primaryText: 'text-rose-950',
    secondaryText: 'text-rose-800',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-600',
    linkHover: 'hover:text-rose-600',
  },
  amber: {
    primaryText: 'text-amber-950',
    secondaryText: 'text-amber-800',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-600',
    linkHover: 'hover:text-amber-600',
  },
  slate: {
    primaryText: 'text-slate-900',
    secondaryText: 'text-slate-700',
    borderClass: 'border-slate-400',
    bgClass: 'bg-slate-700',
    linkHover: 'hover:text-slate-700',
  },
};

const samplePersonalInfo: PersonalInfo = {
  name: 'Your Name',
  email: 'your.email@example.com',
  phone: '+1 (555) 123-4567',
  website: 'https://yourportfolio.com',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourprofile',
};

const sampleSections: ResumeSection[] = [
  {
    id: 'sample-summary',
    type: 'summary',
    title: 'Professional Summary',
    content: 'Results-driven professional with experience building reliable products, improving workflows, and collaborating across teams. Replace this preview text by filling in the editor fields.',
    items: [],
  },
  {
    id: 'sample-experience',
    type: 'experience',
    title: 'Work Experience',
    content: '',
    items: [
      {
        id: 'sample-exp-1',
        title: 'Job Title',
        subtitle: 'Company Name',
        dates: '2024 - Present',
        description: '- Describe your strongest achievement here\n- Add measurable impact, tools used, and responsibilities',
      },
    ],
  },
  {
    id: 'sample-projects',
    type: 'projects',
    title: 'Featured Projects',
    content: '',
    items: [
      {
        id: 'sample-proj-1',
        title: 'Project Name',
        subtitle: 'Technologies or Tools',
        dates: '2026',
        description: '- Summarize what you built and why it mattered\n- Mention outcomes, users, performance, or business value',
      },
    ],
  },
  {
    id: 'sample-education',
    type: 'education',
    title: 'Education',
    content: '',
    items: [
      {
        id: 'sample-edu-1',
        title: 'Degree or Certification',
        subtitle: 'School or Institution',
        dates: 'Year',
        description: 'Relevant coursework, honors, or specialization.',
      },
    ],
  },
  {
    id: 'sample-skills',
    type: 'skills',
    title: 'Skills',
    content: 'Languages: JavaScript, TypeScript, Python\nFrameworks: React, Next.js, Node.js\nTools: Git, Tailwind CSS, PostgreSQL',
    items: [],
  },
];

const hasText = (value: string) => value.trim().length > 0;

const hasItemContent = (item: ResumeItem) =>
  hasText(item.title) || hasText(item.subtitle) || hasText(item.dates) || hasText(item.description);

const hasSectionContent = (section: ResumeSection) => {
  const isTextSection = section.type === 'summary' || section.type === 'skills' || section.type === 'custom-text';
  return isTextSection ? hasText(section.content) : section.items.some(hasItemContent);
};

const getPreviewPersonalInfo = (personalInfo: PersonalInfo): PersonalInfo => ({
  name: hasText(personalInfo.name) ? personalInfo.name : samplePersonalInfo.name,
  email: hasText(personalInfo.email) ? personalInfo.email : samplePersonalInfo.email,
  phone: hasText(personalInfo.phone) ? personalInfo.phone : samplePersonalInfo.phone,
  website: hasText(personalInfo.website) ? personalInfo.website : samplePersonalInfo.website,
  github: hasText(personalInfo.github) ? personalInfo.github : samplePersonalInfo.github,
  linkedin: hasText(personalInfo.linkedin) ? personalInfo.linkedin : samplePersonalInfo.linkedin,
});

const getSampleSectionFor = (section: ResumeSection) =>
  sampleSections.find((sample) => sample.type === section.type || sample.title === section.title);

const getPreviewSections = (sections: ResumeSection[]) => {
  const mergedSections = sections.map((section) => {
    if (hasSectionContent(section)) return section;
    return getSampleSectionFor(section) || section;
  });

  const existingTypes = new Set(sections.map((section) => section.type));
  const missingSampleSections = sampleSections.filter((sample) => !existingTypes.has(sample.type));

  return [...mergedSections, ...missingSampleSections];
};

// Lightweight, secure regex-based markdown parser
export function parseMarkdown(text: string, linkHoverClass = 'hover:text-indigo-600'): string {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italics (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links ([text](url))
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g, 
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="underline ${linkHoverClass}">$1</a>`
  );

  // Line-by-line list parser
  const lines = html.split('\n');
  let result = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      if (!inList) {
        result += '<ul class="list-disc pl-5 my-1 space-y-0.5">';
        inList = true;
      }
      result += `<li>${content}</li>`;
    } else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      if (trimmed === '') {
        result += '<div class="h-2"></div>';
      } else {
        result += `<div>${line}</div>`;
      }
    }
  }

  if (inList) {
    result += '</ul>';
  }

  return result;
}

export default function PreviewPanel() {
  const { personalInfo, sections, theme, currentFontId, accentColor, borderStyle, borderColor } = useResumeStore();
  const previewPersonalInfo = getPreviewPersonalInfo(personalInfo);
  const previewSections = getPreviewSections(sections);
  const activeFont = FONT_PAIRINGS.find((f) => f.id === currentFontId) || FONT_PAIRINGS[0];
  const colorConfig = ACCENT_COLORS[accentColor] || ACCENT_COLORS.indigo;

  const BORDER_STYLES: Record<string, string> = {
    none: '',
    single: 'border-[4px] border-solid',
    double: 'border-[8px] border-double',
    thin: 'border border-solid',
    thick: 'border-[10px] border-solid',
    dashed: 'border-[4px] border-dashed',
    dotted: 'border-[4px] border-dotted',
    inset: 'border-[3px] border-solid',
    'top-bottom': 'border-t-[6px] border-b-[6px] border-solid',
    'top-accent': 'border-t-[10px] border-solid',
    'bottom-accent': 'border-b-[10px] border-solid',
    'left-accent': 'border-l-[8px] border-solid',
    'right-accent': 'border-r-[8px] border-solid',
    'side-rails': 'border-l-[6px] border-r-[6px] border-solid',
    bracket: 'border-0',
  };

  const BORDER_COLORS: Record<string, string> = {
    accent: '', // uses colorConfig.borderClass
    slate: 'border-slate-700',
    muted: 'border-slate-300',
    black: 'border-black',
    navy: 'border-blue-950',
    indigo: 'border-indigo-700',
    emerald: 'border-emerald-600',
    teal: 'border-teal-600',
    sky: 'border-sky-500',
    gold: 'border-amber-600',
    bronze: 'border-orange-700',
    rose: 'border-rose-600',
    purple: 'border-purple-700',
  };

  const BRACKET_COLORS: Record<string, string> = {
    accent: colorConfig.borderClass.replace('border-', 'border-'),
    slate: 'border-slate-700',
    muted: 'border-slate-300',
    black: 'border-black',
    navy: 'border-blue-950',
    indigo: 'border-indigo-700',
    emerald: 'border-emerald-600',
    teal: 'border-teal-600',
    sky: 'border-sky-500',
    gold: 'border-amber-600',
    bronze: 'border-orange-700',
    rose: 'border-rose-600',
    purple: 'border-purple-700',
  };

  const activeBorderStyle = borderStyle || 'none';
  const activeBorderColor = borderColor || 'accent';

  const borderStyleClass = BORDER_STYLES[activeBorderStyle] || '';
  const borderColorClass = activeBorderColor === 'accent' 
    ? colorConfig.borderClass 
    : (BORDER_COLORS[activeBorderColor] || 'border-slate-700');

  const borderClasses = activeBorderStyle !== 'none' ? `${borderStyleClass} ${borderColorClass}` : '';
  const bracketBorderClass = BRACKET_COLORS[activeBorderColor] || colorConfig.borderClass;
  const showCornerBrackets = activeBorderStyle === 'bracket';
  const showInsetFrame = activeBorderStyle === 'inset';
  const printPaddingClass = activeBorderStyle !== 'none' ? 'print:p-[10mm]' : 'print:p-0';

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1123);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // A4 width in pixels is ~794px. We add 32px of margin (p-4 on mobile).
        const padding = 32;
        const availableWidth = width - padding;

        const sheetEl = document.getElementById('resume-a4-sheet');
        const layoutHeight = sheetEl ? sheetEl.offsetHeight : 1123;
        setSheetHeight(layoutHeight);

        if (availableWidth < 794) {
          setScale(Math.max(0.2, availableWidth / 794));
        } else {
          setScale(1);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    const timer = setTimeout(() => {
      const sheetEl = document.getElementById('resume-a4-sheet');
      if (sheetEl) setSheetHeight(sheetEl.offsetHeight);
    }, 150);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [sections, theme, currentFontId, personalInfo]);

  const renderHeader = () => {
    const { name, email, phone, website, github, linkedin } = previewPersonalInfo;
    const contacts = [
      phone && <span>{phone}</span>,
      email && <span>{email}</span>,
      website && <a href={website} target="_blank" rel="noreferrer" className={`underline ${colorConfig.linkHover}`}>{website.replace(/^https?:\/\//, '')}</a>,
      github && <a href={github} target="_blank" rel="noreferrer" className={`underline ${colorConfig.linkHover}`}>github.com/{github.replace(/^https?:\/\/github\.com\//, '')}</a>,
      linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className={`underline ${colorConfig.linkHover}`}>linkedin.com/in/{linkedin.replace(/^https?:\/\/linkedin\.com\/in\//, '')}</a>,
    ].filter(Boolean);

    if (theme === 'classic') {
      return (
        <div className="text-center border-b pb-4 mb-4 border-gray-300">
          <h1 className={`text-3xl ${activeFont.headingClass} ${colorConfig.primaryText} uppercase`}>{name}</h1>
          <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-xs ${activeFont.bodyClass} text-gray-700 font-medium`}>
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center">
                {c}
                {i < contacts.length - 1 && <span className="mx-2 font-bold">•</span>}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (theme === 'tech') {
      return (
        <div className={`border-b-2 ${colorConfig.borderClass} pb-4 mb-5`}>
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h1 className={`text-3xl ${activeFont.headingClass} ${colorConfig.primaryText}`}>{name}</h1>
              <p className={`text-xs ${activeFont.headingClass} ${colorConfig.secondaryText} mt-1 uppercase tracking-widest font-semibold`}>Developer Portfolio & Resume</p>
            </div>
            <div className={`text-right text-xs ${activeFont.bodyClass} text-slate-700 space-y-0.5`}>
              {contacts.map((c, i) => (
                <div key={i}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Modern Minimalist (Default)
    return (
      <div className="border-b pb-4 mb-5 border-slate-200">
        <h1 className={`text-3xl ${activeFont.headingClass} ${colorConfig.primaryText}`}>{name}</h1>
        <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-semibold ${activeFont.bodyClass} text-slate-650`}>
          {contacts.map((c, i) => (
            <span key={i} className="flex items-center">
              {c}
              {i < contacts.length - 1 && <span className="w-1.5 h-1.5 rounded-full bg-slate-350 mx-2 inline-block"></span>}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (section: ResumeSection) => {
    // Check if section is empty
    const isSummaryOrSkills = section.type === 'summary' || section.type === 'skills' || section.type === 'custom-text';
    const visibleItems = section.items.filter(hasItemContent);
    const isEmpty = isSummaryOrSkills ? !section.content.trim() : visibleItems.length === 0;
    if (isEmpty) return null;

    return (
      <div key={section.id} className="mb-5 break-inside-avoid">
        {/* Section Title (H2) */}
        {theme === 'classic' ? (
          <div className="text-center mb-2">
            <h2 className={`text-sm ${activeFont.headingClass} uppercase ${colorConfig.secondaryText} border-b border-gray-300 pb-0.5`}>{section.title}</h2>
          </div>
        ) : theme === 'tech' ? (
          <div className="mb-2">
            <h2 className={`text-sm ${activeFont.headingClass} uppercase ${colorConfig.secondaryText} border-l-4 ${colorConfig.borderClass} pl-2`}>{section.title}</h2>
          </div>
        ) : (
          <div className="mb-2 border-b border-slate-100 pb-1 flex items-center justify-between">
            <h2 className={`text-sm ${activeFont.headingClass} uppercase ${colorConfig.secondaryText}`}>{section.title}</h2>
          </div>
        )}

        {/* Section Content */}
        <div className={`text-xs ${activeFont.bodyClass} text-slate-700 leading-relaxed`}>
          {isSummaryOrSkills ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(section.content, colorConfig.linkHover) }} />
          ) : (
            <div className="space-y-4">
              {visibleItems.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline text-slate-900">
                    <span className={`text-xs ${activeFont.headingClass}`}>{item.title}</span>
                    <span className="text-slate-500 font-normal text-[10px]">{item.dates}</span>
                  </div>
                  {item.subtitle && (
                    <div className="text-[11px] font-medium text-slate-650 italic mt-0.5">
                      {item.subtitle}
                    </div>
                  )}
                  {item.description && (
                    <div 
                      className="mt-1 text-slate-700 leading-relaxed text-[11px]" 
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(item.description, colorConfig.linkHover) }} 
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-900 p-4 md:p-8 flex justify-center items-start print:bg-white print:p-0 print:overflow-visible"
    >
      {/* Scaled A4 Wrapper */}
      <div 
        style={scale < 1 ? {
          width: `${794 * scale}px`,
          height: `${sheetHeight * scale}px`,
          position: 'relative'
        } : {}}
        className="shrink-0 print:w-full print:h-auto"
      >
        <div 
          id="resume-a4-sheet" 
          style={scale < 1 ? {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            left: 0,
            top: 0
          } : {}}
          className={`w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] text-slate-800 ${activeFont.bodyClass} leading-relaxed select-text
            print:shadow-none print:w-full ${printPaddingClass} print:min-h-0 print:bg-white print:position-relative print:transform-none ${borderClasses} relative`}
        >
          {showCornerBrackets && (
            <>
              <span className={`absolute left-[10mm] top-[10mm] w-12 h-12 border-l-[5px] border-t-[5px] ${bracketBorderClass}`} />
              <span className={`absolute right-[10mm] top-[10mm] w-12 h-12 border-r-[5px] border-t-[5px] ${bracketBorderClass}`} />
              <span className={`absolute left-[10mm] bottom-[10mm] w-12 h-12 border-l-[5px] border-b-[5px] ${bracketBorderClass}`} />
              <span className={`absolute right-[10mm] bottom-[10mm] w-12 h-12 border-r-[5px] border-b-[5px] ${bracketBorderClass}`} />
            </>
          )}
          {showInsetFrame && (
            <span className={`absolute inset-[10mm] border ${bracketBorderClass} pointer-events-none`} />
          )}
          {renderHeader()}
          <div className="space-y-2">
            {previewSections.map(renderSection)}
          </div>
        </div>
      </div>
    </div>
  );
}
