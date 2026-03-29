import React, { useState, useMemo } from 'react';

// タイプデータ（参考画像のカラーに合わせて調整）
const TYPES = {
  normal: { ja: 'ノーマル', en: 'Normal', color: '#8a8a9a' },
  fire: { ja: 'ほのお', en: 'Fire', color: '#e85040' },
  water: { ja: 'みず', en: 'Water', color: '#4a90d8' },
  electric: { ja: 'でんき', en: 'Electric', color: '#f8c830' },
  grass: { ja: 'くさ', en: 'Grass', color: '#62b840' },
  ice: { ja: 'こおり', en: 'Ice', color: '#70d0d0' },
  fighting: { ja: 'かくとう', en: 'Fighting', color: '#e87830' },
  poison: { ja: 'どく', en: 'Poison', color: '#905898' },
  ground: { ja: 'じめん', en: 'Ground', color: '#a87020' },
  flying: { ja: 'ひこう', en: 'Flying', color: '#6880e0' },
  psychic: { ja: 'エスパー', en: 'Psychic', color: '#e85080' },
  bug: { ja: 'むし', en: 'Bug', color: '#90a820' },
  rock: { ja: 'いわ', en: 'Rock', color: '#a0a0b0' },
  ghost: { ja: 'ゴースト', en: 'Ghost', color: '#6060a0' },
  dragon: { ja: 'ドラゴン', en: 'Dragon', color: '#5868d8' },
  dark: { ja: 'あく', en: 'Dark', color: '#504050' },
  steel: { ja: 'はがね', en: 'Steel', color: '#60a0b0' },
  fairy: { ja: 'フェアリー', en: 'Fairy', color: '#e080d0' },
};

const TYPE_KEYS = Object.keys(TYPES);

// 相性表（攻撃側 → 防御側）
const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const getEffectiveness = (attackType, defenseType) => {
  return TYPE_CHART[attackType]?.[defenseType] ?? 1;
};

const getMultiplierLabel = (multiplier, lang) => {
  if (multiplier === 0) return lang === 'ja' ? '無効' : '×0';
  if (multiplier === 0.25) return '×0.25';
  if (multiplier === 0.5) return '×0.5';
  if (multiplier === 1) return '×1';
  if (multiplier === 2) return '×2';
  if (multiplier === 4) return '×4';
  return `×${multiplier}`;
};

// 斜めカットのタイプボタン
const TypeButton = ({ type, selected, onClick, lang, size = 'normal' }) => {
  const data = TYPES[type];
  const height = size === 'small' ? '30px' : '36px';
  const fontSize = size === 'small' ? '11px' : '13px';
  const cutWidth = size === 'small' ? '14px' : '18px';
  
  return (
    <button
      onClick={() => onClick(type)}
      className={`
        relative flex items-center overflow-hidden rounded-md transition-all duration-200
        ${selected 
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900 scale-105' 
          : 'opacity-85 hover:opacity-100 hover:scale-102'
        }
      `}
      style={{ 
        height,
        backgroundColor: '#4a5568',
      }}
    >
      <div 
        style={{
          width: cutWidth,
          height: '100%',
          background: `linear-gradient(135deg, ${data.color} 50%, transparent 50%)`,
          flexShrink: 0,
        }}
      />
      <span 
        style={{ 
          color: 'white', 
          fontSize,
          fontWeight: 500,
          padding: size === 'small' ? '0 10px 0 6px' : '0 12px 0 8px',
          whiteSpace: 'nowrap',
        }}
      >
        {lang === 'ja' ? data.ja : data.en}
      </span>
    </button>
  );
};

// 結果用のタイプバッジ
const TypeBadge = ({ type, lang }) => {
  const data = TYPES[type];
  return (
    <span
      className="inline-flex items-center rounded overflow-hidden"
      style={{ backgroundColor: '#4a5568', height: '24px' }}
    >
      <div 
        style={{
          width: '10px',
          height: '100%',
          background: `linear-gradient(135deg, ${data.color} 50%, transparent 50%)`,
          flexShrink: 0,
        }}
      />
      <span 
        style={{ 
          color: 'white', 
          fontSize: '11px',
          fontWeight: 500,
          padding: '0 8px 0 5px',
          whiteSpace: 'nowrap',
        }}
      >
        {lang === 'ja' ? data.ja : data.en}
      </span>
    </span>
  );
};

