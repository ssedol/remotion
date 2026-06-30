import React from 'react';
import {Composition} from 'remotion';
import newsData from '../data/news.json';
import {GameNewsShort} from './GameNewsShort';
import type {NewsShortData} from './newsTypes';

const FPS = 30;
const INTRO_SECONDS = 2;
const NEWS_SECONDS = 7;
const OUTRO_SECONDS = 8;

const defaultNewsData = newsData as NewsShortData;

const getRenderableNewsCount = (data: NewsShortData) => {
  return Array.isArray(data.items)
    ? data.items.filter((item) => item && item.title && item.summary).length
    : 0;
};

const newsCount = getRenderableNewsCount(defaultNewsData);
const dynamicDurationSeconds =
  INTRO_SECONDS + newsCount * NEWS_SECONDS + OUTRO_SECONDS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GameNewsShort"
        component={GameNewsShort}
        durationInFrames={dynamicDurationSeconds * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultNewsData}
      />
    </>
  );
};
