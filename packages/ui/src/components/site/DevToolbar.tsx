"use client";

import { Card, Flex, Select, SelectItem, Switch, Text } from '@tremor/react';
import { Paintbrush, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';

type ThemeId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n';

type HeroVariant =
  | 'centered'
  | 'split'
  | 'neo'
  | 'swiss'
  | 'glass'
  | 'retro'
  | 'studio'
  | 'yale'
  | 'focus'
  | 'enterprise';

type HeroSelection = 'default' | HeroVariant;

export interface DevToolbarProps {
  className?: string;
}

type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
};

const themeOptions: ThemeOption[] = [
  { id: 'a', label: 'A: Slate Developer', description: 'Neutral grays, monospace feel' },
  { id: 'b', label: 'B: Deep Focus', description: 'Deep blues, high contrast' },
  { id: 'c', label: 'C: Signal Green', description: 'Green accents, terminal vibe' },
  { id: 'd', label: 'D: Warm Craft', description: 'Warm tones, approachable' },
  { id: 'e', label: 'E: Neo-Brutalist', description: 'Bold, raw, high contrast, zero radius' },
  { id: 'f', label: 'F: Swiss Minimal', description: 'Clean grids, international red, whitespace' },
  { id: 'g', label: 'G: Glass-Morphic', description: 'Translucent layers, blurs, soft shadows' },
  { id: 'h', label: 'H: Retro-Futurism', description: 'Synthwave, neon glows, dark grids' },
  { id: 'm', label: 'M: Retro Aurora', description: 'Retro-future with teal/blue/purple glows' },
  { id: 'n', label: 'N: Retro Mirage', description: 'Retro-future variant with layered neon haze' },
  { id: 'i', label: 'I: Studio Collage', description: 'Expressive, layered, Cranbrook-inspired' },
  { id: 'j', label: 'J: Yale Grid', description: 'Typographic discipline, quiet, semantic' },
  { id: 'k', label: 'K: Inclusive Focus', description: 'High contrast, clear focus, accessible' },
  { id: 'l', label: 'L: Enterprise Console', description: 'Dense, governed, productive' },
];

const heroOptions: Array<{ id: HeroSelection; label: string }> = [
  { id: 'default', label: 'Auto (theme default)' },
  { id: 'centered', label: 'Centered' },
  { id: 'split', label: 'Split' },
  { id: 'neo', label: 'Neo-Brutalist' },
  { id: 'swiss', label: 'Swiss Minimal' },
  { id: 'glass', label: 'Glass' },
  { id: 'retro', label: 'Retro-Futurism' },
  { id: 'studio', label: 'Studio Collage' },
  { id: 'yale', label: 'Yale Grid' },
  { id: 'focus', label: 'Inclusive Focus' },
  { id: 'enterprise', label: 'Enterprise Console' },
];

const themeIds = new Set<ThemeId>(themeOptions.map((t) => t.id));
const heroSelections = new Set<HeroSelection>(heroOptions.map((h) => h.id));

function isThemeId(value: string | null): value is ThemeId {
  return value !== null && themeIds.has(value as ThemeId);
}

function isHeroSelection(value: string | null): value is HeroSelection {
  return value !== null && heroSelections.has(value as HeroSelection);
}

function parseBooleanParam(value: string | null): boolean | null {
  if (!value) return null;
  if (value === '1' || value.toLowerCase() === 'true') return true;
  if (value === '0' || value.toLowerCase() === 'false') return false;
  return null;
}

function getThemeDefaultHeroVariant(theme: ThemeId): HeroVariant {
  if (theme === 'e') return 'neo';
  if (theme === 'f') return 'swiss';
  if (theme === 'g') return 'glass';
  if (theme === 'h') return 'retro';
  if (theme === 'm' || theme === 'n') return 'retro';
  if (theme === 'i') return 'studio';
  if (theme === 'j') return 'yale';
  if (theme === 'k') return 'focus';
  if (theme === 'l') return 'enterprise';
  if (theme === 'a' || theme === 'd') return 'centered';
  if (theme === 'b' || theme === 'c') return 'split';
  return 'centered';
}

function getCurrentUrlPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function DevToolbar({ className }: DevToolbarProps) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return 'a';
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('theme');
    if (isThemeId(fromQuery)) return fromQuery;
    const fromAttr = document.documentElement.getAttribute('data-codrag-theme');
    if (isThemeId(fromAttr)) return fromAttr;
    return 'a';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = parseBooleanParam(params.get('dark'));
    if (fromQuery !== null) return fromQuery;
    return document.documentElement.classList.contains('dark');
  });

  const [hero, setHero] = useState<HeroSelection>(() => {
    if (typeof window === 'undefined') return 'default';
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('hero');
    if (isHeroSelection(fromQuery)) return fromQuery;
    return 'default';
  });

  const currentTheme = useMemo(() => themeOptions.find((t) => t.id === theme), [theme]);

  const resolvedHeroVariant = useMemo(
    () => (hero === 'default' ? getThemeDefaultHeroVariant(theme) : hero),
    [hero, theme],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-codrag-theme', theme);
    root.classList.toggle('dark', darkMode);
  }, [theme, darkMode]);

  useEffect(() => {
    const url = new URL(window.location.href);

    url.searchParams.set('theme', theme);

    if (darkMode) {
      url.searchParams.set('dark', '1');
    } else {
      url.searchParams.delete('dark');
    }

    if (hero === 'default') {
      url.searchParams.delete('hero');
    } else {
      url.searchParams.set('hero', hero);
    }

    const nextPath = `${url.pathname}${url.search}${url.hash}`;

    if (nextPath !== getCurrentUrlPath()) {
      window.history.replaceState(window.history.state, '', nextPath);
      window.dispatchEvent(new Event('codrag:dev-toolbar'));
    }
  }, [theme, darkMode, hero]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      const queryTheme = params.get('theme');
      if (isThemeId(queryTheme)) {
        setTheme(queryTheme);
      } else {
        const fromAttr = document.documentElement.getAttribute('data-codrag-theme');
        if (isThemeId(fromAttr)) setTheme(fromAttr);
      }

      const queryDark = parseBooleanParam(params.get('dark'));
      if (queryDark !== null) {
        setDarkMode(queryDark);
      } else {
        setDarkMode(document.documentElement.classList.contains('dark'));
      }

      const queryHero = params.get('hero');
      if (isHeroSelection(queryHero)) {
        setHero(queryHero);
      } else {
        setHero('default');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 w-[320px]', className)}>
      <Card className="border border-border bg-surface shadow-lg">
        <Flex justifyContent="between" alignItems="center" className="mb-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-primary" />
            <Text className="text-sm font-semibold text-text">Dev Toolbar</Text>
          </div>
          <label className="flex items-center gap-2">
            <Text className="text-xs text-text-muted">Dark</Text>
            <Switch checked={darkMode} onChange={setDarkMode} />
          </label>
        </Flex>

        <div className="space-y-3">
          <div>
            <Text className="text-xs text-text-muted mb-1">Theme</Text>
            <Select value={theme} onValueChange={(v) => isThemeId(v) && setTheme(v)}>
              {themeOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </Select>
            {currentTheme?.description && (
              <Text className="mt-1 text-xs text-text-subtle">{currentTheme.description}</Text>
            )}
          </div>

          <div>
            <Text className="text-xs text-text-muted mb-1">Hero</Text>
            <Select value={hero} onValueChange={(v) => isHeroSelection(v) && setHero(v)}>
              {heroOptions.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.label}
                </SelectItem>
              ))}
            </Select>
            <div className="mt-1 flex items-center gap-2">
              <Wand2 className="w-3.5 h-3.5 text-text-subtle" />
              <Text className="text-xs text-text-subtle">Resolved: {resolvedHeroVariant}</Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
