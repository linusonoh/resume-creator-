'use client';

import React, { useState, useEffect } from 'react';
import EditorPanel from '@/components/resume/EditorPanel';
import PreviewPanel from '@/components/resume/PreviewPanel';
import { useResumeStore, LayoutTheme } from '@/store/resumeStore';
import { Printer, Palette, ChevronDown, FileText, Image as ImageIcon } from 'lucide-react';
import { toJpeg } from 'html-to-image';

export default function ResumeBuilderPage() {
  const { theme, setTheme, accentColor, setAccentColor } = useResumeStore();
  const [mounted, setMounted] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Suppress hydration errors by waiting for the store to hydrate on the client
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    if (!showExportMenu) return;
    const handleOutsideClick = () => setShowExportMenu(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showExportMenu]);

  const handlePrint = () => {
    const oldTitle = document.title;
    const userName = useResumeStore.getState().personalInfo.name;
    if (userName) {
      document.title = `${userName.replace(/\s+/g, '_')}_Resume`;
    }
    
    window.print();
    document.title = oldTitle;
  };

  const handleExportJPG = () => {
    const node = document.getElementById('resume-a4-sheet');
    if (!node) {
      alert("Resume preview element not found!");
      return;
    }

    // High quality export configuration
    toJpeg(node, { 
      quality: 0.95, 
      backgroundColor: '#ffffff',
      pixelRatio: 2 // Make it double-density for high print/read quality
    })
      .then((dataUrl) => {
        const userName = useResumeStore.getState().personalInfo.name || 'resume';
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataUrl);
        downloadAnchor.setAttribute("download", `${userName.replace(/\s+/g, '_')}_Resume.jpg`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
        alert("Failed to generate JPG image. Please try again.");
      });
  };

  const handleExportWord = () => {
    const state = useResumeStore.getState();
    const { personalInfo, sections } = state;
    
    // Build contact elements
    const contacts = [
      personalInfo.phone,
      personalInfo.email,
      personalInfo.website ? personalInfo.website.replace(/^https?:\/\//, '') : '',
      personalInfo.github ? `github.com/${personalInfo.github.replace(/^https?:\/\/github\.com\//, '')}` : '',
      personalInfo.linkedin ? `linkedin.com/in/${personalInfo.linkedin.replace(/^https?:\/\/linkedin\.com\/in\//, '')}` : '',
    ].filter(Boolean);

    let docHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333333; line-height: 1.4;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24pt; margin: 0 0 5px 0; color: #111111; font-weight: bold; text-transform: uppercase;">${personalInfo.name}</h1>
          <div style="font-size: 10pt; color: #555555;">
            ${contacts.join(' &nbsp;•&nbsp; ')}
          </div>
        </div>
    `;

    sections.forEach((section) => {
      const isTextSection = section.type === 'summary' || section.type === 'skills' || section.type === 'custom-text';
      const isEmpty = isTextSection ? !section.content : section.items.length === 0;
      if (isEmpty) return;

      docHtml += `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 13pt; border-bottom: 1px solid #999999; margin: 15px 0 6px 0; padding-bottom: 2px; color: #111111; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${section.title}</h2>
      `;

      if (isTextSection) {
        const parsedText = section.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br />');
        docHtml += `<div style="font-size: 10.5pt; color: #333333; text-align: justify;">${parsedText}</div>`;
      } else {
        section.items.forEach((item) => {
          docHtml += `
            <div style="margin-bottom: 10px;">
              <table style="width: 100%; font-size: 10.5pt; font-weight: bold; color: #111111; margin-bottom: 2px;">
                <tr>
                  <td style="text-align: left; font-weight: bold;">${item.title}</td>
                  <td style="text-align: right; font-weight: normal; font-size: 9.5pt; color: #666666;">${item.dates}</td>
                </tr>
              </table>
          `;

          if (item.subtitle) {
            docHtml += `<div style="font-size: 10pt; font-style: italic; color: #555555; margin-bottom: 4px;">${item.subtitle}</div>`;
          }

          if (item.description) {
            const lines = item.description.split('\n');
            let listItems = '';
            let standardText = '';

            lines.forEach((line) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletContent = trimmed.substring(2)
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                listItems += `<li style="margin-bottom: 3px;">${bulletContent}</li>`;
              } else if (trimmed !== '') {
                const textContent = trimmed
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                standardText += `<div style="margin-bottom: 3px;">${textContent}</div>`;
              }
            });

            if (standardText) {
              docHtml += `<div style="font-size: 10pt; color: #444444; margin-bottom: 4px;">${standardText}</div>`;
            }
            if (listItems) {
              docHtml += `<ul style="font-size: 10pt; color: #444444; margin: 3px 0 5px 0; padding-left: 20px; list-style-type: disc;">${listItems}</ul>`;
            }
          }

          docHtml += `</div>`;
        });
      }

      docHtml += `</div>`;
    });

    docHtml += `</div>`;

    const docWrapper = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${personalInfo.name} Resume</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 8.5in 11in;
            margin: 0.75in;
          }
        </style>
      </head>
      <body>
        ${docHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docWrapper], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${personalInfo.name.replace(/\s+/g, '_')}_Resume.doc`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wider font-mono">Initializing Builder...</span>
        </div>
      </div>
    );
  }

  const themesList: { value: LayoutTheme; label: string; desc: string }[] = [
    { value: 'modern', label: 'Modern Minimalist', desc: 'Sans-serif clean typography' },
    { value: 'classic', label: 'Classic Executive', desc: 'Serif elegant traditional layout' },
    { value: 'tech', label: 'Tech Compact', desc: 'Monospaced tech-inspired styling' },
  ];

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 select-none overflow-hidden print:h-auto print:overflow-visible">
      {/* Dashboard Topbar Navigation */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between print:hidden shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            O
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Onpoint Resume</h1>
            <p className="text-[9px] text-slate-400 leading-none">Markdown Resume Creator</p>
          </div>
        </div>

        {/* Controls: Theme Selector, Accent Color Picker, and Dynamic Exporter */}
        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 flex items-center gap-1">
              <Palette size={11} /> Theme
            </span>
            <div className="flex items-center gap-1">
              {themesList.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all duration-150 cursor-pointer
                    ${theme === t.value 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'}`}
                  title={t.desc}
                >
                  {t.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 h-[28px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 flex items-center gap-1">
              Accent
            </span>
            <div className="flex items-center gap-1.5 px-1.5">
              {([
                { value: 'slate', colorClass: 'bg-slate-500', label: 'Slate' },
                { value: 'indigo', colorClass: 'bg-indigo-500', label: 'Indigo' },
                { value: 'emerald', colorClass: 'bg-emerald-500', label: 'Emerald' },
                { value: 'rose', colorClass: 'bg-rose-500', label: 'Rose' },
                { value: 'amber', colorClass: 'bg-amber-500', label: 'Amber' },
              ] as const).map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-150 relative flex items-center justify-center
                    ${c.colorClass}
                    ${accentColor === c.value 
                      ? 'ring-2 ring-white scale-110 shadow-md' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Export Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
            >
              Export Resume
              <ChevronDown size={12} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-indigo-950/40 hover:text-white transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Printer size={13} className="text-slate-400" />
                  Export to PDF (Print)
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-indigo-950/40 hover:text-white transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FileText size={13} className="text-slate-400" />
                  Export to Word (.doc)
                </button>
                <button
                  onClick={handleExportJPG}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-indigo-950/40 hover:text-white transition-colors flex items-center gap-2 cursor-pointer font-medium"
                >
                  <ImageIcon size={13} className="text-slate-400" />
                  Export to JPG Image
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 flex overflow-hidden print:overflow-visible print:block">
        <EditorPanel />
        <PreviewPanel />
      </main>
    </div>
  );
}
