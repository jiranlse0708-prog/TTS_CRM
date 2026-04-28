import { useState } from 'react';
import { Plus, User, ArrowRight, ChevronDown, Download, Settings, Search, Pencil, Trash2, Check, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Message {
  type: 'user' | 'ai';
  content: string;
  hasDataTable?: boolean;
  hasDataChart?: boolean;
  hasZeroResults?: boolean;
}

interface Term {
  id: number;
  name: string;
  definition: string;
  synonyms: string;
}

interface Formula {
  id: number;
  name: string;
  formula: string;
}

export default function App() {
  // ── 채팅 상태 ──────────────────────────────────────────
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSql, setShowSql] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── 화면 전환 ──────────────────────────────────────────
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');

  // ── 맞춤 설정 상태 ────────────────────────────────────
  const [settingsTab, setSettingsTab] = useState<'business' | 'style'>('business');
  const [businessSubTab, setBusinessSubTab] = useState<'terms' | 'formulas'>('terms');
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = true; // 프로토타입: 현재 사용자를 관리자로 가정

  // 용어 정의
  const [terms, setTerms] = useState<Term[]>([
    { id: 1, name: '업그레이드', definition: '기존 제품을 상위 등급 제품으로 재구매한 경우', synonyms: '버전업' },
    { id: 2, name: '활성화 라이선스', definition: '기간이 만료되지 않은 정상 상태의 라이선스', synonyms: '유효 라이선스' },
  ]);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newTerm, setNewTerm] = useState({ name: '', definition: '', synonyms: '' });
  const [editingTermId, setEditingTermId] = useState<number | null>(null);
  const [editingTermData, setEditingTermData] = useState<Omit<Term, 'id'>>({ name: '', definition: '', synonyms: '' });

  // 계산식
  const [formulas, setFormulas] = useState<Formula[]>([
    { id: 1, name: '전월 대비 매출', formula: '현월 매출 − 전월 매출' },
    { id: 2, name: '증감률', formula: '(현월 값 − 전월 값) / 전월 값 × 100' },
  ]);
  const [showAddFormula, setShowAddFormula] = useState(false);
  const [newFormula, setNewFormula] = useState({ name: '', formula: '' });
  const [editingFormulaId, setEditingFormulaId] = useState<number | null>(null);
  const [editingFormulaData, setEditingFormulaData] = useState<Omit<Formula, 'id'>>({ name: '', formula: '' });

  // 답변 스타일
  const [styleText, setStyleText] = useState('');
  const [styleSaved, setStyleSaved] = useState(false);

  // ── 채팅 데이터 ────────────────────────────────────────
  const suggestions = [
    '지난 한달 간 PC필터 판매된 리스트 좀 보여줘',
    '지난달 제품별 판매 비중 차트로 보여줘',
    '오늘 날씨 어때?',
    '1988년 1월 PC필터 판매 리스트',
  ];

  const recommendedQuestions = [
    { title: '이번 달 제품별 매출 현황', query: '이번 달 제품별 매출 현황을 보여줘' },
    { title: '최근 계약 고객사 목록', query: '최근 30일 내 계약한 고객사 목록 보여줘' },
    { title: '만료 예정 라이선스 목록', query: '30일 내 만료 예정인 라이선스 목록 보여줘' },
    { title: '월별 신규 계약 추이', query: '최근 6개월 월별 신규 계약 건수 보여줘' },
    { title: '지역별 매출 현황', query: '지역별 이번 달 매출 현황 보여줘' },
    { title: '제품 판매 비중 분석', query: '지난달 제품별 판매 비중을 차트로 보여줘' },
  ];

  const chatHistory = [
    '지난 달 상품별 및 지역별...',
    '제품별 매출 비중 분석',
    '영업 담당자별 계약 실적',
    '클라우드 제품 판매 추이',
  ];

  const salesData = [
    ['SO-20260211-02','2026-02-11','판매','PC필터','CUST-00187','태성시스템'],
    ['SO-20260210-03','2026-02-10','판매','PC필터','CUST-00042','한빛테크'],
    ['SO-20260209-01','2026-02-09','판매','PC필터','CUST-00311','네오데이터'],
    ['SO-20260207-04','2026-02-07','판매','PC필터','CUST-00205','라온정보'],
    ['SO-20260205-01','2026-02-05','판매','PC필터','CUST-00096','미래솔루션'],
    ['SO-20260202-02','2026-02-02','판매','PC필터','CUST-00408','이노가드'],
    ['SO-20260130-03','2026-01-30','판매','PC필터','CUST-00114','코어링크'],
    ['SO-20260128-02','2026-01-28','판매','PC필터','CUST-00073','새림정보'],
    ['SO-20260120-01','2026-01-20','판매','PC필터','CUST-00277','에이스IT'],
    ['SO-20260115-04','2026-01-15','판매','PC필터','CUST-00158','지앤에스'],
  ];

  const productStats = [
    { rank: 1, name: 'PCFILTER', sales: '350건', ratio: '35%' },
    { rank: 2, name: 'WEBFILTER', sales: '200건', ratio: '20%' },
    { rank: 3, name: 'SERVERFILTER', sales: '150건', ratio: '15%' },
    { rank: 4, name: 'WEBSCAN', sales: '100건', ratio: '10%' },
    { rank: '5~9', name: '기타 5개 제품', sales: '200건', ratio: '20%' },
  ];

  const chartData = [
    { name: 'PCFILTER', value: 35, color: '#534AB7' },
    { name: 'WEBFILTER', value: 20, color: '#AFA9EC' },
    { name: 'SERVERFILTER', value: 15, color: '#7F77DD' },
    { name: 'WEBSCAN', value: 10, color: '#CECBF6' },
    { name: '기타', value: 20, color: '#EEEDFE' },
  ];

  const PAGE_SIZE = 10;
  const TOTAL = 86;
  const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

  // ── 채팅 핸들러 ────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const dataKeywords = ['목록', '리스트', '추출'];
      const hasDataKeyword = dataKeywords.some(keyword => message.includes(keyword));
      const crmKeywords = ['고객사', '영업', '판매', '계약', '라이선스', '목록', '리스트', '추출', '데이터', '매출', '제품', '상품', '실적', '담당자', '지역', '비중', '분석', 'CRM', 'PC필터', '클라우드'];
      const isCrmRelated = crmKeywords.some(keyword => message.includes(keyword));
      const isZeroCase = message.includes('1988년 1월') || message.includes('1988년1월');

      if (!isCrmRelated) {
        setMessages([
          { type: 'user', content: message },
          { type: 'ai', content: '저는 CRM에 있는 데이터와 관련된 질문을 전문으로 해요.\n해당 내용은 CRM 데이터에서 확인이 어려워요.\n\n고객사, 영업, 판매, 계약, 라이선스 등 궁금한 데이터가 있으시면 언제든 편하게 물어봐주세요 😊', hasDataTable: false, hasDataChart: false }
        ]);
      } else if (isZeroCase && hasDataKeyword) {
        setMessages([
          { type: 'user', content: message },
          { type: 'ai', content: '데이터를 조회해 봤는데, 조건에 해당하는 결과가 없어요.\n조건을 변경해서 다시 질문해보세요!', hasDataTable: true, hasDataChart: false, hasZeroResults: true }
        ]);
      } else if (hasDataKeyword) {
        setMessages([
          { type: 'user', content: message },
          { type: 'ai', content: '지난 한달 간 PC필터 판매 수는 총 86건이에요.', hasDataTable: true, hasDataChart: false }
        ]);
      } else {
        setMessages([
          { type: 'user', content: message },
          { type: 'ai', content: '지난달 제품별 판매 비중이에요. PCFILTER가 35%로 가장 높았어요.', hasDataTable: false, hasDataChart: true }
        ]);
      }
      setMessage('');
      setCurrentPage(1);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleRecommendedClick = (query: string) => {
    setMessage(query);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      if (i === 1 || i === TOTAL_PAGES || Math.abs(i - currentPage) <= 1) {
        pages.push(
          <span key={i} onClick={() => setCurrentPage(i)}
            className={`cursor-pointer px-1.5 py-0.5 rounded ${i === currentPage ? 'text-[#1a1a1a] font-medium' : 'text-[#aaa]'}`}>
            {i}
          </span>
        );
      } else if (Math.abs(i - currentPage) === 2) {
        pages.push(<span key={`ellipsis-${i}`} className="text-[#aaa]">...</span>);
      }
    }
    return (
      <div className="flex items-center gap-1.5 text-[12px]">
        {pages}
        <span onClick={() => setCurrentPage(Math.min(currentPage + 1, TOTAL_PAGES))} className="cursor-pointer text-[#aaa] px-1">&gt;</span>
      </div>
    );
  };

  // ── 맞춤 설정 핸들러 ──────────────────────────────────
  const filteredTerms = terms.filter(t =>
    !searchQuery || t.name.includes(searchQuery) || t.definition.includes(searchQuery) || t.synonyms.includes(searchQuery)
  );

  const filteredFormulas = formulas.filter(f =>
    !searchQuery || f.name.includes(searchQuery) || f.formula.includes(searchQuery)
  );

  const handleAddTerm = () => {
    if (newTerm.name.trim() && newTerm.definition.trim()) {
      setTerms(prev => [...prev, { id: Date.now(), ...newTerm }]);
      setNewTerm({ name: '', definition: '', synonyms: '' });
      setShowAddTerm(false);
    }
  };

  const handleStartEditTerm = (term: Term) => {
    setEditingTermId(term.id);
    setEditingTermData({ name: term.name, definition: term.definition, synonyms: term.synonyms });
    setShowAddTerm(false);
  };

  const handleSaveEditTerm = () => {
    if (editingTermId !== null) {
      setTerms(prev => prev.map(t => t.id === editingTermId ? { id: t.id, ...editingTermData } : t));
      setEditingTermId(null);
    }
  };

  const handleDeleteTerm = (id: number) => {
    setTerms(prev => prev.filter(t => t.id !== id));
  };

  const handleAddFormula = () => {
    if (newFormula.name.trim() && newFormula.formula.trim()) {
      setFormulas(prev => [...prev, { id: Date.now(), ...newFormula }]);
      setNewFormula({ name: '', formula: '' });
      setShowAddFormula(false);
    }
  };

  const handleStartEditFormula = (formula: Formula) => {
    setEditingFormulaId(formula.id);
    setEditingFormulaData({ name: formula.name, formula: formula.formula });
    setShowAddFormula(false);
  };

  const handleSaveEditFormula = () => {
    if (editingFormulaId !== null) {
      setFormulas(prev => prev.map(f => f.id === editingFormulaId ? { id: f.id, ...editingFormulaData } : f));
      setEditingFormulaId(null);
    }
  };

  const handleDeleteFormula = (id: number) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveStyle = () => {
    setStyleSaved(true);
    setTimeout(() => setStyleSaved(false), 2000);
  };

  const openSettings = () => {
    setCurrentView('settings');
    setSearchQuery('');
    setShowAddTerm(false);
    setShowAddFormula(false);
    setEditingTermId(null);
    setEditingFormulaId(null);
  };

  // ── 렌더 ──────────────────────────────────────────────
  return (
    <div className="h-screen p-4 bg-[#f5f5f5]" style={{ fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <div className="bg-white rounded-xl border-[0.5px] border-[#e0e0e0] overflow-hidden flex h-[calc(100vh-32px)]">

        {/* ── 사이드바 ── */}
        <div className="w-[200px] border-r-[0.5px] border-[#e0e0e0] p-4 flex flex-col gap-3 flex-shrink-0">
          <button
            onClick={() => { setMessages([]); setCurrentView('chat'); }}
            className="w-full text-left px-3 py-2 text-[13px] rounded-lg border-[0.5px] border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            <span>새 채팅</span>
          </button>

          <div className="text-[11px] text-[#aaa] px-1">채팅 목록</div>

          <div className="flex flex-col gap-1">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                onClick={() => setCurrentView('chat')}
                className={`text-[12px] text-[#555] px-2 py-1 rounded-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors ${
                  index === 0 && messages.length > 0 && currentView === 'chat' ? 'bg-[#f5f5f5]' : ''
                }`}
              >
                {chat}
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* 맞춤 설정 버튼 */}
          <button
            onClick={() => currentView === 'settings' ? setCurrentView('chat') : openSettings()}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'settings'
                ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                : 'text-[#555] hover:bg-[#f5f5f5]'
            }`}
          >
            <Settings size={14} />
            <span>맞춤 설정</span>
          </button>

          {/* 사용자 프로필 */}
          <div className="border-t-[0.5px] border-[#e0e0e0] pt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border-[0.5px] border-[#ddd] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[#888780]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-medium text-[#1a1a1a] m-0 whitespace-nowrap overflow-hidden text-ellipsis">이세은</p>
              <p className="text-[11px] text-[#aaa] m-0">seeun0708</p>
            </div>
          </div>
        </div>

        {/* ── 메인 영역 ── */}
        {currentView === 'settings' ? (

          /* ───── 맞춤 설정 뷰 ───── */
          <div className="flex-1 flex min-w-0">

            {/* 서브 메뉴 */}
            <div className="w-[168px] border-r-[0.5px] border-[#e0e0e0] p-3 flex flex-col gap-1 flex-shrink-0">
              <div className="text-[13px] font-medium text-[#555] px-2 py-1 mb-1">설정</div>
              <button
                onClick={() => { setSettingsTab('business'); setSearchQuery(''); setShowAddTerm(false); setShowAddFormula(false); setEditingTermId(null); setEditingFormulaId(null); }}
                className={`text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
                  settingsTab === 'business' ? 'bg-[#EEEDFE] text-[#534AB7] font-medium' : 'text-[#555] hover:bg-[#f5f5f5]'
                }`}
              >
                비즈니스 공통 설정
              </button>
              <button
                onClick={() => setSettingsTab('style')}
                className={`text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
                  settingsTab === 'style' ? 'bg-[#EEEDFE] text-[#534AB7] font-medium' : 'text-[#555] hover:bg-[#f5f5f5]'
                }`}
              >
                개인 맞춤 설정
              </button>
            </div>

            {/* 설정 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-6 min-w-0">

              {settingsTab === 'business' ? (
                /* 비즈니스 공통 설정 */
                <div className="max-w-[720px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[16px] font-semibold text-[#1a1a1a]">비즈니스 공통 설정</h2>
                    <span className="text-[11px] px-[7px] py-[2px] rounded-[10px] bg-[#f5f5f5] text-[#555]">관리자 전용</span>
                  </div>
                  <p className="text-[13px] text-[#888780] mb-5">사내 기준을 설정하면 비즈니스 문맥을 이해하여 더 정확한 답변을 제공합니다. 등록된 설정은 모든 사용자에게 동일하게 적용됩니다.</p>

                  {!isAdmin && (
                    <div className="mb-4 px-3 py-2 bg-[#f5f5f5] rounded-lg text-[12px] text-[#888780]">
                      조회만 가능합니다. 등록·수정·삭제는 관리자 권한이 필요해요.
                    </div>
                  )}

                  {/* 서브탭 */}
                  <div className="flex gap-0 mb-5 border-b-[0.5px] border-[#e0e0e0]">
                    {(['terms', 'formulas'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => { setBusinessSubTab(tab); setSearchQuery(''); setShowAddTerm(false); setShowAddFormula(false); setEditingTermId(null); setEditingFormulaId(null); }}
                        className={`px-4 py-2 text-[13px] transition-colors border-b-2 -mb-[0.5px] ${
                          businessSubTab === tab
                            ? 'border-[#534AB7] text-[#534AB7] font-medium'
                            : 'border-transparent text-[#888780] hover:text-[#555]'
                        }`}
                      >
                        {tab === 'terms' ? '용어 정의' : '계산식'}
                      </button>
                    ))}
                  </div>

                  {businessSubTab === 'terms' ? (
                    /* 용어 정의 */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="용어 검색"
                            className="w-full pl-8 pr-3 py-1.5 text-[13px] border-[0.5px] border-[#e0e0e0] rounded-lg outline-none focus:border-[#534AB7] transition-colors"
                          />
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => { setShowAddTerm(true); setEditingTermId(null); setNewTerm({ name: '', definition: '', synonyms: '' }); }}
                            className="px-3 py-1.5 text-[13px] bg-[#534AB7] text-white rounded-lg hover:bg-[#4239a0] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Plus size={13} />추가
                          </button>
                        )}
                      </div>

                      <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                        <table className="w-full border-collapse text-[13px]">
                          <thead>
                            <tr className="bg-[#f5f5f5]">
                              <th className="px-4 py-2.5 text-left font-medium border-b-[0.5px] border-[#e0e0e0] w-[150px]">용어명</th>
                              <th className="px-4 py-2.5 text-left font-medium border-b-[0.5px] border-[#e0e0e0]">정의</th>
                              <th className="px-4 py-2.5 text-left font-medium border-b-[0.5px] border-[#e0e0e0] w-[150px]">동의어·약어</th>
                              {isAdmin && <th className="px-4 py-2.5 text-center font-medium border-b-[0.5px] border-[#e0e0e0] w-[72px]">작업</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {/* 추가 행 */}
                            {showAddTerm && (
                              <tr className="bg-[#F5F4FE]">
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <input autoFocus value={newTerm.name} onChange={e => setNewTerm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="용어명 *"
                                    className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                </td>
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <input value={newTerm.definition} onChange={e => setNewTerm(p => ({ ...p, definition: e.target.value }))}
                                    placeholder="정의 *"
                                    className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                </td>
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <input value={newTerm.synonyms} onChange={e => setNewTerm(p => ({ ...p, synonyms: e.target.value }))}
                                    placeholder="동의어·약어"
                                    className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                </td>
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={handleAddTerm} className="p-1 text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Check size={14} /></button>
                                    <button onClick={() => { setShowAddTerm(false); setNewTerm({ name: '', definition: '', synonyms: '' }); }} className="p-1 text-[#aaa] hover:bg-[#f5f5f5] rounded transition-colors"><X size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {filteredTerms.map((term, i) =>
                              editingTermId === term.id ? (
                                /* 수정 행 */
                                <tr key={term.id} className="bg-[#F5F4FE]">
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <input value={editingTermData.name} onChange={e => setEditingTermData(p => ({ ...p, name: e.target.value }))}
                                      className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                  </td>
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <input value={editingTermData.definition} onChange={e => setEditingTermData(p => ({ ...p, definition: e.target.value }))}
                                      className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                  </td>
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <input value={editingTermData.synonyms} onChange={e => setEditingTermData(p => ({ ...p, synonyms: e.target.value }))}
                                      className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                  </td>
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={handleSaveEditTerm} className="p-1 text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Check size={14} /></button>
                                      <button onClick={() => setEditingTermId(null)} className="p-1 text-[#aaa] hover:bg-[#f5f5f5] rounded transition-colors"><X size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                /* 일반 행 */
                                <tr key={term.id} className={i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}>
                                  <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0] font-medium">{term.name}</td>
                                  <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0] text-[#555]">{term.definition}</td>
                                  <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0] text-[#888780]">{term.synonyms}</td>
                                  {isAdmin && (
                                    <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0]">
                                      <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => handleStartEditTerm(term)} className="p-1 text-[#ccc] hover:text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Pencil size={13} /></button>
                                        <button onClick={() => handleDeleteTerm(term.id)} className="p-1 text-[#ccc] hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} /></button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              )
                            )}

                            {filteredTerms.length === 0 && !showAddTerm && (
                              <tr>
                                <td colSpan={isAdmin ? 4 : 3} className="px-4 py-10 text-center text-[13px] text-[#aaa]">
                                  {searchQuery ? '검색 결과가 없어요.' : '등록된 용어가 없어요.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* 계산식 */
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="계산식 검색"
                            className="w-full pl-8 pr-3 py-1.5 text-[13px] border-[0.5px] border-[#e0e0e0] rounded-lg outline-none focus:border-[#534AB7] transition-colors"
                          />
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => { setShowAddFormula(true); setEditingFormulaId(null); setNewFormula({ name: '', formula: '' }); }}
                            className="px-3 py-1.5 text-[13px] bg-[#534AB7] text-white rounded-lg hover:bg-[#4239a0] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Plus size={13} />추가
                          </button>
                        )}
                      </div>

                      <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                        <table className="w-full border-collapse text-[13px]">
                          <thead>
                            <tr className="bg-[#f5f5f5]">
                              <th className="px-4 py-2.5 text-left font-medium border-b-[0.5px] border-[#e0e0e0] w-[200px]">지표명</th>
                              <th className="px-4 py-2.5 text-left font-medium border-b-[0.5px] border-[#e0e0e0]">계산식</th>
                              {isAdmin && <th className="px-4 py-2.5 text-center font-medium border-b-[0.5px] border-[#e0e0e0] w-[72px]">작업</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {showAddFormula && (
                              <tr className="bg-[#F5F4FE]">
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <input autoFocus value={newFormula.name} onChange={e => setNewFormula(p => ({ ...p, name: e.target.value }))}
                                    placeholder="지표명 *"
                                    className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                </td>
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <input value={newFormula.formula} onChange={e => setNewFormula(p => ({ ...p, formula: e.target.value }))}
                                    placeholder="계산식 *"
                                    className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                </td>
                                <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={handleAddFormula} className="p-1 text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Check size={14} /></button>
                                    <button onClick={() => { setShowAddFormula(false); setNewFormula({ name: '', formula: '' }); }} className="p-1 text-[#aaa] hover:bg-[#f5f5f5] rounded transition-colors"><X size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {filteredFormulas.map((formula, i) =>
                              editingFormulaId === formula.id ? (
                                <tr key={formula.id} className="bg-[#F5F4FE]">
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <input value={editingFormulaData.name} onChange={e => setEditingFormulaData(p => ({ ...p, name: e.target.value }))}
                                      className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                  </td>
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <input value={editingFormulaData.formula} onChange={e => setEditingFormulaData(p => ({ ...p, formula: e.target.value }))}
                                      className="w-full px-2 py-1 text-[13px] border-[0.5px] border-[#D4D2F9] rounded outline-none focus:border-[#534AB7]" />
                                  </td>
                                  <td className="px-3 py-2 border-b-[0.5px] border-[#e0e0e0]">
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={handleSaveEditFormula} className="p-1 text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Check size={14} /></button>
                                      <button onClick={() => setEditingFormulaId(null)} className="p-1 text-[#aaa] hover:bg-[#f5f5f5] rounded transition-colors"><X size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                <tr key={formula.id} className={i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}>
                                  <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0] font-medium">{formula.name}</td>
                                  <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0] text-[#555]">{formula.formula}</td>
                                  {isAdmin && (
                                    <td className="px-4 py-2.5 border-b-[0.5px] border-[#e0e0e0]">
                                      <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => handleStartEditFormula(formula)} className="p-1 text-[#ccc] hover:text-[#534AB7] hover:bg-[#EEEDFE] rounded transition-colors"><Pencil size={13} /></button>
                                        <button onClick={() => handleDeleteFormula(formula.id)} className="p-1 text-[#ccc] hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} /></button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              )
                            )}

                            {filteredFormulas.length === 0 && !showAddFormula && (
                              <tr>
                                <td colSpan={isAdmin ? 3 : 2} className="px-4 py-10 text-center text-[13px] text-[#aaa]">
                                  {searchQuery ? '검색 결과가 없어요.' : '등록된 계산식이 없어요.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 개인 맞춤 설정 */
                <div className="max-w-[600px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[16px] font-semibold text-[#1a1a1a]">개인 맞춤 설정</h2>
                  </div>
                  <p className="text-[13px] text-[#888780] mb-5">개인이 선호하는 답변 스타일을 설정합니다. 큐피드AI의 기본 원칙 내에서 본인 계정의 모든 대화에 반영됩니다.</p>

                  <textarea
                    value={styleText}
                    onChange={e => { if (e.target.value.length <= 2000) { setStyleText(e.target.value); setStyleSaved(false); } }}
                    placeholder={"예시)\n- 모든 금액은 백만 원 단위로 표시해주세요.\n- 소수점은 두 번째 자리에서 반올림해주세요.\n- 날짜는 YYYY년 M월 형식으로 표기합니다.\n- 10줄 이내 분량으로 자세하게 풀어서 설명해주세요."}
                    className="w-full h-[220px] px-4 py-3 text-[13px] border-[0.5px] border-[#e0e0e0] rounded-lg outline-none focus:border-[#534AB7] transition-colors resize-none leading-relaxed mb-2"
                  />

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[12px] text-[#aaa]">{styleText.length.toLocaleString()} / 2,000자</span>
                    <button
                      onClick={handleSaveStyle}
                      className={`px-4 py-1.5 text-[13px] rounded-lg transition-colors ${
                        styleSaved ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#534AB7] text-white hover:bg-[#4239a0]'
                      }`}
                    >
                      {styleSaved ? '저장됨 ✓' : '저장'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-[#f5f5f5] rounded-lg text-[12px] text-[#888780] leading-relaxed">
                    <p className="font-medium text-[#555] mb-1">등록 예시 항목</p>
                    <p>금액 단위, 소수점 반올림, 날짜 표기 형식, 답변 톤·어조 등을 자유롭게 입력하세요.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        ) : (

          /* ───── 채팅 뷰 ───── */
          <div className="flex-1 flex flex-col min-w-0">

            {/* 헤더 */}
            <div className="px-6 py-[14px] border-b-[0.5px] border-[#e0e0e0] flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L8.8 5.5L12 5L9.5 7.5L11 11L8 9L5 11L6.5 7.5L4 5L7.2 5.5Z" fill="#534AB7"/>
                  <path d="M13 1L13.4 2.6L15 3L13.4 3.4L13 5L12.6 3.4L11 3L12.6 2.6Z" fill="#AFA9EC"/>
                  <path d="M3 11L3.3 12.3L4.5 12.5L3.3 12.7L3 14L2.7 12.7L1.5 12.5L2.7 12.3Z" fill="#AFA9EC"/>
                </svg>
              </div>
              <span className="text-[15px] font-medium text-[#1a1a1a]">AI 큐피드</span>
              <span className="text-[11px] px-[7px] py-[2px] rounded-[10px] bg-[#FAC775] text-[#633806]">BETA</span>
            </div>

            {messages.length === 0 ? (
              /* 웰컴 화면 */
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <path d="M16 4L17.6 11L24 10L19 15L22 22L16 18L10 22L13 15L8 10L14.4 11Z" fill="#534AB7"/>
                      <path d="M26 3L26.7 5.8L29.5 6L26.7 6.2L26 9L25.3 6.2L22.5 6L25.3 5.8Z" fill="#AFA9EC"/>
                      <path d="M6 22L6.5 24.3L8.5 24.5L6.5 24.7L6 27L5.5 24.7L3.5 24.5L5.5 24.3Z" fill="#AFA9EC"/>
                    </svg>
                  </div>
                  <p className="text-[16px] font-medium text-[#1a1a1a] mb-2">안녕하세요. CRM 데이터 전문가 큐피드입니다.</p>
                  <p className="text-[13px] text-[#555] mb-1"><span className="text-[#534AB7] font-medium">Query</span>는 제가 작성할게요.</p>
                  <p className="text-[13px] text-[#555]">원하는 데이터를 <span className="text-[#534AB7] font-medium">Speed</span>하게 전해드려요.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[560px]">
                  <div className="border-[0.5px] border-[#ddd] rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-[#534AB7] transition-colors">
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="궁금한 데이터를 물어보세요."
                      className="flex-1 border-none outline-none text-[13px] bg-transparent text-[#1a1a1a] placeholder:text-[#aaa]" />
                    <button type="submit" className="w-7 h-7 rounded-full bg-[#534AB7] hover:bg-[#4239a0] transition-colors flex items-center justify-center flex-shrink-0">
                      <ArrowRight size={14} className="text-white" />
                    </button>
                  </div>
                </form>

                <div className="w-full max-w-[560px] grid grid-cols-2 gap-2">
                  {recommendedQuestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRecommendedClick(item.query)}
                      className="text-left px-4 py-5 rounded-xl bg-white border-[0.5px] border-[#e8e8e8] hover:border-[#534AB7] hover:text-[#534AB7] transition-colors text-[12px] text-[#aaa] leading-snug h-[80px] flex items-center"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* 채팅 메시지 */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-[#EEEDFE] rounded-xl px-3.5 py-2.5 text-[13px] text-[#3C3489] max-w-[70%]">{msg.content}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {(msg.hasDataTable || msg.hasDataChart) && (
                          <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                            <div onClick={() => setShowSql(!showSql)}
                              className="px-3.5 py-2 flex items-center justify-between cursor-pointer bg-[#f5f5f5] hover:bg-[#eeeeee] transition-colors">
                              <span className="text-[12px] text-[#555]">SQL문 보기</span>
                              <ChevronDown size={12} className={`text-[#888780] transition-transform ${showSql ? 'rotate-180' : ''}`} />
                            </div>
                            {showSql && (
                              <div className="px-3.5 py-3 bg-[#2C2C2A] border-t-[0.5px] border-[#e0e0e0]">
                                <pre className="m-0 text-[11px] text-[#D3D1C7] font-mono leading-relaxed whitespace-pre-wrap">
{msg.hasDataTable
  ? `SELECT\n  o.order_id,\n  o.sale_date,\n  o.sale_type,\n  p.product_name,\n  o.customer_id,\n  c.customer_name\nFROM sales_order o\nJOIN sales_order_item oi\n  ON oi.order_id = o.order_id`
  : `SELECT\n  p.product_name,\n  SUM(s.quantity) AS total_sales_count,\n  ROUND(SUM(s.quantity) * 100.0\n    / SUM(SUM(s.quantity)) OVER(), 2\n  ) AS sales_ratio_percent\nFROM sales s\nJOIN products p\n  ON s.product_id = p.product_id`}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-[13px] text-[#1a1a1a] leading-relaxed whitespace-pre-line">
                          {msg.hasZeroResults ? (
                            <>데이터를 조회해 봤는데, <strong>조건에 해당하는 결과가 없어요.</strong><br />조건을 변경해서 다시 질문해보세요!</>
                          ) : msg.hasDataTable ? (
                            msg.content.split('86건').map((part, i, arr) =>
                              i < arr.length - 1 ? <span key={i}>{part}<strong>86건</strong></span> : part
                            )
                          ) : msg.hasDataChart ? (
                            msg.content.split('PCFILTER').map((part, i, arr) =>
                              i < arr.length - 1 ? <span key={i}>{part}<strong>PCFILTER</strong></span> : part
                            )
                          ) : msg.content}
                        </div>

                        {msg.hasDataTable && !msg.hasZeroResults && (
                          <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                            <div className="px-3.5 py-2 flex items-center justify-end border-b-[0.5px] border-[#e0e0e0]">
                              <button className="text-[11px] px-2.5 py-1 flex items-center gap-1 border-[0.5px] border-[#e0e0e0] rounded-md bg-white hover:bg-[#f5f5f5] transition-colors">
                                <Download size={12} className="text-[#555]" />CSV 다운로드
                              </button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-[12px]">
                                <thead>
                                  <tr className="bg-[#f5f5f5]">
                                    {['order_id','sale_date','sale_type','product_name','customer_id','customer_name'].map(h => (
                                      <th key={h} className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {salesData.map((row, i) => (
                                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}>
                                      {row.map((cell, j) => (
                                        <td key={j} className="px-3 py-1.5 border-b-[0.5px] border-[#e0e0e0]">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="px-3.5 py-2 border-t-[0.5px] border-[#e0e0e0] flex items-center justify-between">
                              <span className="text-[11px] text-[#aaa]">총 86건 · 1페이지 당 10건</span>
                              {renderPagination()}
                            </div>
                          </div>
                        )}

                        {msg.hasDataChart && (
                          <>
                            <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                              <div className="px-3.5 py-2 border-b-[0.5px] border-[#e0e0e0] text-[12px] text-[#555]">통계 표</div>
                              <table className="w-full border-collapse text-[12px]">
                                <thead>
                                  <tr className="bg-[#f5f5f5]">
                                    <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0]">순위</th>
                                    <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0]">제품명</th>
                                    <th className="px-3 py-2 text-right font-medium border-b-[0.5px] border-[#e0e0e0]">판매 건수</th>
                                    <th className="px-3 py-2 text-right font-medium border-b-[0.5px] border-[#e0e0e0]">비중(%)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productStats.map((stat, i) => (
                                    <tr key={i} className={i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}>
                                      <td className="px-3 py-1.5 border-b-[0.5px] border-[#e0e0e0]">{stat.rank}</td>
                                      <td className="px-3 py-1.5 border-b-[0.5px] border-[#e0e0e0]">{stat.name}</td>
                                      <td className="px-3 py-1.5 text-right border-b-[0.5px] border-[#e0e0e0]">{stat.sales}</td>
                                      <td className="px-3 py-1.5 text-right border-b-[0.5px] border-[#e0e0e0]">{stat.ratio}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                              <div className="px-3.5 py-2 border-b-[0.5px] border-[#e0e0e0] text-[12px] text-[#555]">파이 차트</div>
                              <div className="p-4 flex items-center gap-6">
                                <div className="flex-shrink-0">
                                  <PieChart width={180} height={180}>
                                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </div>
                                <div className="flex flex-col gap-2 text-[12px]">
                                  {chartData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                      <span>{item.name} <span className="text-[#aaa]">{item.value}%</span></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {messages.length > 0 && (
              <div className="px-6 py-3 border-t-[0.5px] border-[#e0e0e0]">
                <div className="relative">
                  {showSuggestions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 flex flex-wrap gap-2">
                      {suggestions.map((sug, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(sug)}
                          className="px-3 py-1.5 text-[12px] text-[#534AB7] bg-[#F5F4FE] border-[0.5px] border-[#D4D2F9] rounded-full hover:bg-[#EEEDFE] transition-colors">
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="border-[0.5px] border-[#ddd] rounded-xl px-4 py-2.5 flex items-center gap-2 focus-within:border-[#534AB7] transition-colors">
                      <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                        onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="궁금한 데이터를 물어보세요."
                        className="flex-1 border-none outline-none text-[13px] bg-transparent text-[#1a1a1a] placeholder:text-[#aaa]" />
                      <button type="submit" className="w-7 h-7 rounded-full bg-[#534AB7] hover:bg-[#4239a0] transition-colors flex items-center justify-center flex-shrink-0">
                        <ArrowRight size={14} className="text-white" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
