import { useState } from 'react';
import { Plus, User, ArrowRight, Sparkles, ChevronDown, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Message {
  type: 'user' | 'ai';
  content: string;
  hasDataTable?: boolean;
  hasDataChart?: boolean;
  hasZeroResults?: boolean;
}

export default function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSql, setShowSql] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    '지난 한달 간 PC필터 판매된 리스트 좀 보여줘',
    '지난달 제품별 판매 비중 차트로 보여줘',
    '오늘 날씨 어때?',
    '1988년 1월 PC필터 판매 리스트',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const dataKeywords = ['목록', '리스트', '추출'];
      const hasDataKeyword = dataKeywords.some(keyword => message.includes(keyword));
      
      const crmKeywords = ['고객사', '영업', '판매', '계약', '라이선스', '목록', '리스트', '추출', '데이터', '매출', '제품', '상품', '실적', '담당자', '지역', '비중', '분석', 'CRM', 'PC필터', '클라우드'];
      const isCrmRelated = crmKeywords.some(keyword => message.includes(keyword));
      
      // 0건 케이스 체크 (1988년 1월 데이터)
      const isZeroCase = message.includes('1988년 1월') || message.includes('1988년1월');
      
      if (!isCrmRelated) {
        // CRM과 관련 없는 질문
        setMessages([
          { type: 'user', content: message },
          { 
            type: 'ai', 
            content: '저는 CRM에 있는 데이터와 관련된 질문을 전문으로 해요.\n해당 내용은 CRM 데이터에서 확인이 어려워요.\n\n고객사, 영업, 판매, 계약, 라이선스 등 궁금한 데이터가 있으시면 언제든 편하게 물어봐주세요 😊',
            hasDataTable: false,
            hasDataChart: false
          }
        ]);
      } else if (isZeroCase && hasDataKeyword) {
        // 0건 결과
        setMessages([
          { type: 'user', content: message },
          { 
            type: 'ai', 
            content: '데이터를 조회해 봤는데, 조건에 해당하는 결과가 없어요.\n조건을 변경해서 다시 질문해보세요!',
            hasDataTable: true,
            hasDataChart: false,
            hasZeroResults: true
          }
        ]);
      } else if (hasDataKeyword) {
        // 목록/리스트/추출 키워드 있음 - 데이터 테이블
        setMessages([
          { type: 'user', content: message },
          { 
            type: 'ai', 
            content: '지난 한달 간 PC필터 판매 수는 총 86건이에요.',
            hasDataTable: true,
            hasDataChart: false
          }
        ]);
      } else {
        // CRM 관련이지만 목록/리스트/추출 키워드 없음 - 차트/분석
        setMessages([
          { type: 'user', content: message },
          { 
            type: 'ai', 
            content: '지난달 제품별 판매 비중이에요. PCFILTER가 35%로 가장 높았어요.',
            hasDataTable: false,
            hasDataChart: true
          }
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

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      if (i === 1 || i === TOTAL_PAGES || Math.abs(i - currentPage) <= 1) {
        pages.push(
          <span
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`cursor-pointer px-1.5 py-0.5 rounded ${
              i === currentPage ? 'text-[#1a1a1a] font-medium' : 'text-[#aaa]'
            }`}
          >
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
        <span
          onClick={() => setCurrentPage(Math.min(currentPage + 1, TOTAL_PAGES))}
          className="cursor-pointer text-[#aaa] px-1"
        >
          &gt;
        </span>
      </div>
    );
  };

  return (
    <div className="h-screen p-4 bg-[#f5f5f5]" style={{ fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      <div className="bg-white rounded-xl border-[0.5px] border-[#e0e0e0] overflow-hidden flex h-[calc(100vh-32px)]">
        
        {/* Sidebar */}
        <div className="w-[200px] border-r-[0.5px] border-[#e0e0e0] p-4 flex flex-col gap-3 flex-shrink-0">
          {/* New Chat Button */}
          <button 
            onClick={() => setMessages([])}
            className="w-full text-left px-3 py-2 text-[13px] rounded-lg border-[0.5px] border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            <span>새 채팅</span>
          </button>

          {/* Chat List Label */}
          <div className="text-[11px] text-[#aaa] px-1">채팅 목록</div>

          {/* Chat History */}
          <div className="flex flex-col gap-1">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`text-[12px] text-[#555] px-2 py-1 rounded-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors ${
                  index === 0 && messages.length > 0 ? 'bg-[#f5f5f5]' : ''
                }`}
              >
                {chat}
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* User Profile */}
          <div className="border-t-[0.5px] border-[#e0e0e0] pt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border-[0.5px] border-[#ddd] flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-[#888780]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[12px] font-medium text-[#1a1a1a] m-0 whitespace-nowrap overflow-hidden text-ellipsis">
                이세은
              </p>
              <p className="text-[11px] text-[#aaa] m-0">seeun0708</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="px-6 py-[14px] border-b-[0.5px] border-[#e0e0e0] flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L8.8 5.5L12 5L9.5 7.5L11 11L8 9L5 11L6.5 7.5L4 5L7.2 5.5Z" fill="#534AB7"/>
                <path d="M13 1L13.4 2.6L15 3L13.4 3.4L13 5L12.6 3.4L11 3L12.6 2.6Z" fill="#AFA9EC"/>
                <path d="M3 11L3.3 12.3L4.5 12.5L3.3 12.7L3 14L2.7 12.7L1.5 12.5L2.7 12.3Z" fill="#AFA9EC"/>
              </svg>
            </div>
            <span className="text-[15px] font-medium text-[#1a1a1a]">AI 큐피드</span>
            <span className="text-[11px] px-[7px] py-[2px] rounded-[10px] bg-[#FAC775] text-[#633806]">
              BETA
            </span>
          </div>

          {/* Chat Area or Welcome Content */}
          {messages.length === 0 ? (
            // Welcome Content
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
              <div className="text-center">
                {/* AI Icon */}
                <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L17.6 11L24 10L19 15L22 22L16 18L10 22L13 15L8 10L14.4 11Z" fill="#534AB7"/>
                    <path d="M26 3L26.7 5.8L29.5 6L26.7 6.2L26 9L25.3 6.2L22.5 6L25.3 5.8Z" fill="#AFA9EC"/>
                    <path d="M6 22L6.5 24.3L8.5 24.5L6.5 24.7L6 27L5.5 24.7L3.5 24.5L5.5 24.3Z" fill="#AFA9EC"/>
                  </svg>
                </div>

                {/* Welcome Text */}
                <p className="text-[16px] font-medium text-[#1a1a1a] mb-2">
                  안녕하세요. CRM 데이터 전문가 큐피드입니다.
                </p>
                <p className="text-[13px] text-[#555] mb-1">
                  <span className="text-[#534AB7] font-medium">Query</span>는 제가 작성할게요.
                </p>
                <p className="text-[13px] text-[#555]">
                  원하는 데이터를 <span className="text-[#534AB7] font-medium">Speed</span>하게 전해드려요.
                </p>
              </div>

              {/* Input Field - Centered */}
              <form onSubmit={handleSubmit} className="w-full max-w-[560px]">
                {/* Suggestions */}
                {showSuggestions && (
                  <div className="mb-3 flex flex-wrap gap-2 justify-center">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        className="px-3 py-1.5 text-[12px] text-[#534AB7] bg-[#F5F4FE] border-[0.5px] border-[#D4D2F9] rounded-full hover:bg-[#EEEDFE] transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="border-[0.5px] border-[#ddd] rounded-xl px-4 py-3 flex items-center gap-2 focus-within:border-[#534AB7] transition-colors">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="궁금한 데이터를 물어보세요."
                    className="flex-1 border-none outline-none text-[13px] bg-transparent text-[#1a1a1a] placeholder:text-[#aaa]"
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 rounded-full bg-[#534AB7] hover:bg-[#4239a0] transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <ArrowRight size={14} className="text-white" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Chat Messages
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.type === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-[#EEEDFE] rounded-xl px-3.5 py-2.5 text-[13px] text-[#3C3489] max-w-[70%]">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* SQL Section - For both table and chart */}
                      {(msg.hasDataTable || msg.hasDataChart) && (
                        <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                          <div
                            onClick={() => setShowSql(!showSql)}
                            className="px-3.5 py-2 flex items-center justify-between cursor-pointer bg-[#f5f5f5] hover:bg-[#eeeeee] transition-colors"
                          >
                            <span className="text-[12px] text-[#555]">SQL문 보기</span>
                            <ChevronDown
                              size={12}
                              className={`text-[#888780] transition-transform ${showSql ? 'rotate-180' : ''}`}
                            />
                          </div>
                          {showSql && (
                            <div className="px-3.5 py-3 bg-[#2C2C2A] border-t-[0.5px] border-[#e0e0e0]">
                              <pre className="m-0 text-[11px] text-[#D3D1C7] font-mono leading-relaxed whitespace-pre-wrap">
{msg.hasDataTable ? `SELECT
  o.order_id,
  o.sale_date,
  o.sale_type,
  p.product_name,
  o.customer_id,
  c.customer_name
FROM sales_order o
JOIN sales_order_item oi
  ON oi.order_id = o.order_id` : `SELECT
  p.product_name,
  SUM(s.quantity) AS total_sales_count,
  ROUND(SUM(s.quantity) * 100.0
    / SUM(SUM(s.quantity)) OVER(), 2
  ) AS sales_ratio_percent
FROM sales s
JOIN products p
  ON s.product_id = p.product_id`}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Text Response */}
                      <div className="text-[13px] text-[#1a1a1a] leading-relaxed whitespace-pre-line">
                        {msg.hasZeroResults ? (
                          <>
                            데이터를 조회해 봤는데, <strong>조건에 해당하는 결과가 없어요.</strong><br />
                            조건을 변경해서 다시 질문해보세요!
                          </>
                        ) : msg.hasDataTable ? (
                          msg.content.split('86건').map((part, i, arr) => 
                            i < arr.length - 1 ? (
                              <span key={i}>
                                {part}<strong>86건</strong>
                              </span>
                            ) : part
                          )
                        ) : msg.hasDataChart ? (
                          <>
                            {msg.content.split('PCFILTER').map((part, i, arr) => 
                              i < arr.length - 1 ? (
                                <span key={i}>
                                  {part}<strong>PCFILTER</strong>
                                </span>
                              ) : part
                            )}
                          </>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {/* Data Table */}
                      {msg.hasDataTable && !msg.hasZeroResults && (
                        <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                          {/* CSV Download Button */}
                          <div className="px-3.5 py-2 flex items-center justify-end border-b-[0.5px] border-[#e0e0e0]">
                            <button className="text-[11px] px-2.5 py-1 flex items-center gap-1 border-[0.5px] border-[#e0e0e0] rounded-md bg-white hover:bg-[#f5f5f5] transition-colors">
                              <Download size={12} className="text-[#555]" />
                              CSV 다운로드
                            </button>
                          </div>

                          {/* Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-[12px]">
                              <thead>
                                <tr className="bg-[#f5f5f5]">
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">order_id</th>
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">sale_date</th>
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">sale_type</th>
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">product_name</th>
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">customer_id</th>
                                  <th className="px-3 py-2 text-left font-medium border-b-[0.5px] border-[#e0e0e0] whitespace-nowrap">customer_name</th>
                                </tr>
                              </thead>
                              <tbody>
                                {salesData.map((row, i) => (
                                  <tr key={i} className={i % 2 === 1 ? 'bg-[#f9f9f9]' : ''}>
                                    {row.map((cell, j) => (
                                      <td key={j} className="px-3 py-1.5 border-b-[0.5px] border-[#e0e0e0]">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          <div className="px-3.5 py-2 border-t-[0.5px] border-[#e0e0e0] flex items-center justify-between">
                            <span className="text-[11px] text-[#aaa]">총 86건 · 1페이지 당 10건</span>
                            {renderPagination()}
                          </div>
                        </div>
                      )}

                      {/* Data Chart */}
                      {msg.hasDataChart && (
                        <>
                          {/* Statistics Table */}
                          <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                            <div className="px-3.5 py-2 border-b-[0.5px] border-[#e0e0e0] text-[12px] text-[#555]">
                              통계 표
                            </div>
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

                          {/* Pie Chart */}
                          <div className="border-[0.5px] border-[#e0e0e0] rounded-lg overflow-hidden">
                            <div className="px-3.5 py-2 border-b-[0.5px] border-[#e0e0e0] text-[12px] text-[#555]">
                              파이 차트
                            </div>
                            <div className="p-4 flex items-center gap-6">
                              <div className="flex-shrink-0">
                                <PieChart width={180} height={180}>
                                  <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </div>
                              <div className="flex flex-col gap-2 text-[12px]">
                                {chartData.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <div 
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                                      style={{ background: item.color }}
                                    ></div>
                                    <span>
                                      {item.name} <span className="text-[#aaa]">{item.value}%</span>
                                    </span>
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

          {/* Input Field - Bottom (only when chatting) */}
          {messages.length > 0 && (
            <div className="px-6 py-3 border-t-[0.5px] border-[#e0e0e0]">
              <div className="relative">
                {/* Suggestions */}
                {showSuggestions && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 flex flex-wrap gap-2">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(sug)}
                        className="px-3 py-1.5 text-[12px] text-[#534AB7] bg-[#F5F4FE] border-[0.5px] border-[#D4D2F9] rounded-full hover:bg-[#EEEDFE] transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="border-[0.5px] border-[#ddd] rounded-xl px-4 py-2.5 flex items-center gap-2 focus-within:border-[#534AB7] transition-colors">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="궁금한 데이터를 물어보세요."
                      className="flex-1 border-none outline-none text-[13px] bg-transparent text-[#1a1a1a] placeholder:text-[#aaa]"
                    />
                    <button
                      type="submit"
                      className="w-7 h-7 rounded-full bg-[#534AB7] hover:bg-[#4239a0] transition-colors flex items-center justify-center flex-shrink-0"
                    >
                      <ArrowRight size={14} className="text-white" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}