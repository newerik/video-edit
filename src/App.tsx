import { ChangeEventHandler, useState } from 'react';
import useRefCallback from './hooks/useRefCallback';
import useForceUpdate from './hooks/useForceUpdate';

const FPS = 50;
function App() {
  const forceUpdate = useForceUpdate();
  const [videoRef, videoElement] = useRefCallback<HTMLVideoElement>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const [currentTime, setCurrentTime] = useState<number>();

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
    let currentTime = (videoElement as HTMLVideoElement).currentTime;
    const leftOver = currentTime % (1 / FPS);
    if (leftOver < 1 / FPS / 2) {
      currentTime -= leftOver;
    } else {
      currentTime += 1 / FPS - leftOver;
    }
    setCurrentTime(currentTime);
  };

  const updateCurrentTimeWith = (seconds: number) => () => {
    if (videoElement) videoElement.currentTime += seconds;
  };

  const updatePlaybackRate = (speed: number) => () => {
    const video = videoElement as HTMLVideoElement;
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

  return (
    <>
      {!videoUrl && (
        <input type="file" accept="video/*" onChange={playSelectedFile} />
      )}
      <video
        controls
        ref={videoRef}
        src={videoUrl}
        style={{ display: videoUrl ? 'block' : 'none' }}
        onTimeUpdate={handleTimeUpdate}
      />
      <p>{currentTime}</p>
      {videoUrl && (
        <>
          <p>
            <button onClick={updateCurrentTimeWith(-10)}>-10 second</button>
            <button onClick={updateCurrentTimeWith(-1)}>-1 second</button>
            <button onClick={updateCurrentTimeWith(-1 / FPS)}>-1 frame</button>
            <button onClick={updateCurrentTimeWith(1 / FPS)}>+1 frame</button>
            <button onClick={updateCurrentTimeWith(1)}>+1 second</button>
            <button onClick={updateCurrentTimeWith(10)}>+10 second</button>
          </p>
          <p>
            <button
              onClick={updatePlaybackRate(0.5)}
              className={videoElement.playbackRate == 0.5 ? 'selected' : ''}
            >
              0.5x speed
            </button>
            <button
              onClick={updatePlaybackRate(1)}
              className={videoElement.playbackRate == 1 ? 'selected' : ''}
            >
              normal speed
            </button>
            <button
              onClick={updatePlaybackRate(2)}
              className={videoElement.playbackRate == 2 ? 'selected' : ''}
            >
              {'>>'} 2x speed {'>>'}
            </button>
            <button
              onClick={updatePlaybackRate(10)}
              className={videoElement.playbackRate == 10 ? 'selected' : ''}
            >
              {'>>>'} 10x speed {'>>>'}
            </button>
          </p>
        </>
      )}
    </>
  );
}

export default App;
