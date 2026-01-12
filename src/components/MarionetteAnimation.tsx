"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import "./MarionetteAnimation.css";

interface MarionetteAnimationProps {
  onAnimationEnd: () => void;
}

export default function MarionetteAnimation({ onAnimationEnd }: MarionetteAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoaded = useRef(0);
  const initialized = useRef(false);
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;

  const initAnimation = () => {
    if (initialized.current) return;
    if (scriptsLoaded.current < 3) return;
    if (typeof window === "undefined") return;

    const gsap = (window as unknown as { gsap: unknown }).gsap as {
      registerPlugin: (plugin: unknown) => void;
      set: (target: unknown, vars: object) => void;
      to: (target: unknown, vars: object) => void;
      timeline: (vars?: object) => { to: (target: unknown, vars: object) => void; kill: () => void };
    };
    const ScrollTrigger = (window as unknown as { ScrollTrigger: unknown }).ScrollTrigger;
    const Splitting = (window as unknown as { Splitting: () => void }).Splitting;

    if (!gsap || !ScrollTrigger || !Splitting) return;

    initialized.current = true;

    Splitting();
    gsap.set('.blurb', { visibility: 'visible' });
    gsap.registerPlugin(ScrollTrigger);
    window.scrollTo(0, 0);

    const NOSE = document.querySelector('.marionette__nose');
    const CONTAINER = document.querySelector('.marionette__container');

    gsap.set(CONTAINER, { transformOrigin: '50% 50%', scale: 0 });

    const INC = 100;
    const PADDING = 200;

    const BLURB_ONE = [...document.querySelectorAll('.blurb--one .word')];
    const BLURB_TWO = [...document.querySelectorAll('.blurb--two .word')];
    const BLURB_THREE = [...document.querySelectorAll('.blurb--three .word')];
    const BLURB_FOUR = [...document.querySelectorAll('.blurb--four .word')];

    const BUFF_ONE = PADDING;

    BLURB_ONE.forEach((word, index) => {
      gsap.to(word, {
        scrollTrigger: {
          scrub: true,
          start: () => BUFF_ONE + index * INC,
          end: () => BUFF_ONE + index * INC + INC,
        },
        opacity: 0,
      });
    });

    const BUFF_TWO = BLURB_ONE.length * INC + INC + PADDING;
    BLURB_TWO.forEach((word, index) => {
      gsap.to(word, {
        scrollTrigger: {
          scrub: true,
          start: () => BUFF_TWO + index * INC,
          end: () => BUFF_TWO + index * INC + INC,
        },
        opacity: 1,
      });
    });

    gsap.to(CONTAINER, {
      scale: 1,
      scrollTrigger: {
        scrub: true,
        start: () => BUFF_TWO,
        end: () => BUFF_TWO + BLURB_TWO.length * INC + INC,
      },
    });

    const BUFF_THREE = BUFF_TWO + BLURB_TWO.length * INC + INC + PADDING;
    BLURB_TWO.forEach((word, index) => {
      gsap.to(word, {
        scrollTrigger: {
          scrub: true,
          start: () => BUFF_THREE + index * INC,
          end: () => BUFF_THREE + index * INC + INC,
        },
        opacity: 0,
      });
    });

    const BUFF_FOUR = BUFF_THREE + BLURB_TWO.length * INC + INC;
    BLURB_THREE.forEach((word, index) => {
      gsap.to(word, {
        scrollTrigger: {
          scrub: true,
          start: () => BUFF_FOUR + index * INC,
          end: () => BUFF_FOUR + index * INC + INC,
        },
        opacity: 1,
      });
    });

    const BUFF_FIVE = BUFF_FOUR + BLURB_THREE.length * INC + INC + PADDING;

    gsap.to(NOSE, {
      width: '75vmin',
      scrollTrigger: {
        scrub: true,
        start: () => BUFF_FOUR,
        end: () => BUFF_FIVE + BLURB_FOUR.length * INC + INC,
      },
    });

    BLURB_FOUR.forEach((word, index) => {
      gsap.to(word, {
        opacity: 1,
        scrollTrigger: {
          scrub: true,
          start: () => BUFF_FIVE + index * INC,
          end: () => BUFF_FIVE + index * INC + INC,
        },
      });
    });

    const END_PADDING = 800;
    const totalHeight = BUFF_FIVE + BLURB_FOUR.length * INC + INC + END_PADDING + window.innerHeight;
    document.body.style.height = `${totalHeight}px`;

    // Trigger form when scrolled to end
    const endTrigger = document.createElement('div');
    endTrigger.className = 'end-trigger';
    document.body.appendChild(endTrigger);

    (ScrollTrigger as { create: (config: object) => void }).create({
      trigger: endTrigger,
      start: () => BUFF_FIVE + BLURB_FOUR.length * INC + END_PADDING,
      onEnter: () => {
        onAnimationEndRef.current();
      },
    });
  };

  const handleScriptLoad = () => {
    scriptsLoaded.current++;
    if (scriptsLoaded.current === 3) {
      setTimeout(initAnimation, 100);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.height = '';
    };
  }, []);

  return (
    <>
      <Script
        src="https://unpkg.com/splitting/dist/splitting.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/gsap@3/dist/gsap.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/gsap@3/dist/ScrollTrigger.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/splitting/dist/splitting.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/splitting/dist/splitting-cells.css"
      />

      <div className="marionette-page" ref={containerRef}>
        <div className="marionette__container">
          <img
            src="/pollastre.png"
            alt="Pollastre de gala"
            className="pollastre"
          />
          <div className="marionette__nose"></div>
        </div>

        <div className="story">
          <div className="story__content story__content--top">
            <h1 className="blurb blurb--one" data-splitting="">Avui no surto mama,</h1>
            <h1 className="blurb blurb--three" data-splitting="">Beure? Noooo...</h1>
          </div>
          <div className="story__content story__content--bottom">
            <h1 className="blurb blurb--two" data-splitting="">només vaig a el &quot;huerto&quot;.</h1>
            <h1 className="blurb blurb--four" data-splitting="">Avui nit tranquileta, zero alcohol!</h1>
          </div>
        </div>
      </div>
    </>
  );
}
