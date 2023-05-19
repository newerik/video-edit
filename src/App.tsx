import Big from 'big.js';
import { ChangeEventHandler, Ref, useState } from 'react';
import useRefCallback from './hooks/useRefCallback';
import useForceUpdate from './hooks/useForceUpdate';

const FPS = 50;

const pad = (input: Big, length = 2) => input.toString().padStart(length, '0');

const toTime = (seconds: number): string => {
  const bigSec = Big(seconds);
  const MILLISECONDS = bigSec.mod(1).times(1000);
  const MS = MILLISECONDS.div(1000);
  const SS = bigSec.minus(MS).mod(60);
  const MM = bigSec.minus(MS).minus(SS).div(60).mod(60);
  const HOURS = bigSec
    .minus(MS)
    .minus(SS)
    .minus(MM.times(60))
    .div(60 * 60);
  return `${pad(HOURS)}:${pad(MM)}:${pad(SS)}.${pad(MILLISECONDS, 3)}`;
};

function App() {
  const forceUpdate = useForceUpdate();
  const [videoRef, videoElement] = useRefCallback<HTMLVideoElement>();
  const video = videoElement as HTMLVideoElement;
  const [videoUrl, setVideoUrl] = useState<string>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeStamps, setTimeStamps] = useState<number[]>([]);

  const playSelectedFile: ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    if (!target.files) return;
    const file = target.files[0];
    const { type } = file;
    const canPlay = (videoElement as HTMLVideoElement).canPlayType(type);
    if (!canPlay) {
      console.error('Video type cannot be played!');
      return;
    }

    const fileURL = window.URL.createObjectURL(file);
    setVideoUrl(fileURL);
  };

  const handleTimeUpdate = () => {
    let currentTime = Big((videoElement as HTMLVideoElement).currentTime);
    const leftOver = currentTime.mod(Big(1).div(Big(FPS)));
    if (leftOver.toNumber() < 1 / FPS / 2) {
      currentTime = currentTime.minus(leftOver);
    } else {
      currentTime = currentTime.plus(Big(1).div(Big(FPS)).minus(leftOver));
    }
    setCurrentTime(Big(currentTime).toNumber());
  };

  const updateCurrentTime = (seconds: number) => () => {
    video.currentTime = seconds;
  };

  const updateCurrentTimeWith = (seconds: number) => () => {
    video.currentTime += seconds;
  };

  const updatePlaybackRate = (speed: number) => () => {
    if (video.playbackRate != speed) {
      video.playbackRate = speed;
      forceUpdate();
      return;
    }
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const addTimeStamp = () => {
    handleTimeUpdate();
    setTimeStamps(
      [...new Set([...timeStamps, currentTime])].sort((a, b) => a - b)
    );
  };

  const removeTimeStamp = (timeStamp: number) => () => {
    const newTimeStamps = new Set(timeStamps);
    newTimeStamps.delete(timeStamp);
    setTimeStamps([...newTimeStamps]);
  };

  const removeAllTimeStamps = () => setTimeStamps([]);

  return (
    <>
      {!videoUrl && (
        <input type="file" accept="video/*" onChange={playSelectedFile} />
      )}
      <video
        controls
        ref={videoRef as Ref<HTMLVideoElement>}
        src={videoUrl}
        style={{ display: videoUrl ? 'block' : 'none' }}
        onTimeUpdate={handleTimeUpdate}
      />
      {videoUrl && (
        <>
          <p>
            <button onClick={updateCurrentTimeWith(-10)} className="big">
              -10 second
            </button>
            <button onClick={updateCurrentTimeWith(-1)}>-1 second</button>
            <button onClick={updateCurrentTimeWith(-1 / FPS)} className="small">
              -1 frame
            </button>
            <button onClick={updateCurrentTimeWith(1 / FPS)} className="small">
              +1 frame
            </button>
            <button onClick={updateCurrentTimeWith(1)}>+1 second</button>
            <button onClick={updateCurrentTimeWith(10)} className="big">
              +10 second
            </button>
          </p>
          <p>
            <button
              onClick={updatePlaybackRate(0.5)}
              className={video.playbackRate == 0.5 ? 'red' : ''}
            >
              0.5x speed
            </button>
            <button
              onClick={updatePlaybackRate(1)}
              className={video.playbackRate == 1 ? 'red' : ''}
            >
              normal speed
            </button>
            <button
              onClick={updatePlaybackRate(2)}
              className={video.playbackRate == 2 ? 'red' : ''}
            >
              {'>>'} 2x speed {'>>'}
            </button>
            <button
              onClick={updatePlaybackRate(10)}
              className={video.playbackRate == 10 ? 'red' : ''}
            >
              {'>>>'} 10x speed {'>>>'}
            </button>
          </p>
          <p>
            <button onClick={addTimeStamp}>Add Timestamp</button>
            {!!timeStamps.length && (
              <>
                <ul>
                  {timeStamps.map((stamp) => (
                    <li key={stamp}>
                      <button
                        className="red small"
                        onClick={removeTimeStamp(stamp)}
                      >
                        ×
                      </button>{' '}
                      <button
                        onClick={updateCurrentTime(stamp)}
                        className="blue small"
                      >
                        {toTime(stamp)}
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="red" onClick={removeAllTimeStamps}>
                  Clear all Timestamps
                </button>
              </>
            )}
          </p>
        </>
      )}
    </>
  );
}

export default App;
