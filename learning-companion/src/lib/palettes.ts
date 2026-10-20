// Ascent palettes. Every text token (ink, muted, faint, accentText, signal, danger)
// is kept at WCAG AA (4.5:1) or better on bg, surface and raised; tests enforce it.
import type { ResolvedMode } from './theme';

export type Palette = {
  mode: ResolvedMode;
  dark: boolean;
  /** Page background (solid fallback) and the two stops of its vertical gradient. */
  bg: string;
  gradient: [string, string];
  surface: string;
  raised: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  /** Stronger border for inputs and selected outlines. */
  edge: string;
  accent: string;
  onAccent: string;
  /** Accent used as text/icon colour on surfaces. */
  accentText: string;
  /** Tinted background behind accent text (chips, current row). */
  accentSoft: string;
  soft: string;
  danger: string;
  success: string;
  signal: string;
  glass: string;
  hero: string;
  /** Solid label plates on the route board. */
  plate: string;
  plateInk: string;
  /** Dither / ASCII art ink (decorative, not text). */
  art: string;
  artSoft: string;
  heat: string[];
  /** Mote's body colours (light, mid, shade). */
  mote: [string, string, string];
};

export const dawn: Palette = {
  mode: 'dawn',
  dark: false,
  bg: '#F6F1E7',
  gradient: ['#F6F1E7', '#DDE7F3'],
  surface: '#FFFDF8',
  raised: '#FBF6EC',
  ink: '#14161A',
  muted: '#3D424B',
  faint: '#555B66',
  line: '#DCD3C2',
  edge: '#8E8676',
  accent: '#2F5BEA',
  onAccent: '#FFFFFF',
  accentText: '#2348C8',
  accentSoft: '#E3E9FB',
  soft: '#EEE7D9',
  danger: '#A61E31',
  success: '#1D5E8C',
  signal: '#2348C8',
  glass: 'rgba(255,253,248,.88)',
  hero: '#EFE8DA',
  plate: '#FFFDF8',
  plateInk: '#14161A',
  art: '#1E2A44',
  artSoft: '#9DB0D6',
  heat: ['#E8E0D0', '#BCCDF4', '#7F9FEE', '#3F68E3', '#1A3399'],
  mote: ['#F3D9A4', '#D9B26C', '#9C7838'],
};

export const dusk: Palette = {
  mode: 'dusk',
  dark: true,
  bg: '#0B0F17',
  gradient: ['#0B0F17', '#1B2433'],
  surface: '#121925',
  raised: '#18212F',
  ink: '#EEF1F5',
  muted: '#BCC5D2',
  faint: '#98A3B3',
  line: '#283346',
  edge: '#5A6B85',
  accent: '#7CC4FF',
  onAccent: '#06121F',
  accentText: '#8FCDFF',
  accentSoft: '#15304A',
  soft: '#1C2636',
  danger: '#FF9DAA',
  success: '#9FD9FF',
  signal: '#8FCDFF',
  glass: 'rgba(18,25,37,.9)',
  hero: '#111827',
  plate: '#0E1520',
  plateInk: '#EEF1F5',
  art: '#7CC4FF',
  artSoft: '#2B4766',
  heat: ['#172030', '#1E3A58', '#2D6596', '#5299D3', '#A6DAFF'],
  mote: ['#F1D7A0', '#C9A15C', '#7E5E2A'],
};

export const terminal: Palette = {
  mode: 'terminal',
  dark: true,
  bg: '#000000',
  gradient: ['#000000', '#0A0A0A'],
  surface: '#050505',
  raised: '#0C0C0C',
  ink: '#F4F4F4',
  muted: '#C8C8C8',
  faint: '#A0A0A0',
  line: '#3A3A3A',
  edge: '#8A8A8A',
  accent: '#FFFFFF',
  onAccent: '#000000',
  accentText: '#FFFFFF',
  accentSoft: '#1A1A1A',
  soft: '#141414',
  danger: '#FF9DAA',
  success: '#FFFFFF',
  signal: '#FFFFFF',
  glass: 'rgba(0,0,0,.92)',
  hero: '#000000',
  plate: '#000000',
  plateInk: '#FFFFFF',
  art: '#FFFFFF',
  artSoft: '#4A4A4A',
  heat: ['#161616', '#3A3A3A', '#6E6E6E', '#ABABAB', '#F4F4F4'],
  mote: ['#FFFFFF', '#BDBDBD', '#6B6B6B'],
};

export const contrastMode: Palette = {
  mode: 'contrast',
  dark: false,
  bg: '#FFFFFF',
  gradient: ['#FFFFFF', '#FFFFFF'],
  surface: '#FFFFFF',
  raised: '#FFFFFF',
  ink: '#000000',
  muted: '#1A1A1A',
  faint: '#2E2E2E',
  line: '#000000',
  edge: '#000000',
  accent: '#0030C0',
  onAccent: '#FFFFFF',
  accentText: '#0030C0',
  accentSoft: '#E6ECFF',
  soft: '#EDEDED',
  danger: '#8C0014',
  success: '#002E80',
  signal: '#0030C0',
  glass: '#FFFFFF',
  hero: '#FFFFFF',
  plate: '#FFFFFF',
  plateInk: '#000000',
  art: '#000000',
  artSoft: '#7A7A7A',
  heat: ['#EFEFEF', '#AFC0F5', '#5E7FE6', '#1E46C8', '#001A80'],
  mote: ['#F3D9A4', '#C99A4A', '#5E431A'],
};

export const PALETTES: Record<ResolvedMode, Palette> = {
  dawn,
  dusk,
  terminal,
  contrast: contrastMode,
};
