import { ChangeEventHandler, useState } from 'react';
import useRefCallback from './hooks/useRefCallback';

function App() {
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
        onTimeUpdate={() =>
          setCurrentTime((videoElement as HTMLVideoElement).currentTime)
        }
      />
      {currentTime}
    </>
  );
}

export default App;
