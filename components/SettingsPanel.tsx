import React, { useState } from 'react';
import { useTheme, ColorSchemeConfig } from '../contexts/ThemeContext';
import { useLanguage, LanguageConfig } from '../contexts/LanguageContext';
import { Settings, X, Palette, Globe, Check, Sun, Moon } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { colorScheme, setColorScheme, availableSchemes, isDark, toggleMode } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'theme' | 'language'>('theme');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up theme-transition"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('settings.preferences')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <button
            onClick={() => setActiveTab('theme')}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors relative"
            style={{
              color: activeTab === 'theme' ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'theme' ? 'var(--bg-secondary)' : 'transparent'
            }}
          >
            <Palette size={16} />
            <span className="font-medium text-sm">{t('settings.theme')}</span>
            {activeTab === 'theme' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors relative"
            style={{
              color: activeTab === 'language' ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'language' ? 'var(--bg-secondary)' : 'transparent'
            }}
          >
            <Globe size={16} />
            <span className="font-medium text-sm">{t('settings.language')}</span>
            {activeTab === 'language' && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'theme' && (
            <div className="space-y-4">
              {/* Dark/Light Toggle */}
              <div
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center gap-3">
                  {isDark ? <Moon size={20} style={{ color: 'var(--accent-primary)' }} /> : <Sun size={20} style={{ color: 'var(--accent-primary)' }} />}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {isDark ? 'Easy on the eyes' : 'Bright and clean'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleMode}
                  className="relative w-14 h-7 rounded-full transition-colors"
                  style={{
                    backgroundColor: isDark ? 'var(--accent-primary)' : 'var(--border-secondary)'
                  }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: isDark ? 'translateX(32px)' : 'translateX(4px)'
                    }}
                  />
                </button>
              </div>

              {/* Color Schemes */}
              <p className="text-xs uppercase font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Color Scheme
              </p>
              <div className="space-y-3">
                {availableSchemes.map((scheme: ColorSchemeConfig) => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className="w-full p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: colorScheme === scheme.id ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      border: colorScheme === scheme.id
                        ? '2px solid var(--accent-primary)'
                        : '2px solid var(--border-primary)'
                    }}
                  >
                    <span className="text-2xl">{scheme.icon}</span>
                    <div className="flex-1 text-left">
                      <div
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {scheme.name}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {scheme.description}
                      </div>
                    </div>
                    {colorScheme === scheme.id && (
                      <div
                        className="p-1 rounded-full"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      >
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-3">
              {availableLanguages.map((lang: LanguageConfig) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className="w-full p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: language === lang.id ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                    border: language === lang.id
                      ? '2px solid var(--accent-primary)'
                      : '2px solid var(--border-primary)'
                  }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {lang.nativeName}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {lang.name}
                    </div>
                  </div>
                  {language === lang.id && (
                    <div
                      className="p-1 rounded-full"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 text-center"
          style={{
            borderTop: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)'
          }}
        >
          <p
            className="text-xs"
            style={{ color: 'var(--text-dimmed)' }}
          >
            Settings are saved automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
