import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import './index.css';
import {
  NEWS_LIMIT,
  NewsItem,
  NewsShortData,
  createEmptyNewsItem,
  defaultNewsData,
} from './newsTypes';

const INTRO_SECONDS = 2;
const NEWS_SECONDS = 7;
const OUTRO_SECONDS = 8;

const safeText = (value: unknown, fallback: string) => {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : fallback;
};

const twoDigit = (value: number) => {
  return value < 10 ? `0${value}` : `${value}`;
};

const normalizeNewsItem = (
  item: Partial<NewsItem> | undefined,
  index: number,
): NewsItem => {
  const fallback = createEmptyNewsItem(index);

  return {
    category: safeText(item?.category, fallback.category),
    title: safeText(item?.title, fallback.title),
    summary: safeText(item?.summary, fallback.summary),
    point: safeText(item?.point, fallback.point),
    sourceName: safeText(item?.sourceName, fallback.sourceName),
    sourceUrl: safeText(item?.sourceUrl, fallback.sourceUrl ?? ''),
    publishedAt: safeText(item?.publishedAt, fallback.publishedAt ?? ''),
  };
};

const buildNewsData = (props: Partial<NewsShortData>): NewsShortData => {
  const rawItems = Array.isArray(props.items)
    ? props.items
    : defaultNewsData.items;

  const items = rawItems
    .filter((item) => item && item.title && item.summary)
    .slice(0, NEWS_LIMIT)
    .map((item, index) => normalizeNewsItem(item, index));

  const itemCount = items.length;
  const fallbackTitle = safeText(props.title, defaultNewsData.title);
  const dynamicTitle =
    itemCount > 0
      ? fallbackTitle.replace(/[0-9]+$/, String(itemCount))
      : fallbackTitle;

  return {
    date: safeText(props.date, defaultNewsData.date),
    title: dynamicTitle,
    subtitle: safeText(props.subtitle, defaultNewsData.subtitle),
    brand: safeText(props.brand, defaultNewsData.brand),
    items,
  };
};

const SceneBackground: React.FC = () => {
  return (
    <>
      <div className="noise" />
      <div className="broadcast-grid" />
      <div className="signal-line signal-line-a" />
      <div className="signal-line signal-line-b" />
    </>
  );
};

const Masthead: React.FC<{
  date: string;
  rightLabel: string;
}> = ({date, rightLabel}) => {
  return (
    <div className="masthead">
      <div>
        <div className="masthead-channel">GAME NEWS</div>
        <div className="masthead-date">{date}</div>
      </div>
      <div className="masthead-status">{rightLabel}</div>
    </div>
  );
};

const IntroScreen: React.FC<{
  data: NewsShortData;
  frame: number;
  fps: number;
  duration: number;
}> = ({data, frame, fps, duration}) => {
  const titleIn = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const fadeOut = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lineWidth = interpolate(frame, [8, duration - 6], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="scene intro-scene" style={{opacity: fadeOut}}>
      <Masthead date={data.date} rightLabel="BRIEFING" />
      <div
        className="intro-main"
        style={{transform: `translateY(${36 - titleIn * 36}px)`}}
      >
        <div className="intro-kicker">DAILY ROUNDUP</div>
        <h1>{data.title}</h1>
        <p>{data.subtitle}</p>
        <div className="timeline-rail">
          <div className="timeline-fill" style={{width: `${lineWidth}%`}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const NewsCard: React.FC<{
  data: NewsShortData;
  item: NewsItem;
  index: number;
  frame: number;
  fps: number;
  duration: number;
}> = ({data, item, index, frame, fps, duration}) => {
  const enter = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 110,
      mass: 0.9,
    },
  });

  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [duration - 18, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const progress = interpolate(frame, [0, duration - 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      className="scene news-scene"
      style={{opacity: fadeIn * fadeOut}}
    >
      <Masthead
        date={data.date}
        rightLabel={`${twoDigit(index + 1)} / ${twoDigit(NEWS_LIMIT)}`}
      />

      <section
        className="briefing-card"
        style={{transform: `translateY(${54 - enter * 54}px)`}}
      >
        <div className="card-topline">
          <div className="category-pill">{item.category}</div>
          <div className="segment-label">NEWS {twoDigit(index + 1)}</div>
        </div>

        <h1>{item.title}</h1>
        <p className="news-summary">{item.summary}</p>

        <div className="point-panel">
          <div className="point-label">POINT</div>
          <p>{item.point}</p>
        </div>

        <div className="source-row">
          <span>SOURCE</span>
          <strong>{item.sourceName}</strong>
        </div>
      </section>

      <div className="news-progress">
        <div style={{width: `${progress}%`}} />
      </div>
    </AbsoluteFill>
  );
};

const ClosingScreen: React.FC<{
  data: NewsShortData;
  items: NewsItem[];
  frame: number;
  fps: number;
}> = ({data, items, frame, fps}) => {
  const readyItems = items.filter((item) => item.sourceName !== '입력 대기');
  const recapItems = readyItems.length > 0 ? readyItems : items;

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 105,
      mass: 0.9,
    },
  });

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="scene closing-scene" style={{opacity: fadeIn}}>
      <Masthead date={data.date} rightLabel="SUMMARY" />

      <div
        className="closing-main"
        style={{transform: `translateY(${42 - enter * 42}px)`}}
      >
        <div className="closing-kicker">{data.title}</div>
        <h1>오늘의 주요 뉴스 요약</h1>
        <div className="recap-list">
          {recapItems.map((item, index) => (
            <div className="recap-item" key={`${item.category}-${item.title}-${index}`}>
              <span>{twoDigit(index + 1)}</span>
              <div>
                <strong>{item.category}</strong>
                <p>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GameNewsShort: React.FC<Partial<NewsShortData>> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const data = buildNewsData(props);

  const introFrames = Math.round(INTRO_SECONDS * fps);
  const newsFrames = Math.round(NEWS_SECONDS * fps);
  const outroStart = introFrames + data.items.length * newsFrames;

  let scene = (
    <ClosingScreen
      data={data}
      items={data.items}
      frame={frame - outroStart}
      fps={fps}
    />
  );

  if (frame < introFrames) {
    scene = (
      <IntroScreen
        data={data}
        frame={frame}
        fps={fps}
        duration={introFrames}
      />
    );
  } else if (frame < outroStart) {
    const newsIndex = Math.floor((frame - introFrames) / newsFrames);
    const localFrame = frame - introFrames - newsIndex * newsFrames;

    scene = (
      <NewsCard
        data={data}
        item={data.items[newsIndex]}
        index={newsIndex}
        frame={localFrame}
        fps={fps}
        duration={newsFrames}
      />
    );
  }

  return (
    <AbsoluteFill className="short-root">
      <SceneBackground />
      {scene}
    </AbsoluteFill>
  );
};

export const gameNewsShortDurationSeconds =
  INTRO_SECONDS + NEWS_LIMIT * NEWS_SECONDS + OUTRO_SECONDS;
