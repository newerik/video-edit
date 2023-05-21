import { ChangeEventHandler, Ref, useState } from 'react';
import useRefCallback from './useRefCallback';

function useVideoFile() {
  const [ref, videoElement] = useRefCallback<HTMLVideoElement>();
  const elem = videoElement as HTMLVideoElement;
  const [video, setVideo] = useState<{
    name: string;
    url: string;
  }>({ name: '', url: '' });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const { files } = target;
    if (!files) return;
    const file = files[0];
    const { name, type } = file;
    const canPlay = elem.canPlayType(type);
    if (!canPlay) {
      console.error('Video type cannot be played!');
      return;
    }

    const url = window.URL.createObjectURL(file);
    setVideo({ name, url });
  };
  return [
    { ...video, ref, elem } as {
      ref: Ref<HTMLVideoElement>;
      elem: HTMLVideoElement;
      name: string;
      url: string;
    },
    handleInputChange,
  ];
}

export default useVideoFile;
