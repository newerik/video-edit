import { ChangeEvent, Ref, useState } from 'react';
import Big from 'big.js';
import useForceUpdate from './hooks/useForceUpdate';
import useVideoFile from './hooks/useVideoFile';
import secToFfmpegTime from './libs/secToFfmpegTime';

const FPS = 50;

function App() {
  const forceUpdate = useForceUpdate();
  const [video, handleVideoInputChange] = useVideoFile();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeStamps, setTimeStamps] = useState<number[]>([]);
  const [sourceFolder, setSourceFolder] = useState<string>('');
  const [targetFolder, setTargetFolder] = useState<string>('');

  const handleInputChange = (setter: any) => (event: ChangeEvent) => {
    setter(event.target.value);
  };

  const handleTimeUpdate = () => {
    let currentTime = Big(video.elem.currentTime);
    const leftOver = currentTime.mod(Big(1).div(Big(FPS)));
    if (leftOver.toNumber() < 1 / FPS / 2) {
      currentTime = currentTime.minus(leftOver);
    } else {
      currentTime = currentTime.plus(Big(1).div(Big(FPS)).minus(leftOver));
    }
    setCurrentTime(Big(currentTime).toNumber());
  };

  const updateCurrentTime = (seconds: number) => () => {
    video.elem.currentTime = seconds;
  };

  const updateCurrentTimeWith = (seconds: number) => () => {
    video.elem.currentTime += seconds;
  };

  const updatePlaybackRate = (speed: number) => () => {
    if (video.elem.playbackRate != speed) {
      video.elem.playbackRate = speed;
      forceUpdate();
      return;
    }
    if (video.elem.paused) {
      video.elem.play();
    } else {
      video.elem.pause();
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
      {!video.url && (
        <input type="file" accept="video/*" onChange={handleVideoInputChange} />
      )}
      <video
        controls
        ref={video.ref as Ref<HTMLVideoElement>}
        src={video.url}
        style={{ display: video.url ? 'block' : 'none' }}
        onTimeUpdate={handleTimeUpdate}
      />
      {video.url && (
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
              className={video.elem.playbackRate == 0.5 ? 'red' : ''}
            >
              0.5x speed
            </button>
            <button
              onClick={updatePlaybackRate(1)}
              className={video.elem.playbackRate == 1 ? 'red' : ''}
            >
              normal speed
            </button>
            <button
              onClick={updatePlaybackRate(2)}
              className={video.elem.playbackRate == 2 ? 'red' : ''}
            >
              {'>>'} 2x speed {'>>'}
            </button>
            <button
              onClick={updatePlaybackRate(10)}
              className={video.elem.playbackRate == 10 ? 'red' : ''}
            >
              {'>>>'} 10x speed {'>>>'}
            </button>
          </p>
          <div>
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
                        {secToFfmpegTime(stamp)}
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="red" onClick={removeAllTimeStamps}>
                  Clear all Timestamps
                </button>
              </>
            )}
          </div>
          <p>
            {timeStamps.length == 2 ? (
              <>
                Source folder:
                <input
                  value={sourceFolder}
                  onChange={handleInputChange(setSourceFolder)}
                />
                Target folder:
                <input
                  value={targetFolder}
                  onChange={handleInputChange(setTargetFolder)}
                />
                Ffmpeg command:
                <input
                  readOnly
                  value={`ffmpeg -accurate_seek -i "${sourceFolder}${
                    video.name
                  }" -ss ${secToFfmpegTime(
                    timeStamps[0]
                  )} -to ${secToFfmpegTime(
                    timeStamps[1]
                  )} -c copy "${targetFolder}cut_${video.name}"`}
                />
              </>
            ) : (
              'There must be two timestamps in order to cut'
            )}
          </p>
        </>
      )}
    </>
  );
}

export default App;
