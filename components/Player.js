import { VolumeUpIcon as VolumeDownIcon } from "@heroicons/react/outline";
import { RewindIcon, SwitchHorizontalIcon,FastForwardIcon,PlayIcon,PauseIcon,ReplyIcon,VolumeUpIcon } from "@heroicons/react/solid";
;
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";
import debounce from "debounce";

const Player = () => {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);
  const songInfo = useSongInfo();
  const handlePlayPause= ()=>{
    spotifyApi.getMyCurrentPlaybackState().then(data=>{
      if(data.body.is_playing){
        spotifyApi.pause();
        setIsPlaying(false)
      }else{
        spotifyApi.play();
        setIsPlaying(true)
      }
    })
  }
  const fecthCurrentSong = () => {
    if (!songInfo) {
      spotifyApi
        .getMyCurrentPlayingTrack()
        .then((data) => setCurrentTrackId(data.body?.item?.id));
      spotifyApi
        .getMyCurrentPlaybackState()
        .then((data) => setIsPlaying(data.body?.is_playing));
    }
  };

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fecthCurrentSong();
      setVolume(50);
    }
  }, [currentTrackIdState, spotifyApi, session]);
  useEffect(()=>{
      if(volume>0 && volume<100){
        debounceAdjustVolume(volume)
      }
  },[volume])
    const debounceAdjustVolume = useCallback(
      debounce(volume=>{
    spotifyApi.setVolume(volume)
  },500),[]
  )
  
  return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-10 w-10"
          src={songInfo?.album?.images?.[0]?.url}
          alt="music image"
        />
        <div>
          <h3>{songInfo?.name || `song name`}</h3>
          <p>{songInfo?.artists?.[0]?.name || `artistes name`}</p>
        </div>
      </div>
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon className="button" />
        {isPlaying ? (
          <PauseIcon 
          onClick={handlePlayPause}
          className="button w-10 h-10" />
        ) : (
          <PlayIcon 
          onClick={handlePlayPause}
          className="button w-10 h-10
          " />
        )}
        <FastForwardIcon 
        
        className="button "/>
        <ReplyIcon className="button"/>
      </div>
      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeDownIcon className="button" 
        onClick={()=>volume>0&&setVolume(volume - 10)}/>
        <input type="range" className="w-14 md:w-28" min={0} max={100} defaultValue={volume} 
        onClick={(e)=>setVolume(Number(e.target.value))}/>
        <VolumeUpIcon className="button" onClick={()=>volume<100 &&setVolume(volume+10)}/>
      </div>
    </div>
  );
};

export default Player;
