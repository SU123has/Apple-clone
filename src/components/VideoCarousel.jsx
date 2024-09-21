import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {
  const videoRef = useRef([]); //has DOM reference to every video
  const videoSpanRef = useRef([]); //use to animate the progress bar
  const videoDivRef = useRef([]); // use to set the width of the video while its playing

  const [video, setVideo] = useState({
    isEnd: false, //checks if the current video has finished so to move to next video
    startPlay: false, //use to start the video carousel when it enter the view
    videoId: 0, // use to track the index of currently playing video, intially 0
    isLastVideo: false, // use to check if the video is the last video in the carousel
    isPlaying: false, // use to control the playback of the current video (play, pause)
  });

  //gsap animation to play video when it is in view
  useGSAP(() => {
    //slider animation to move the video and bring the next video to screen
    gsap.to("#slider", {
      transform: `translateX(${-100 * video.videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    //when animation to play the video is in view
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none", //restart animation when entered in the view again
      },
      onComplete: () => {
        setVideo((prevVideo) => ({
          ...prevVideo,
          startPlay: true, //starts the video carousel
          isPlaying: true, //starts the video
        }));
      },
    });
  }, [video.isEnd, video.videoId]); //this animatiuon should re run if the videoID changes or if the carousel ends

  //this state is use to track the metadata loading events of the video, this ensures that actions like play/pause or updating UI are performed only once the required metadata has been loaded
  const [loadedData, setLoadedData] = useState([]);

  //sets the loaded metadata recieved into state updater function of loadedData
  const handleLoadedMetaData = (index, event) =>
    setLoadedData((pre) => [...pre, event]);

  useEffect(() => {
    //deals with playing of the video
    //once all the metadata of all videos have been loaded, play/ pause actions are to be performed
    if (loadedData.length > 3) {
      if (!video.isPlaying) {
        videoRef.current[video.videoId].pause();
      } else {
        video.startPlay && videoRef.current[video.videoId].play();
      }
    }
  }, [video.startPlay, video.videoId, video.isPlaying, video.loadedData]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current; //returns an array

    if (span[video.videoId]) {
      //animate the progress of the video in span
      let anim = gsap.to(span[video.videoId], {
        //onUpdate() is called on every frame till progress reaches 1
        onUpdate: () => {
          //get the progress of the video
          const progress = Math.ceil(anim.progress() * 100); //returns progress in percentage
          if (progress != currentProgress) {
            currentProgress = progress;
          }
          //set the width of the progress bar
          gsap.to(videoDivRef.current[video.videoId], {
            width:
              window.innerWidth < 760
                ? "10vw" //mobile
                : window.innerWidth < 1200
                  ? "10vw" //tablet
                  : "4vw", //laptop
          });

          //set the width and background color of the progress bar
          gsap.to(span[video.videoId], {
            width: `${currentProgress}%`,
            backgroundColor: "white",
          });
        },

        //when the video ends, replace the progress bar with an indicator and change the background color
        //onComplete is called when progress = 1
        onComplete: () => {
          if (video.isPlaying) {
            gsap.to(videoDivRef.current[video.videoId], {
              width: "12px",
            });
            gsap.to(span[video.videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (video.videoId === 0) {
        anim.restart();
      }

      //calculates the progress
      const animUpdate = () => {
        anim.progress(
          videoRef.current[video.videoId].currentTime /
            hightlightsSlides[video.videoId].videoDuration
        );
      };

      if (video.isPlaying) {
        //ticker to update the progress bar
        //amimUpdate functions runs on every animation frame till progress < 1

        gsap.ticker.add(animUpdate);
      } else {
        //remove the ticker when the video is paused (progress bar is stopped)

        gsap.ticker.remove(animUpdate);
      }
    }
  }, [video.videoId, video.startPlay]);

  //handles play/pause/resume/end/reset logic for the videos
  const handleProcess = (type, index) => {
    switch (type) {
      case "video-end":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isEnd: true,
          videoId: index + 1,
        }));
        break;

      case "video-last":
        setVideo((prevVideo) => ({ ...prevVideo, isLastVideo: true }));
        break;

      case "video-reset":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isLastVideo: false,
          videoId: 0,
        }));
        break;

      case "play":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));
        break;

      case "pause":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));

      default:
        return video;
    }
  };

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, index) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10 relative">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                {/* use of callback refs to get the reference of DOM element of video */}
                <video
                  id="video"
                  className={`${list.id === 2 && "translate-x-44"} pointer-events-none`}
                  playsInline={true}
                  muted
                  preload="auto"
                  ref={(ele) => (videoRef.current[index] = ele)} //passing the ref to useRef as soon as component mounts
                  onPlay={() => {
                    setVideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }));
                  }}
                  onLoadedMetadata={(event) =>
                    handleLoadedMetaData(index, event)
                  }
                  onEnded={() =>
                    index !== 3
                      ? handleProcess("video-end", index)
                      : handleProcess("video-last")
                  }
                >
                  <source src={list.video} />
                </video>
              </div>
            </div>

            <div className="absolute top-12 left-[5%] z-10">
              {list.textLists.map((text) => (
                <p
                  key={text}
                  className="md:text-2xl text-xl sm:text-sm font-medium"
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-7 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, index) => (
            <span
              key={index}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(ele) => (videoDivRef.current[index] = ele)} //progressbar of a video
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(ele) => (videoSpanRef.current[index] = ele)} //progress in progress bar
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          <img
            src={
              video.isLastVideo
                ? replayImg
                : !video.isPlaying
                  ? playImg
                  : pauseImg
            }
            alt={
              video.isLastVideo ? "reply" : !video.isPlaying ? "play" : "pause"
            }
            onClick={
              video.isLastVideo
                ? () => handleProcess("video-reset")
                : !video.isPlaying
                  ? () => handleProcess("play")
                  : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
