# Remotion Game Shorts Factory - Project Context

## 1. 프로젝트 목적

이 프로젝트는 UGREEN NAS에서 Docker 기반으로 Remotion을 실행하여, 게임 뉴스/할인/리뷰 쇼츠 영상을 자동 생성하기 위한 프로젝트다.

최종 목표는 OpenClaw 또는 Codex가 `data/news.json` 같은 JSON 데이터를 생성하고, Remotion이 해당 데이터를 기반으로 1080x1920 세로형 쇼츠 MP4를 자동 렌더링하는 구조를 만드는 것이다.

---

## 2. 현재 환경

### 실행 환경

* 장비: UGREEN NAS DXP2800
* OS: Debian GNU/Linux 12 bookworm
* 프로젝트 위치: `/volume1/docker/remotion`
* Remotion 앱 위치: `/volume1/docker/remotion/app`
* 렌더링 결과 위치: `/volume1/docker/remotion/out`
* Docker 컨테이너명: `remotion`
* Node 버전: Docker 컨테이너 내부 `node:22-bookworm`
* Remotion 버전: `4.0.483`

### 접속 주소

Remotion Studio는 NAS 내부 IP 기준으로 접속한다.

```text
http://192.168.45.100:3000
```

---

## 3. Docker 구조

프로젝트 루트:

```text
/volume1/docker/remotion
├── Dockerfile
├── docker-compose.yml
├── app
│   ├── assets
│   │   ├── bgm
│   │   ├── fonts
│   │   ├── images
│   │   └── audio
│   ├── data
│   │   └── news.json
│   ├── renders
│   ├── scripts
│   ├── src
│   │   ├── GameNewsShort.tsx
│   │   ├── Root.tsx
│   │   ├── newsTypes.ts
│   │   ├── index.css
│   │   ├── index.ts
│   │   └── Composition.tsx
│   ├── templates
│   │   ├── news
│   │   ├── review
│   │   └── sale
│   └── package.json
└── out
    └── game-news.mp4
```

---

## 4. Dockerfile 목적

Remotion 렌더링에는 Chromium Headless 실행에 필요한 리눅스 라이브러리와 `ffmpeg`, 한글 폰트가 필요하다.

현재 컨테이너 안에서 수동 설치 후 렌더링은 성공했다.

영구화를 위해 Dockerfile에는 다음 패키지가 포함되어야 한다.

```dockerfile
FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  fonts-noto-cjk \
  fonts-noto-color-emoji \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["bash"]
```

---

## 5. docker-compose.yml

Remotion 컨테이너는 다음 구성을 사용한다.

```yaml
services:
  remotion:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: remotion
    working_dir: /app
    volumes:
      - ./app:/app
      - ./out:/out
    ports:
      - "3000:3000"
    tty: true
    stdin_open: true
    command: bash
```

---

## 6. 실행 명령

### 컨테이너 시작

```bash
cd /volume1/docker/remotion
docker compose up -d
```

### 컨테이너 접속

```bash
docker exec -it remotion bash
```

### Remotion Studio 실행

컨테이너 내부에서:

```bash
cd /app
npm run dev -- --host 0.0.0.0
```

또는 JSON props 적용 테스트:

```bash
cd /app
npm run dev -- --host 0.0.0.0 --props=./data/news.json
```

### MP4 렌더링

컨테이너 내부에서:

```bash
cd /app
npm run render:news
```

OpenClaw나 Codex가 외부에서 실행할 명령:

```bash
docker exec remotion bash -lc "cd /app && npm run render:news"
```

결과 파일:

```text
/volume1/docker/remotion/out/game-news.mp4
```

---

## 7. package.json 스크립트

현재 주요 스크립트:

```json
{
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "upgrade": "remotion upgrade",
    "lint": "eslint src && tsc",
    "render:news": "remotion render src/index.ts GameNewsShort /out/game-news.mp4 --props=./data/news.json"
  }
}
```

---

## 8. 현재 완성된 기능

### FEAT-1. Remotion Docker 실행

* UGREEN NAS에서 Docker 컨테이너로 Remotion 실행 완료
* PC 브라우저에서 NAS IP:3000 접속 성공
* Remotion Studio 정상 표시 확인

### FEAT-2. 세로형 쇼츠 템플릿

* 1080x1920 세로형 쇼츠 템플릿 생성
* 컴포지션 ID: `GameNewsShort`
* 길이: 900 frames
* FPS: 30
* 총 영상 길이: 30초

### FEAT-3. 게임뉴스 방송형 인트로

* 첫 2초 동안 깔끔한 게임뉴스 방송형 인트로 표시
* 자극적인 썸네일형 훅은 사용하지 않기로 결정
* 인트로 문구는 JSON/props 기반으로 변경 가능

### FEAT-4. 뉴스 카드형 본문 화면

본문은 다음 구조를 가진다.

