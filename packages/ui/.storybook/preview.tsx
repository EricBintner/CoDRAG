import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/styles/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // We handle background via the decorator and theme
    },
    layout: 'fullscreen',
  },
  globalTypes: {
    theme: {
      name: 'Mode',
      description: 'Light/Dark mode',
      defaultValue: 'dark', // Default to dark for better initial impact
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
    codragTheme: {
      name: 'Visual Style',
      description: 'CoDRAG visual theme direction',
      defaultValue: 'h', // Default to Retro-Futurism as requested
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'none', title: 'Default (Tokens only)' },
          { value: 'a', title: 'A: Slate Developer' },
          { value: 'b', title: 'B: Deep Focus' },
          { value: 'c', title: 'C: Signal Green' },
          { value: 'd', title: 'D: Warm Craft' },
          { value: 'e', title: 'E: Neo-Brutalist' },
          { value: 'f', title: 'F: Swiss Minimal' },
          { value: 'g', title: 'G: Glass-Morphic' },
          { value: 'h', title: 'H: Retro-Futurism' },
          { value: 'i', title: 'I: Studio Collage' },
          { value: 'j', title: 'J: Yale Grid' },
          { value: 'k', title: 'K: Inclusive Focus' },
          { value: 'l', title: 'L: Enterprise Console' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const mode = context.globals.theme;
      const codragTheme = context.globals.codragTheme;
      
      // Set light/dark mode
      React.useEffect(() => {
        document.documentElement.classList.toggle('dark', mode === 'dark');
        document.documentElement.setAttribute('data-theme', mode);
        
        // Set CoDRAG visual theme (or remove if 'none')
        if (codragTheme && codragTheme !== 'none') {
          document.documentElement.setAttribute('data-codrag-theme', codragTheme);
        } else {
          document.documentElement.removeAttribute('data-codrag-theme');
        }
      }, [mode, codragTheme]);
      
      return (
        <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-200">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
