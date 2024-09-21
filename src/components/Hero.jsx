import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { heroVideo, smallHeroVideo } from "../utils";

const Hero = () => {
  //   const renderNo = useRef(0);
  //   renderNo.current++;
  //   console.log(renderNo.current);
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 760 ? smallHeroVideo : heroVideo
  );

  const handleVideoSrcSet = () => {
    if (window.innerWidth < 760) {
      setVideoSrc(smallHeroVideo);
    } else {
      setVideoSrc(heroVideo);
    }
  };

  useGSAP(() => {
    gsap.to(".hero-title", {
      opacity: 1,
      delay: 1.2,
    });

    gsap.to("#call-to-action", {
      opacity: 1,
      y: -50,
      delay: 2.5,
    });
  }, []);

  useEffect(() => {
    //resize event handler in attached to window, now handleVideoSrcSet is fired everytime window is resized
    //handleVideoSrcSet manipulates the state of the component, which causes it to re render
    //so everytime the screen size changes the component re renders
    window.addEventListener("resize", handleVideoSrcSet);
    return () => {
      window.removeEventListener("resize", handleVideoSrcSet);
    };
  }, []);

  return (
    <section className="w-100 nav-height bg-black relative">
      <div className="h-5/6 w-full flex-center flex-col">
        <p className="hero-title">iPhone 15 Pro</p>
        <div className="md:w-10/12 w-9/12">
          <video
            className="pointer-events-none"
            autoPlay
            muted
            playsInline={true}
            key={videoSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>

      <div
        id="call-to-action"
        className="flex flex-col items-center opacity-0 translate-y-20 "
      >
        <a href="#highlights" className="btn">
          Buy
        </a>
        <p className="font-normal text-xl">From $199/month or $999</p>
      </div>
    </section>
  );
};

export default Hero;