```text
상단: 카테고리 + GAME NEWS
중앙: 제목 + 부제
중간 카드: 게임 이미지/커버 느낌의 카드 + 배지 + 설명
하단 카드: 요약 + 핵심 포인트 3개
```

### FEAT-5. 하단 CTA/브랜드 제거

* “자세한 소식은 블로그에서 확인” CTA 제거
* 하단 브랜드 `@Game Content Factory`도 제거
* 쇼츠가 광고처럼 보이지 않게 하기 위한 결정

### FEAT-6. JSON 기반 렌더링

* `data/news.json` 기반으로 MP4 렌더링 성공
* 결과물 `/out/game-news.mp4` 생성 확인 완료

---

## 9. 현재 데이터 구조

파일 위치:

```text
/volume1/docker/remotion/app/data/news.json
```

예시:

```json
{
  "category": "GAME NEWS",
  "title": "닌텐도 신작 공개 임박",
  "hookTitle": "오늘의 게임 이슈",
  "hookKeyword": "신작 공개 소식",
  "hookText": "이번 주 발표 가능성",
  "subtitle": "게이머들이 기다리던 신작 정보가 곧 공개될 수 있습니다.",
  "summary": "업계 소식에 따르면 주요 게임사의 신작 발표 일정이 가까워지고 있습니다.",
  "points": [
    "신작 발표 가능성",
    "플랫폼 정보 주목",
    "예약 판매 일정 예상"
  ],
  "badge": "신작 소식",
  "mediaTitle": "이번 주 공개 가능성",
  "mediaDesc": "공식 발표 여부와 출시 플랫폼을 확인해야 합니다.",
  "brand": "Game Content Factory"
}
```

현재 `brand` 필드는 타입에는 남아 있지만 화면에는 표시하지 않는다.

---

## 10. 타입 정의

파일:

```text
src/newsTypes.ts
```

타입:

```ts
export type NewsShortData = {
  category: string;
  title: string;
  hookTitle: string;
  hookKeyword: string;
  hookText: string;
  subtitle: string;
  summary: string;
  points: string[];
  badge: string;
  mediaTitle: string;
  mediaDesc: string;
  brand: string;
};
```

---

## 11. 주요 컴포넌트

### `src/Root.tsx`

역할:

* Remotion 컴포지션 등록
* `GameNewsShort` 컴포넌트 연결
* 기본 props 연결

컴포지션 설정:

```tsx
<Composition
  id="GameNewsShort"
  component={GameNewsShort}
  durationInFrames={900}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={defaultNewsData}
/>
```

### `src/GameNewsShort.tsx`

역할:

* 실제 쇼츠 화면 구성
* 첫 2초 인트로
* 2초 이후 뉴스 카드형 본문
* `Partial<NewsShortData>` props를 받아 기본 데이터와 병합

핵심 구조:

```ts
const news: NewsShortData = {
  ...defaultNewsData,
  ...props,
  points: props.points ?? defaultNewsData.points,
};
```

### `src/index.css`

역할:

* 전체 쇼츠 디자인 스타일
* 네온/다크 배경
* 뉴스 방송형 인트로
* 카드형 본문 UI
* 한글 표시를 고려한 폰트 설정

---

## 12. 디자인 결정사항

### 유지할 디자인

* 깔끔한 게임뉴스 방송형
* 다크 블루톤
* 카드형 정보 전달
* 첫 2초 인트로
* 광고성 CTA 없음
* 하단 브랜드 없음

### 피할 디자인

* 지나치게 자극적인 썸네일형 디자인
* 빨강/노랑 과다 사용
* 흔들림이 심한 연출
* “블로그에서 확인” 같은 직접 광고 문구
* 하단에 계속 떠 있는 브랜드 문구

---

## 13. Decision Log

| ID   | 결정                                                           |
| ---- | ------------------------------------------------------------ |
| D-1  | Remotion은 UGREEN NAS Docker에서 실행한다                           |
| D-2  | 프로젝트 위치는 `/volume1/docker/remotion`으로 관리한다                   |
| D-3  | 쇼츠 해상도는 1080x1920 세로형으로 한다                                   |
| D-4  | 컴포지션 ID는 `GameNewsShort`로 한다                                 |
| D-5  | 첫 화면은 1초가 너무 짧아 2초로 늘렸다                                      |
| D-6  | 첫 2초는 자극형이 아닌 깔끔한 게임뉴스 방송형으로 한다                              |
| D-7  | 본문은 뉴스 카드형 템플릿으로 한다                                          |
| D-8  | 하단 CTA 문구는 제거한다                                              |
| D-9  | 하단 브랜드 문구도 제거한다                                              |
| D-10 | 데이터는 `data/news.json`으로 관리한다                                 |
| D-11 | 렌더링 결과는 `/out/game-news.mp4`로 생성한다                           |
| D-12 | OpenClaw/Codex는 JSON 생성 후 `npm run render:news`를 실행하는 구조로 간다 |

---

## 14. 다음 작업 우선순위

### M0. Docker 환경 영구화

