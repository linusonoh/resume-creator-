'use client';

import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import FontSelector from '@/components/resume/FontSelector';
import { serializeResumeToMarkdown, deserializeMarkdownToResume } from '@/store/markdownParser';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Cpu, 
  FileText, 
  RotateCcw,
  Upload,
  Download,
  Undo,
  Redo
} from 'lucide-react';

export default function EditorPanel() {
  const { 
    personalInfo, 
    sections, 
    updatePersonalInfo, 
    updateSectionTitle, 
    updateSectionContent,
    addSectionItem,
    updateSectionItem,
    removeSectionItem,
    moveSection,
    resetResume,
    addCustomSection,
    removeSection,
    importResumeData,
    past,
    future,
    undo,
    redo,
    saveHistory
  } = useResumeStore();

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<'custom-text' | 'custom-list'>('custom-text');
  const [editMode, setEditMode] = useState<'form' | 'markdown'>('form');
  const [rawMarkdown, setRawMarkdown] = useState<string>('');

  // Keep raw markdown in sync with store changes (e.g. from undo, redo, or form updates)
  useEffect(() => {
    if (editMode === 'markdown') {
      const serialized = serializeResumeToMarkdown(personalInfo, sections);
      const parsedRaw = deserializeMarkdownToResume(rawMarkdown, sections);
      const isDifferent = JSON.stringify(parsedRaw.personalInfo) !== JSON.stringify(personalInfo) ||
                          JSON.stringify(parsedRaw.sections) !== JSON.stringify(sections);
      if (isDifferent) {
        setTimeout(() => {
          setRawMarkdown(serialized);
        }, 0);
      }
    }
  }, [personalInfo, sections, editMode, rawMarkdown]);

  const handleExportJSON = () => {
    const state = useResumeStore.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      personalInfo: state.personalInfo,
      sections: state.sections,
      theme: state.theme,
      currentFontId: state.currentFontId,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const userName = state.personalInfo.name || 'resume';
    downloadAnchor.setAttribute("download", `${userName.replace(/\s+/g, '_')}_resume_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.personalInfo && data.sections) {
          importResumeData(data.personalInfo, data.sections);
          if (data.theme) {
            useResumeStore.getState().setTheme(data.theme);
          }
          if (data.currentFontId) {
            useResumeStore.getState().setFontId(data.currentFontId);
          }
          alert("Resume data imported successfully!");
        } else {
          alert("Invalid file format. Make sure it's a valid resume backup file.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    addCustomSection(newSectionTitle.trim(), newSectionType);
    setNewSectionTitle('');
    setShowAddSection(false);
  };

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = (text: string) => {
    return text ? text.length : 0;
  };

  const handleStartFresh = () => {
    if (confirm("Are you sure you want to clear all data? This will wipe your current resume contents to let you start from scratch.")) {
      importResumeData(
        {
          name: '',
          email: '',
          phone: '',
          website: '',
          github: '',
          linkedin: '',
        },
        sections.map((s) => ({
          ...s,
          content: '',
          items: [],
        }))
      );
      useResumeStore.getState().setTheme('modern');
      useResumeStore.getState().setFontId('modern-clean');
      useResumeStore.getState().setAccentColor('indigo');
    }
  };

  const sectionIcons: Record<string, React.ReactNode> = {
    personal: <User size={16} />,
    summary: <FileText size={16} />,
    experience: <Briefcase size={16} />,
    projects: <Cpu size={16} />,
    education: <GraduationCap size={16} />,
    skills: <Cpu size={16} />,
    'custom-text': <FileText size={16} />,
    'custom-list': <Briefcase size={16} />,
  };

  return (
    <div className="w-full md:w-[480px] bg-slate-950 border-r border-slate-800 flex flex-col h-full print:hidden">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <div>
          <h2 className="text-md font-bold text-white tracking-tight">Resume Editor</h2>
          <p className="text-[10px] text-slate-400">Add info & style with basic Markdown</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="file"
            id="import-json-file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
          
          {/* Undo/Redo Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
            <button 
              disabled={past.length === 0}
              onClick={undo}
              className="p-1 rounded text-slate-300 disabled:opacity-35 hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Undo last action"
            >
              <Undo size={11} />
            </button>
            <button 
              disabled={future.length === 0}
              onClick={redo}
              className="p-1 rounded text-slate-300 disabled:opacity-35 hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Redo action"
            >
              <Redo size={11} />
            </button>
          </div>

          <label
            htmlFor="import-json-file"
            className="flex items-center gap-1 text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold px-2 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition-colors"
            title="Import JSON Backup"
          >
            <Upload size={11} />
            Import
          </label>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold px-2 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Export JSON Backup"
          >
            <Download size={11} />
            Export
          </button>
          <button 
            onClick={handleStartFresh}
            className="flex items-center gap-1 text-[10px] bg-slate-850 hover:bg-slate-800 hover:text-red-400 text-slate-300 font-semibold px-2 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Wipe all content and start fresh"
          >
            <Trash2 size={11} className="text-slate-450 hover:text-red-400" />
            Clear
          </button>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to reset your resume to default values? All current edits will be lost.")) {
                resetResume();
              }
            }}
            className="flex items-center gap-1 text-[10px] bg-red-950/40 hover:bg-red-900/40 text-red-400 font-semibold px-2 py-1.5 rounded-lg border border-red-900/60 transition-colors cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-4 py-2 gap-2">
        <button
          onClick={() => setEditMode('form')}
          className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            editMode === 'form' 
              ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          Form Editor
        </button>
        <button
          onClick={() => {
            setRawMarkdown(serializeResumeToMarkdown(personalInfo, sections));
            setEditMode('markdown');
          }}
          className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            editMode === 'markdown' 
              ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          Markdown Editor
        </button>
      </div>

      {/* Editor Content Area */}
      <div className={`flex-1 p-4 ${editMode === 'markdown' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto space-y-3'}`}>
        {editMode === 'markdown' ? (
          <div className="flex-1 flex flex-col min-h-0 h-full">
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Raw Markdown Resume</label>
              <span className="text-[9px] text-slate-500 font-medium">Real-time bidirectional sync</span>
            </div>
            <textarea
              value={rawMarkdown}
              onFocus={saveHistory}
              onChange={(e) => {
                const text = e.target.value;
                setRawMarkdown(text);
                const parsed = deserializeMarkdownToResume(text, sections);
                importResumeData(parsed.personalInfo, parsed.sections);
              }}
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none h-full min-h-[300px] overflow-y-auto"
              placeholder="# Your Name&#10;Email: your.email@example.com&#10;Phone: +1...&#10;&#10;## Professional Summary&#10;..."
            />
            <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono font-medium">
              <span>Changes sync instantly</span>
              <div className="flex gap-2">
                <span>{getWordCount(rawMarkdown)} words</span>
                <span>•</span>
                <span>{getCharCount(rawMarkdown)} chars</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Personal Info Accordion */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
          <button
            onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
            className="w-full flex items-center justify-between p-3.5 text-left text-sm font-semibold text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">{sectionIcons.personal}</span>
              <span>Personal Details</span>
            </div>
            {activeSection === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {activeSection === 'personal' && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Website</label>
                  <input
                    type="text"
                    value={personalInfo.website}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Github</label>
                  <input
                    type="text"
                    value={personalInfo.github}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={personalInfo.linkedin}
                    onFocus={saveHistory}
                    onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Font Pairing Selection */}
        <FontSelector />

        {/* Dynamic Sections Accordions */}
        {sections.map((section, sIndex) => {
          const isOpen = activeSection === section.id;
          const isSummaryOrSkills = section.type === 'summary' || section.type === 'skills' || section.type === 'custom-text';

          return (
            <div key={section.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              <div className="w-full flex items-center justify-between p-3.5 bg-slate-900/30 hover:bg-slate-900 transition-colors">
                <button
                  onClick={() => setActiveSection(isOpen ? '' : section.id)}
                  className="flex-1 flex items-center gap-2 text-left text-sm font-semibold text-slate-200"
                >
                  <span className="text-indigo-400">{sectionIcons[section.type] || <FileText size={16} />}</span>
                  <span>{section.title}</span>
                </button>
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    disabled={sIndex === 0}
                    onClick={() => moveSection(sIndex, 'up')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                    title="Move section up"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    disabled={sIndex === sections.length - 1}
                    onClick={() => moveSection(sIndex, 'down')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                    title="Move section down"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the "${section.title}" section?`)) {
                        removeSection(section.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3.5">
                  {/* Section Title Input */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Section Header</label>
                    <input
                      type="text"
                      value={section.title}
                      onFocus={saveHistory}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Non-item simple text content (e.g. Summary / Skills) */}
                  {isSummaryOrSkills ? (
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Content</label>
                        <span className="text-[9px] text-slate-500">Supports markdown like **bold**</span>
                      </div>
                      <textarea
                        value={section.content}
                        onFocus={saveHistory}
                        onChange={(e) => updateSectionContent(section.id, e.target.value)}
                        rows={6}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
                      />
                      <div className="flex justify-end text-[9px] text-slate-500 mt-1 gap-2.5 font-mono font-medium">
                        <span>{getWordCount(section.content)} words</span>
                        <span>•</span>
                        <span>{getCharCount(section.content)} chars</span>
                      </div>
                    </div>
                  ) : (
                    /* Item arrays (e.g. Experience / Projects / Education) */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {section.items.map((item) => (
                          <div key={item.id} className="p-3 border border-slate-800 rounded-lg bg-slate-900/30 relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => removeSectionItem(section.id, item.id)}
                                className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded transition-colors"
                                title="Delete item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3.5 mb-2">
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Title / Organization</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onFocus={saveHistory}
                                  onChange={(e) => updateSectionItem(section.id, item.id, { title: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Role / Tech / Subtitle</label>
                                <input
                                  type="text"
                                  value={item.subtitle}
                                  onFocus={saveHistory}
                                  onChange={(e) => updateSectionItem(section.id, item.id, { subtitle: e.target.value })}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="mb-2">
                              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Dates / Period</label>
                              <input
                                type="text"
                                value={item.dates}
                                onFocus={saveHistory}
                                onChange={(e) => updateSectionItem(section.id, item.id, { dates: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-baseline mb-0.5">
                                <label className="block text-[9px] uppercase font-bold text-slate-400">Description</label>
                                <span className="text-[8px] text-slate-500">Prefix bullet points with `- `</span>
                              </div>
                              <textarea
                                value={item.description}
                                onFocus={saveHistory}
                                onChange={(e) => updateSectionItem(section.id, item.id, { description: e.target.value })}
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                              />
                              <div className="flex justify-end text-[8.5px] text-slate-500 mt-0.5 gap-2 font-mono font-medium">
                                <span>{getWordCount(item.description)} words</span>
                                <span>•</span>
                                <span>{getCharCount(item.description)} chars</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addSectionItem(section.id)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs border border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-900 text-indigo-400 hover:text-indigo-300 font-medium py-2 rounded-lg transition-all"
                      >
                        <Plus size={14} />
                        Add New Item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Custom Section Controls */}
        {!showAddSection ? (
          <button
            onClick={() => setShowAddSection(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/40 text-indigo-400 hover:text-indigo-300 font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            Add Custom Section
          </button>
        ) : (
          <form onSubmit={handleAddSection} className="p-4 border border-indigo-950/60 bg-indigo-950/10 rounded-xl space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Create Custom Section</h3>
            
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Section Title</label>
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g. Certifications, Languages"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Section Type</label>
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value as 'custom-text' | 'custom-list')}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="custom-text">Text Block (e.g. Markdown text, Skills list)</option>
                <option value="custom-list">List Items (e.g. Work History, Projects, Degrees)</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionTitle('');
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-555 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Create Section
              </button>
            </div>
          </form>
        )}
          </>
        )}
      </div>
    </div>
  );
}
