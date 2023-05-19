import Big from 'big.js';
import { ChangeEventHandler, Ref, useState } from 'react';
import useRefCallback from './hooks/useRefCallback';
import useForceUpdate from './hooks/useForceUpdate';

const FPS = 50;
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
    console.log({ currentTime, leftOver });
    if (leftOver.toNumber() < 1 / FPS / 2) {
      currentTime = currentTime.minus(leftOver);
    } else {
      currentTime = currentTime.plus(Big(1).div(Big(FPS)).minus(leftOver));
    }
    setCurrentTime(Big(currentTime).toNumber());
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
              className={video.playbackRate == 0.5 ? 'selected' : ''}
            >
              0.5x speed
            </button>
            <button
              onClick={updatePlaybackRate(1)}
              className={video.playbackRate == 1 ? 'selected' : ''}
            >
              normal speed
            </button>
            <button
              onClick={updatePlaybackRate(2)}
              className={video.playbackRate == 2 ? 'selected' : ''}
            >
              {'>>'} 2x speed {'>>'}
            </button>
            <button
              onClick={updatePlaybackRate(10)}
              className={video.playbackRate == 10 ? 'selected' : ''}
            >
              {'>>>'} 10x speed {'>>>'}
            </button>
          </p>
          <p>
            <button onClick={addTimeStamp}>Add Time stamp</button>
            <ul>
              {timeStamps.map((stamp) => (
                <li key={stamp}>{stamp.toFixed(2)}</li>
              ))}
            </ul>
          </p>
        </>
      )}
    </>
  );
}

export default App;
