import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'sv';

export interface LanguageConfig {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  sv: { id: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
};

// Translation keys
type TranslationKey =
  // App
  | 'app.title'
  | 'app.subtitle'
  // Sidebar - Building Blocks
  | 'sidebar.buildingBlocks'
  | 'sidebar.source'
  | 'sidebar.sourceDesc'
  | 'sidebar.process'
  | 'sidebar.processDesc'
  | 'sidebar.buffer'
  | 'sidebar.bufferDesc'
  | 'sidebar.inspection'
  | 'sidebar.inspectionDesc'
  | 'sidebar.shipping'
  | 'sidebar.shippingDesc'
  // Sidebar - Controls
  | 'sidebar.controls'
  | 'sidebar.start'
  | 'sidebar.pause'
  | 'sidebar.reset'
  | 'sidebar.speed'
  | 'sidebar.warmup'
  | 'sidebar.warmupOff'
  | 'sidebar.warmupReady'
  | 'sidebar.warmupWarming'
  | 'sidebar.warmupNote'
  | 'sidebar.autoLayout'
  | 'sidebar.exportCsv'
  | 'sidebar.save'
  | 'sidebar.load'
  | 'sidebar.compare'
  // Right Sidebar - Dashboard
  | 'dashboard.title'
  | 'dashboard.live'
  | 'dashboard.kpis'
  | 'dashboard.properties'
  | 'dashboard.analysis'
  | 'dashboard.oee'
  | 'dashboard.availability'
  | 'dashboard.performance'
  | 'dashboard.quality'
  | 'dashboard.throughput'
  | 'dashboard.throughputUnit'
  | 'dashboard.wip'
  | 'dashboard.leadTime'
  | 'dashboard.completed'
  | 'dashboard.generated'
  | 'dashboard.wipOverTime'
  | 'dashboard.bottleneck'
  | 'dashboard.bottleneckDetected'
  | 'dashboard.utilization'
  // Warm-up
  | 'warmup.inProgress'
  | 'warmup.remaining'
  | 'warmup.statsReset'
  | 'warmup.complete'
  // Properties
  | 'properties.title'
  | 'properties.selectNode'
  | 'properties.clickToEdit'
  | 'properties.label'
  | 'properties.cycleTime'
  | 'properties.cycleTimeVariation'
  | 'properties.capacity'
  | 'properties.capacityNote'
  | 'properties.defectRate'
  | 'properties.arrivalInterval'
  | 'properties.maxStorage'
  | 'properties.maxStorageNote'
  | 'properties.liveStats'
  | 'properties.totalProcessed'
  | 'properties.avgUtilization'
  | 'properties.blockedTime'
  // Analysis
  | 'analysis.title'
  | 'analysis.description'
  | 'analysis.analyzeFlow'
  | 'analysis.analyzing'
  | 'analysis.executiveSummary'
  | 'analysis.maxThroughput'
  | 'analysis.totalCycleTime'
  | 'analysis.firstPassYield'
  | 'analysis.suggestions'
  | 'analysis.closeReport'
  | 'analysis.noData'
  // Settings
  | 'settings.theme'
  | 'settings.language'
  | 'settings.preferences';

type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    // App
    'app.title': 'LeanFlow',
    'app.subtitle': 'Manufacturing Simulation',
    // Sidebar - Building Blocks
    'sidebar.buildingBlocks': 'Building Blocks',
    'sidebar.source': 'Source',
    'sidebar.sourceDesc': 'Generates entities',
    'sidebar.process': 'Process',
    'sidebar.processDesc': 'Machine/Workstation',
    'sidebar.buffer': 'Buffer',
    'sidebar.bufferDesc': 'Limited capacity storage',
    'sidebar.inspection': 'Inspection',
    'sidebar.inspectionDesc': 'Quality Check point',
    'sidebar.shipping': 'Shipping',
    'sidebar.shippingDesc': 'Exit point',
    // Sidebar - Controls
    'sidebar.controls': 'Controls',
    'sidebar.start': 'Start',
    'sidebar.pause': 'Pause',
    'sidebar.reset': 'Reset',
    'sidebar.speed': 'Speed',
    'sidebar.warmup': 'Warm-up',
    'sidebar.warmupOff': 'Off',
    'sidebar.warmupReady': 'READY',
    'sidebar.warmupWarming': 'WARMING',
    'sidebar.warmupNote': 'Stats reset after warm-up',
    'sidebar.autoLayout': 'Auto Layout',
    'sidebar.exportCsv': 'Export CSV',
    'sidebar.save': 'Save',
    'sidebar.load': 'Load',
    'sidebar.compare': 'Compare',
    // Right Sidebar - Dashboard
    'dashboard.title': 'Live Metrics',
    'dashboard.live': 'LIVE',
    'dashboard.kpis': 'KPIs',
    'dashboard.properties': 'Properties',
    'dashboard.analysis': 'AI',
    'dashboard.oee': 'Overall Equipment Effectiveness',
    'dashboard.availability': 'Availability',
    'dashboard.performance': 'Performance',
    'dashboard.quality': 'Quality',
    'dashboard.throughput': 'Throughput',
    'dashboard.throughputUnit': 'u/hr',
    'dashboard.wip': 'WIP',
    'dashboard.leadTime': 'Avg Lead Time',
    'dashboard.completed': 'Completed',
    'dashboard.generated': 'Generated',
    'dashboard.wipOverTime': 'WIP Over Time',
    'dashboard.bottleneck': 'Bottleneck',
    'dashboard.bottleneckDetected': 'Bottleneck Detected',
    'dashboard.utilization': 'utilization',
    // Warm-up
    'warmup.inProgress': 'Warm-up in Progress',
    'warmup.remaining': 'remaining',
    'warmup.statsReset': 'Stats will reset after warm-up completes',
    'warmup.complete': 'Warm-up Complete - Stats Recording',
    // Properties
    'properties.title': 'Node Properties',
    'properties.selectNode': 'Select a Node',
    'properties.clickToEdit': 'Click a station to edit properties.',
    'properties.label': 'Label',
    'properties.cycleTime': 'Cycle Time (sec)',
    'properties.cycleTimeVariation': 'Cycle Time Variation (%)',
    'properties.capacity': 'Capacity (Parallel Units)',
    'properties.capacityNote': 'Number of items processed simultaneously.',
    'properties.defectRate': 'Defect Rate (%)',
    'properties.arrivalInterval': 'Arrival Interval (sec)',
    'properties.maxStorage': 'Max Storage Capacity',
    'properties.maxStorageNote': 'Simulates blocking if full.',
    'properties.liveStats': 'Live Statistics',
    'properties.totalProcessed': 'Total processed',
    'properties.avgUtilization': 'Avg Utilization',
    'properties.blockedTime': 'Blocked Time',
    // Analysis
    'analysis.title': 'AI Optimization',
    'analysis.description': 'Use Gemini to analyze your production line layout, identify bottlenecks, and suggest Six Sigma improvements.',
    'analysis.analyzeFlow': 'Analyze Flow',
    'analysis.analyzing': 'Gemini is analyzing your production line...',
    'analysis.executiveSummary': 'Executive Summary',
    'analysis.maxThroughput': 'Max Throughput',
    'analysis.totalCycleTime': 'Total Cycle Time',
    'analysis.firstPassYield': 'First Pass Yield',
    'analysis.suggestions': 'AI Improvement Suggestions',
    'analysis.closeReport': 'Close Report',
    'analysis.noData': 'No analysis data available. Run the simulation to see results.',
    // Settings
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.preferences': 'Preferences',
  },
  sv: {
    // App
    'app.title': 'LeanFlow',
    'app.subtitle': 'Tillverkningssimulering',
    // Sidebar - Building Blocks
    'sidebar.buildingBlocks': 'Byggblock',
    'sidebar.source': 'Källa',
    'sidebar.sourceDesc': 'Genererar enheter',
    'sidebar.process': 'Process',
    'sidebar.processDesc': 'Maskin/Arbetsstation',
    'sidebar.buffer': 'Buffert',
    'sidebar.bufferDesc': 'Begränsad lagringskapacitet',
    'sidebar.inspection': 'Inspektion',
    'sidebar.inspectionDesc': 'Kvalitetskontrollpunkt',
    'sidebar.shipping': 'Leverans',
    'sidebar.shippingDesc': 'Utgångspunkt',
    // Sidebar - Controls
    'sidebar.controls': 'Kontroller',
    'sidebar.start': 'Starta',
    'sidebar.pause': 'Pausa',
    'sidebar.reset': 'Återställ',
    'sidebar.speed': 'Hastighet',
    'sidebar.warmup': 'Uppvärmning',
    'sidebar.warmupOff': 'Av',
    'sidebar.warmupReady': 'KLAR',
    'sidebar.warmupWarming': 'VÄRMER',
    'sidebar.warmupNote': 'Statistik återställs efter uppvärmning',
    'sidebar.autoLayout': 'Auto Layout',
    'sidebar.exportCsv': 'Exportera CSV',
    'sidebar.save': 'Spara',
    'sidebar.load': 'Ladda',
    'sidebar.compare': 'Jämför',
    // Right Sidebar - Dashboard
    'dashboard.title': 'Livemätningar',
    'dashboard.live': 'LIVE',
    'dashboard.kpis': 'KPIer',
    'dashboard.properties': 'Egenskaper',
    'dashboard.analysis': 'AI',
    'dashboard.oee': 'Overall Equipment Effectiveness',
    'dashboard.availability': 'Tillgänglighet',
    'dashboard.performance': 'Prestanda',
    'dashboard.quality': 'Kvalitet',
    'dashboard.throughput': 'Genomströmning',
    'dashboard.throughputUnit': 'e/tim',
    'dashboard.wip': 'PIA',
    'dashboard.leadTime': 'Snitt Ledtid',
    'dashboard.completed': 'Färdiga',
    'dashboard.generated': 'Genererade',
    'dashboard.wipOverTime': 'PIA Över Tid',
    'dashboard.bottleneck': 'Flaskhals',
    'dashboard.bottleneckDetected': 'Flaskhals Upptäckt',
    'dashboard.utilization': 'utnyttjande',
    // Warm-up
    'warmup.inProgress': 'Uppvärmning Pågår',
    'warmup.remaining': 'kvar',
    'warmup.statsReset': 'Statistik återställs efter uppvärmningen',
    'warmup.complete': 'Uppvärmning Klar - Statistik Spelas In',
    // Properties
    'properties.title': 'Nodegenskaper',
    'properties.selectNode': 'Välj en Nod',
    'properties.clickToEdit': 'Klicka på en station för att redigera egenskaper.',
    'properties.label': 'Etikett',
    'properties.cycleTime': 'Cykeltid (sek)',
    'properties.cycleTimeVariation': 'Cykeltidsvariation (%)',
    'properties.capacity': 'Kapacitet (Parallella Enheter)',
    'properties.capacityNote': 'Antal artiklar som bearbetas samtidigt.',
    'properties.defectRate': 'Defektfrekvens (%)',
    'properties.arrivalInterval': 'Ankomstintervall (sek)',
    'properties.maxStorage': 'Max Lagringskapacitet',
    'properties.maxStorageNote': 'Simulerar blockering om full.',
    'properties.liveStats': 'Livestatistik',
    'properties.totalProcessed': 'Totalt bearbetade',
    'properties.avgUtilization': 'Snitt Utnyttjande',
    'properties.blockedTime': 'Blockerad Tid',
    // Analysis
    'analysis.title': 'AI Optimering',
    'analysis.description': 'Använd Gemini för att analysera din produktionslinjens layout, identifiera flaskhalsar och föreslå Six Sigma-förbättringar.',
    'analysis.analyzeFlow': 'Analysera Flöde',
    'analysis.analyzing': 'Gemini analyserar din produktionslinje...',
    'analysis.executiveSummary': 'Sammanfattning',
    'analysis.maxThroughput': 'Max Genomströmning',
    'analysis.totalCycleTime': 'Total Cykeltid',
    'analysis.firstPassYield': 'Första Passutbyte',
    'analysis.suggestions': 'AI Förbättringsförslag',
    'analysis.closeReport': 'Stäng Rapport',
    'analysis.noData': 'Ingen analysdata tillgänglig. Kör simuleringen för att se resultat.',
    // Settings
    'settings.theme': 'Tema',
    'settings.language': 'Språk',
    'settings.preferences': 'Inställningar',
  },
};

interface LanguageContextType {
  language: Language;
  languageConfig: LanguageConfig;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('leanflow-language') as Language;
    return saved && LANGUAGES[saved] ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('leanflow-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (LANGUAGES[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      languageConfig: LANGUAGES[language],
      setLanguage,
      t,
      availableLanguages: Object.values(LANGUAGES)
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