현재 수동으로 설치한 렌더링 의존성들을 Dockerfile에 반영하고 재빌드해야 한다.

작업:

```bash
cd /volume1/docker/remotion
docker compose down
docker compose build --no-cache
docker compose up -d
docker exec -it remotion bash
cd /app
npm run render:news
```

성공 기준:

```text
/out/game-news.mp4 생성
```

### M1. JSON 데이터 완전 자동화

현재는 `data/news.json` 하나만 사용한다.

다음 목표:

```text
data/news.json
data/sale.json
data/review.json
data/hardware.json
```

또는 여러 개의 입력 파일을 받아 다른 이름으로 렌더링할 수 있게 만든다.

예상 명령:

```bash
npm run render:news
npm run render:sale
npm run render:review
```

### M2. 실제 이미지 삽입

현재 게임 이미지는 CSS 기반 가짜 커버 카드다.

다음 목표:

```json
{
  "image": "assets/images/sample.jpg"
}
```

를 받아 실제 이미지를 표시한다.

이미지 없을 때는 현재 가짜 커버 카드를 fallback으로 사용한다.

### M3. TTS 음성 삽입

목표:

```json
{
  "voice": "assets/audio/news.mp3"
}
```

를 받아 음성을 영상에 삽입한다.

음성이 없을 때는 무음 영상으로 렌더링한다.

### M4. 자막 자동 생성

목표:

```json
{
  "captions": [
    {"start": 2, "end": 5, "text": "닌텐도 신작 공개가 임박했습니다."},
    {"start": 5, "end": 9, "text": "이번 주 발표 가능성이 제기되고 있습니다."}
  ]
}
```

자막을 화면 하단에 자동 표시한다.

### M5. OpenClaw 연결

OpenClaw가 수행할 작업:

1. 게임 뉴스 수집
2. GPT로 `data/news.json` 생성
3. 필요 시 이미지/TTS 생성
4. 아래 명령 실행

```bash
docker exec remotion bash -lc "cd /app && npm run render:news"
```

5. `/volume1/docker/remotion/out/game-news.mp4` 확인

---

## 15. Codex에게 맡길 작업 지시 예시

Codex는 아래 목표를 기준으로 작업하면 된다.

### 작업 1. Docker 환경 영구화

`Dockerfile`과 `docker-compose.yml`을 점검하고, Remotion 렌더링에 필요한 Chromium/ffmpeg/한글 폰트 의존성이 영구 반영되었는지 확인하라.

성공 기준:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker exec remotion bash -lc "cd /app && npm run render:news"
```

실행 시 `/out/game-news.mp4`가 생성되어야 한다.

### 작업 2. 실제 이미지 지원 추가

`NewsShortData`에 `image?: string` 필드를 추가하라.

`image`가 있으면 `/app/{image}` 경로 이미지를 Remotion에서 표시하고, 없으면 기존 CSS 기반 `game-cover` fallback을 표시하라.

예시 JSON:

```json
{
  "image": "assets/images/sample.jpg"
}
```

### 작업 3. TTS 오디오 지원 추가

`NewsShortData`에 `voice?: string` 필드를 추가하라.

`voice`가 있으면 Remotion의 `Audio` 컴포넌트를 사용해서 음성을 삽입하라.

예시 JSON:

```json
{
  "voice": "assets/audio/news.mp3"
}
```

### 작업 4. 렌더 결과 파일명 자동화

현재는 항상 `/out/game-news.mp4`로 출력된다.

향후 여러 쇼츠를 만들기 위해 출력 파일명을 인자로 받거나, JSON 내부의 `slug` 필드를 사용하여 파일명을 바꿀 수 있게 개선하라.

예시:

```json
{
  "slug": "nintendo-new-game"
}
```

출력:

```text
/out/nintendo-new-game.mp4
```

### 작업 5. 코드 정리

불필요한 `brand` 표시 관련 CSS가 남아 있다면 정리하라.

단, 향후 엔딩 화면에서 재사용할 가능성이 있으므로 삭제 전 영향 범위를 확인하라.

---

## 16. 주의사항

* 기존 디자인 방향을 크게 바꾸지 말 것
* 첫 2초 인트로는 유지할 것
* 하단 CTA와 브랜드는 다시 추가하지 말 것
* 모든 문구는 가능한 JSON/props 기반으로 처리할 것
* 한글 폰트 깨짐이 발생하지 않게 `fonts-noto-cjk`를 유지할 것
* 렌더링 결과는 `/out` 볼륨에 저장할 것
* Remotion Studio는 개발용이고, 실제 자동화는 CLI 렌더링 명령을 기준으로 할 것

---

## 17. 현재 목표 한 줄 요약

UGREEN NAS의 Docker Remotion 프로젝트에서 `data/news.json`을 입력으로 받아, 깔끔한 게임뉴스 방송형 30초 세로 쇼츠 MP4를 자동 생성하는 시스템을 구축 중이다.