// 結果セクション
const ResultSection = ({ title, types, multiplier, lang }) => {
  if (types.length === 0) return null;
  
  const colorClass = multiplier === 0 ? 'text-gray-400 border-gray-600' 
    : multiplier < 1 ? 'text-blue-400 border-blue-500' 
    : multiplier === 2 ? 'text-green-400 border-green-500' 
    : 'text-red-400 border-red-500';

  return (
    <div className="mb-5">
      <h3 className={`text-sm font-bold mb-3 ${colorClass.split(' ')[0]}`}>
        {getMultiplierLabel(multiplier, lang)} {title}
      </h3>
      <div className={`border-l-2 ${colorClass.split(' ')[1]} pl-4`}>
        <div className="flex flex-wrap gap-2">
          {types.map((typeArr, i) => (
            <div key={i} className="flex items-center gap-1">
              {typeArr.map((type) => (
                <TypeBadge key={type} type={type} lang={lang} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('ja');
  const [mode, setMode] = useState('attack');
  const [selectedType1, setSelectedType1] = useState(null);
  const [selectedType2, setSelectedType2] = useState(null);

  const texts = {
    ja: {
      title: 'ポケモン相性チェッカー',
      subtitle: 'Type Matchup Calculator',
      attack: '攻撃',
      defense: '防御',
      selectType: 'タイプを選択',
      selectType2: '2つ目のタイプ（任意）',
      attackDesc: 'この技タイプで攻撃したとき、相手への効果は？',
      defenseDesc: 'このタイプで受けるとき、相手の技の効果は？',
      results: '相性結果',
      superEffective: '効果抜群',
      ultraEffective: '超効果抜群',
      notVeryEffective: 'いまひとつ',
      reallyNotEffective: '超いまひとつ',
      noEffect: '効果なし',
      clear: 'クリア',
      poweredBy: 'Powered by kumalabo',
    },
    en: {
      title: 'Pokémon Type Checker',
      subtitle: 'タイプ相性チェッカー',
      attack: 'Offense',
      defense: 'Defense',
      selectType: 'Select Type',
      selectType2: 'Second Type (Optional)',
      attackDesc: 'When attacking with this type, how effective is it?',
      defenseDesc: 'When defending as this type, how effective are attacks?',
      results: 'Results',
      superEffective: 'Super Effective',
      ultraEffective: 'Ultra Effective',
      notVeryEffective: 'Not Very Effective',
      reallyNotEffective: 'Really Not Effective',
      noEffect: 'No Effect',
      clear: 'Clear',
      poweredBy: 'Powered by kumalabo',
    }
  };

  const t = texts[lang];

  const attackResults = useMemo(() => {
    if (!selectedType1) return { x4: [], x2: [], x1: [], x05: [], x025: [], x0: [] };
    
    const results = { x4: [], x2: [], x1: [], x05: [], x025: [], x0: [] };
    
    TYPE_KEYS.forEach(defType1 => {
      TYPE_KEYS.forEach(defType2 => {
        if (defType2 < defType1) return;
        
        const isSingle = defType1 === defType2;
        const eff1 = getEffectiveness(selectedType1, defType1);
        const eff2 = isSingle ? 1 : getEffectiveness(selectedType1, defType2);
        const combined = eff1 * eff2;
        
        const typeArr = isSingle ? [defType1] : [defType1, defType2];
        
        if (combined === 4) results.x4.push(typeArr);
        else if (combined === 2) results.x2.push(typeArr);
        else if (combined === 0.5) results.x05.push(typeArr);
        else if (combined === 0.25) results.x025.push(typeArr);
        else if (combined === 0) results.x0.push(typeArr);
      });
    });
    
    return results;
  }, [selectedType1]);

  const defenseResults = useMemo(() => {
    if (!selectedType1) return { x4: [], x2: [], x1: [], x05: [], x025: [], x0: [] };
    
    const results = { x4: [], x2: [], x1: [], x05: [], x025: [], x0: [] };
    
    TYPE_KEYS.forEach(atkType => {
      const eff1 = getEffectiveness(atkType, selectedType1);
      const eff2 = selectedType2 ? getEffectiveness(atkType, selectedType2) : 1;
      const combined = eff1 * eff2;
      
      if (combined === 4) results.x4.push([atkType]);
      else if (combined === 2) results.x2.push([atkType]);
      else if (combined === 0.5) results.x05.push([atkType]);
      else if (combined === 0.25) results.x025.push([atkType]);
      else if (combined === 0) results.x0.push([atkType]);
    });
    
    return results;
  }, [selectedType1, selectedType2]);

  const results = mode === 'attack' ? attackResults : defenseResults;

  const handleType1Click = (type) => {
    setSelectedType1(selectedType1 === type ? null : type);
    if (selectedType1 === type) setSelectedType2(null);
  };

  const handleType2Click = (type) => {
    if (type === selectedType1) return;
    setSelectedType2(selectedType2 === type ? null : type);
  };

  const clearSelection = () => {
    setSelectedType1(null);
    setSelectedType2(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-blue-400">
                {t.title}
              </h1>
              <p className="text-xs text-gray-500">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                {lang === 'ja' ? 'EN' : 'JA'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* モード切り替え */}
        <div className="flex rounded-lg overflow-hidden mb-6 bg-gray-800 border border-gray-700">
          <button
            onClick={() => { setMode('attack'); setSelectedType2(null); }}
            className={`flex-1 py-3 font-bold transition-colors ${
              mode === 'attack'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            ⚔️ {t.attack}
          </button>
          <button
            onClick={() => setMode('defense')}
            className={`flex-1 py-3 font-bold transition-colors ${
              mode === 'defense'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            🛡️ {t.defense}
          </button>
        </div>

        {/* タイプ選択 */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-200">{t.selectType}</h2>
            {selectedType1 && (
              <button
                onClick={clearSelection}
                className="text-sm px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                {t.clear}
              </button>
            )}
          </div>
          <p className="text-sm mb-4 text-gray-500">
            {mode === 'attack' ? t.attackDesc : t.defenseDesc}
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
            {TYPE_KEYS.map(type => (
              <TypeButton
                key={type}
                type={type}
                selected={selectedType1 === type}
                onClick={handleType1Click}
                lang={lang}
              />
            ))}
          </div>
          
          {mode === 'defense' && selectedType1 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="font-medium mb-3 text-sm text-gray-400">
                {t.selectType2}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TYPE_KEYS.filter(tp => tp !== selectedType1).map(type => (
                  <TypeButton
                    key={type}
                    type={type}
                    selected={selectedType2 === type}
                    onClick={handleType2Click}
                    lang={lang}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 結果 */}
        {selectedType1 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
            <h2 className="font-bold mb-4 text-gray-200">{t.results}</h2>
            
            <ResultSection title={t.ultraEffective} types={results.x4} multiplier={4} lang={lang} />
            <ResultSection title={t.superEffective} types={results.x2} multiplier={2} lang={lang} />
            <ResultSection title={t.notVeryEffective} types={results.x05} multiplier={0.5} lang={lang} />
            <ResultSection title={t.reallyNotEffective} types={results.x025} multiplier={0.25} lang={lang} />
            <ResultSection title={t.noEffect} types={results.x0} multiplier={0} lang={lang} />
          </div>
        )}

        {/* 広告スペース */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6 text-center">
          <div className="py-6 text-gray-600 text-sm">
            {/* AdSense広告コードをここに挿入 */}
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <a 
            href="https://kumalabos.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t.poweredBy}
          </a>
          <p className="text-xs mt-2 text-gray-600">
            © 2026 kumalabos.com
          </p>
        </div>
      </footer>
    </div>
  );
}
