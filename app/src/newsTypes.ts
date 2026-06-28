export const NEWS_LIMIT = 5;

export type NewsItem = {
  category: string;
  title: string;
  summary: string;
  point: string;
  sourceName: string;
  sourceUrl?: string;
  publishedAt?: string;
};

export type NewsShortData = {
  date: string;
  title: string;
  subtitle: string;
  brand: string;
  items: NewsItem[];
};

export const createEmptyNewsItem = (index: number): NewsItem => ({
  category: `NEWS ${index + 1}`,
  title: '뉴스 항목 대기 중',
  summary: '제공된 뉴스가 없어 이 슬롯은 비워 둡니다.',
  point: 'items 배열에 뉴스를 추가하면 자동으로 반영됩니다.',
  sourceName: '입력 대기',
  sourceUrl: '',
  publishedAt: '',
});

export const defaultNewsData: NewsShortData = {
  date: '2026-06-28',
  title: '오늘의 게임 뉴스 5',
  subtitle: '게임·콘솔·휴대용 게임기 주요 소식',
  brand: 'Game Content Factory',
  items: [
    {
      category: 'STEAM',
      title: '여름 할인 인기작 순위 급변',
      summary: '대형 할인 시즌이 시작되며 협동 액션과 생존 장르가 상위권에 올랐습니다.',
      point: '짧은 기간 가격 변동이 커서 위시리스트 확인이 중요합니다.',
      sourceName: 'Steam News',
      sourceUrl: 'https://store.steampowered.com/news/',
      publishedAt: '2026-06-28T09:00:00+09:00',
    },
    {
      category: 'CONSOLE',
      title: '차세대 콘솔 업데이트 예고',
      summary: '주요 플랫폼이 성능 모드와 접근성 옵션을 포함한 시스템 업데이트를 준비 중입니다.',
      point: '업데이트 이후 저장 공간과 호환성 공지를 먼저 확인해야 합니다.',
      sourceName: 'Platform Blog',
      sourceUrl: 'https://example.com/console-update',
      publishedAt: '2026-06-28T10:00:00+09:00',
    },
    {
      category: 'HANDHELD',
      title: '휴대용 게임기 신형 루머 확산',
      summary: '배터리 효율과 OLED 패널 개선을 중심으로 신형 기기 관련 보도가 이어졌습니다.',
      point: '공식 발표 전까지 가격과 출시일은 확정 정보가 아닙니다.',
      sourceName: 'Game Hardware Weekly',
      sourceUrl: 'https://example.com/handheld-rumor',
      publishedAt: '2026-06-28T11:00:00+09:00',
    },
    {
      category: 'ESPORTS',
      title: '국제 대회 결승 대진 확정',
      summary: '플레이오프 마지막 경기에서 역전승이 나오며 이번 주 결승 매치업이 완성됐습니다.',
      point: '메타 변화가 빠르게 진행돼 밴픽 흐름이 승부의 핵심이 될 전망입니다.',
      sourceName: 'Esports Desk',
      sourceUrl: 'https://example.com/esports-final',
      publishedAt: '2026-06-28T12:00:00+09:00',
    },
    {
      category: 'INDIE',
      title: '인디 쇼케이스 기대작 공개',
      summary: '픽셀 아트 RPG와 로그라이트 신작들이 공개되며 체험판 배포 일정도 함께 발표됐습니다.',
      point: '체험판 반응이 출시 전 관심도를 좌우할 가능성이 큽니다.',
      sourceName: 'Indie Showcase',
      sourceUrl: 'https://example.com/indie-showcase',
      publishedAt: '2026-06-28T13:00:00+09:00',
    },
  ],
};
