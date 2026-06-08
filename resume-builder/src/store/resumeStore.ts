import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
}

export interface ResumeItem {
  id: string;
  title: string;       // e.g. Company name, Project name, Institution
  subtitle: string;    // e.g. Role, Technologies, Degree
  dates: string;       // e.g. "Jan 2021 - Present"
  description: string; // Markdown description
}

export interface ResumeSection {
  id: string;
  type: 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'custom-text' | 'custom-list';
  title: string;
  content: string;     // Used for summary/skills text
  items: ResumeItem[];
}

export type LayoutTheme = 'modern' | 'classic' | 'tech';
export type AccentColor = 'slate' | 'indigo' | 'emerald' | 'rose' | 'amber';

export interface ResumeSnapshot {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  theme: LayoutTheme;
  currentFontId: string;
  accentColor: AccentColor;
}

export interface ResumeState {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  theme: LayoutTheme;
  currentFontId: string;
  accentColor: AccentColor;
  past: ResumeSnapshot[];
  future: ResumeSnapshot[];
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSectionContent: (sectionId: string, content: string) => void;
  addSectionItem: (sectionId: string) => void;
  updateSectionItem: (sectionId: string, itemId: string, fields: Partial<ResumeItem>) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  moveSection: (index: number, direction: 'up' | 'down') => void;
  setTheme: (theme: LayoutTheme) => void;
  setFontId: (fontId: string) => void;
  setAccentColor: (accentColor: AccentColor) => void;
  resetResume: () => void;
  addCustomSection: (title: string, type: 'custom-text' | 'custom-list') => void;
  removeSection: (sectionId: string) => void;
  importResumeData: (personalInfo: PersonalInfo, sections: ResumeSection[]) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

const defaultPersonalInfo: PersonalInfo = {
  name: 'Linus Onoh',
  email: 'linus.onoh@example.com',
  phone: '+1 (555) 019-2834',
  website: 'https://linusonoh.dev',
  github: 'https://github.com/linusonoh',
  linkedin: 'https://linkedin.com/in/linusonoh',
};

const defaultSections: ResumeSection[] = [
  {
    id: 'summary',
    type: 'summary',
    title: 'Professional Summary',
    content: 'Dynamic and results-driven Software Engineer with 4+ years of experience building scalable web applications. Proficient in Next.js, React, TypeScript, and modern styling libraries like Tailwind CSS. Strong advocate for clean architecture and user-centric designs.',
    items: [],
  },
  {
    id: 'experience',
    type: 'experience',
    title: 'Work Experience',
    content: '',
    items: [
      {
        id: 'exp-1',
        title: 'Senior Frontend Developer',
        subtitle: 'TechCorp Solutions',
        dates: '2023 - Present',
        description: 'Led development of a high-performance analytics dashboard using **Next.js** and **TypeScript**.\nOptimized bundle sizes and page load times by **35%** through lazy loading and selective caching.\nMentored 4 junior developers and established code quality standards.',
      },
      {
        id: 'exp-2',
        title: 'Software Engineer',
        subtitle: 'DevBuilders Inc',
        dates: '2021 - 2023',
        description: 'Built and maintained multiple client e-commerce platforms using **React** and **Tailwind CSS**.\nIntegrated third-party APIs for processing payment and user authentication.\nDesigned responsive interfaces that reduced mobile bounce rate by **20%**.',
      }
    ],
  },
  {
    id: 'projects',
    type: 'projects',
    title: 'Featured Projects',
    content: '',
    items: [
      {
        id: 'proj-1',
        title: 'Markdown Resume Builder',
        subtitle: 'Next.js, TypeScript, Zustand, Tailwind',
        dates: '2026',
        description: 'Created a responsive web app enabling developers to build ATS-friendly resumes in real-time.\nImplemented A4 page scaling preview with live Markdown rendering.\nAdded PDF print export using specialized CSS pagination rules.',
      }
    ],
  },
  {
    id: 'education',
    type: 'education',
    title: 'Education',
    content: '',
    items: [
      {
        id: 'edu-1',
        title: 'Bachelor of Science in Computer Science',
        subtitle: 'State University',
        dates: '2017 - 2021',
        description: 'Graduated with Honors. Specialization in Web Technologies and Database Systems.',
      }
    ],
  },
  {
    id: 'skills',
    type: 'skills',
    title: 'Skills',
    content: 'Languages: JavaScript, TypeScript, Python, HTML5, CSS3\nFrameworks: React, Next.js, Node.js, Express\nTools: Git, Tailwind CSS, PostgreSQL, Docker, Jest',
    items: [],
  }
];

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      personalInfo: defaultPersonalInfo,
      sections: defaultSections,
      theme: 'modern',
      currentFontId: 'modern-clean',
      accentColor: 'indigo',
      past: [],
      future: [],
      
