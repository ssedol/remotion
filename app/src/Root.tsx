import React from 'react';
import {Composition} from 'remotion';
import newsData from '../data/news.json';
import {
  GameNewsShort,
  gameNewsShortDurationSeconds,
} from './GameNewsShort';
import type {NewsShortData} from './newsTypes';

const FPS = 30;
const defaultNewsData = newsData as NewsShortData;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GameNewsShort"
        component={GameNewsShort}
        durationInFrames={gameNewsShortDurationSeconds * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultNewsData}
      />
    </>
  );
};