      saveHistory: () => {
        const state = get();
        const currentSnapshot: ResumeSnapshot = {
          personalInfo: JSON.parse(JSON.stringify(state.personalInfo)),
          sections: JSON.parse(JSON.stringify(state.sections)),
          theme: state.theme,
          currentFontId: state.currentFontId,
          accentColor: state.accentColor,
        };
        
        // Don't save duplicate snapshots
        if (state.past.length > 0) {
          const last = state.past[state.past.length - 1];
          if (JSON.stringify(last) === JSON.stringify(currentSnapshot)) {
            return;
          }
        }
        
        set({
          past: [...state.past, currentSnapshot].slice(-30),
          future: [],
        });
      },

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return {};
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, state.past.length - 1);
          const currentSnapshot: ResumeSnapshot = {
            personalInfo: JSON.parse(JSON.stringify(state.personalInfo)),
            sections: JSON.parse(JSON.stringify(state.sections)),
            theme: state.theme,
            currentFontId: state.currentFontId,
            accentColor: state.accentColor,
          };
          return {
            personalInfo: previous.personalInfo,
            sections: previous.sections,
            theme: previous.theme,
            currentFontId: previous.currentFontId,
            accentColor: previous.accentColor,
            past: newPast,
            future: [currentSnapshot, ...state.future],
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return {};
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          const currentSnapshot: ResumeSnapshot = {
            personalInfo: JSON.parse(JSON.stringify(state.personalInfo)),
            sections: JSON.parse(JSON.stringify(state.sections)),
            theme: state.theme,
            currentFontId: state.currentFontId,
            accentColor: state.accentColor,
          };
          return {
            personalInfo: next.personalInfo,
            sections: next.sections,
            theme: next.theme,
            currentFontId: next.currentFontId,
            accentColor: next.accentColor,
            past: [...state.past, currentSnapshot],
            future: newFuture,
          };
        }),

      updatePersonalInfo: (info) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        })),
      updateSectionTitle: (sectionId, title) => {
        get().saveHistory();
        set((state) => ({
          sections: state.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
        }));
      },
      updateSectionContent: (sectionId, content) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
        })),
      addSectionItem: (sectionId) => {
        get().saveHistory();
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.id !== sectionId) return s;
            const newItem: ResumeItem = {
              id: `${sectionId}-${Date.now()}`,
              title: 'New Item',
              subtitle: 'Subtitle / Role',
              dates: 'Date Range',
              description: 'Description (supports **Markdown**)',
            };
            return { ...s, items: [...s.items, newItem] };
          }),
        }));
      },
      updateSectionItem: (sectionId, itemId, fields) =>
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              items: s.items.map((item) => (item.id === itemId ? { ...item, ...fields } : item)),
            };
          }),
        })),
      removeSectionItem: (sectionId, itemId) => {
        get().saveHistory();
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.id !== sectionId) return s;
            return {
              ...s,
              items: s.items.filter((item) => item.id !== itemId),
            };
          }),
        }));
      },
      moveSection: (index, direction) => {
        get().saveHistory();
        set((state) => {
          const nextIndex = direction === 'up' ? index - 1 : index + 1;
          if (nextIndex < 0 || nextIndex >= state.sections.length) return {};
          const nextSections = [...state.sections];
          const temp = nextSections[index];
          nextSections[index] = nextSections[nextIndex];
          nextSections[nextIndex] = temp;
          return { sections: nextSections };
        });
      },
      setTheme: (theme) => {
        get().saveHistory();
        set({ theme });
      },
      setFontId: (currentFontId) => {
        get().saveHistory();
        set({ currentFontId });
      },
      setAccentColor: (accentColor) => {
        get().saveHistory();
        set({ accentColor });
      },
      resetResume: () => {
        get().saveHistory();
        set({
          personalInfo: defaultPersonalInfo,
          sections: defaultSections,
          theme: 'modern',
          currentFontId: 'modern-clean',
          accentColor: 'indigo',
        });
      },
      addCustomSection: (title, type) => {
        get().saveHistory();
        set((state) => {
          const id = `custom-${Date.now()}`;
          const newSection: ResumeSection = {
            id,
            type,
            title,
            content: '',
            items: [],
          };
          return { sections: [...state.sections, newSection] };
        });
      },
      removeSection: (sectionId) => {
        get().saveHistory();
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== sectionId),
        }));
      },
      importResumeData: (personalInfo, sections) => {
        get().saveHistory();
        set({
          personalInfo,
          sections,
        });
      },
    }),
    {
      name: 'markdown-resume-store',
      partialize: (state) => ({
        personalInfo: state.personalInfo,
        sections: state.sections,
        theme: state.theme,
        currentFontId: state.currentFontId,
        accentColor: state.accentColor,
      }),
    }
  )
);
