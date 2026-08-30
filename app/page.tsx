"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const album = "OLAK5uy_mqpP20VLRL8EortHj32fqKtJmFqDMJ5eo";
const film = "https://archive.org/download/TheLostWorldCompleteVideoQualityUpgrade/TheLostWorldCompleteVideoQualityUpgrade.mp4";
type Player = { playVideo(): void; pauseVideo(): void; playVideoAt(index: number): void; setLoop(value: boolean): void; destroy(): void };
type YouTube = { Player: new (element: HTMLElement, options: Record<string, unknown>) => Player };

export default function Home() {
  const video = useRef<HTMLVideoElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const music = useRef<Player | null>(null);
  const active = useRef(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("Preparing the album player…");
  const [filmError, setFilmError] = useState(false);

  useEffect(() => {
    const win = window as unknown as { YT?: YouTube; onYouTubeIframeAPIReady?: () => void };
    let disposed = false;
    let player: Player | undefined;
    const timer = window.setTimeout(() => setMessage("The album is taking a while to load. Check your connection or content blocker, then reload."), 20000);
    const setup = () => {
      if (disposed || !mount.current || !win.YT || player) return;
      const slot = document.createElement("div");
      mount.current.appendChild(slot);
      player = new win.YT.Player(slot, {
        width: "100%", height: "250",
        playerVars: { listType: "playlist", list: album, loop: 1, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            if (disposed) return;
            clearTimeout(timer);
            music.current = player!;
            player!.setLoop(true);
            setReady(true);
            setMessage("Ready. Start the pairing, then settle in.");
          },
          onError: () => {
            clearTimeout(timer);
            active.current = false;
            video.current?.pause();
            setPlaying(false);
            setMessage("YouTube could not play this album here. Availability can vary by region or account. Try the album source below.");
          },
          onAutoplayBlocked: () => {
            video.current?.pause();
            setPlaying(false);
            setMessage("Tap Play inside the album player, then Resume pairing. Your browser needs that extra tap for sound.");
          },
        },
      });
    };
    if (win.YT?.Player) setup();
    else {
      win.onYouTubeIframeAPIReady = setup;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.onerror = () => setMessage("The album player could not load. Check your connection or content blocker and reload.");
        document.head.appendChild(script);
      }
    }
    return () => { disposed = true; clearTimeout(timer); player?.destroy(); music.current = null; };
  }, []);

  function play(restart = false) {
    const screen = video.current;
    if (!screen || !music.current) return;
    active.current = true;
    screen.muted = true;
    if (restart || !started) {
      screen.currentTime = 0;
      music.current.playVideoAt(0);
    } else music.current.playVideo();
    screen.play().catch(() => {
      if (!active.current) return;
      music.current?.pauseVideo();
      setPlaying(false);
      setMessage("The movie could not start. Use its Play control or try Restart pairing.");
    });
    setStarted(true);
    setPlaying(true);
    setMessage("Playback requested for both players. If music is silent, tap Play in the album player. Ads and buffering can shift the pairing.");
  }
  function pause() {
    active.current = false;
    video.current?.pause();
    music.current?.pauseVideo();
    setPlaying(false);
    setMessage("Both players paused. Resume keeps your position; Restart begins both again.");
  }

  return (
    <main>
      <header><a className="wordmark" href="./" aria-label="Syncord home">SYNC<span>ORD</span><i>↗</i></a><p>ALTERNATIVE SOUNDTRACK CINEMA</p><span className="edition">PAIRING 001</span></header>
      <section className="intro"><div><p className="eyebrow">1925 PICTURE · 1977 SOUND</p><h1>A LOST WORLD.<br/><em>A NEW FREQUENCY.</em></h1></div><p className="intro-note">An expedition into the unexpected.<br/>The Lost World × Book of Dreams.</p></section>
      <section className="theater" aria-label="Movie and album players">
        <div className="film-panel"><div className="panel-label"><span>01 / THE PICTURE</span><span>ORIGINAL AUDIO MUTED</span></div>
          <video ref={video} src={film} controls muted playsInline preload="metadata" aria-label="The Lost World, 1925, muted film" onVolumeChange={() => { if (video.current) video.current.muted = true; }} onError={() => { setFilmError(true); pause(); }} onEnded={() => { pause(); setMessage("The expedition is over. Restart to explore the pairing again."); }} />
          {filmError && <p className="error" role="alert">The Archive movie could not load. Try reloading, or check the film source below. Nothing has been uploaded.</p>}
          <div className="film-caption"><div><p className="eyebrow">HARRY O. HOYT / 1925</p><h2>The Lost World</h2></div><p>76 MIN<br/>SILENT ADVENTURE</p></div>
        </div>
        <aside><div className="panel-label"><span>02 / THE SOUND</span><span className="loop">↻ ALBUM REPEAT</span></div><div className="sound-content"><p className="eyebrow">STEVE MILLER BAND / 1977</p><h2>Book of<br/>Dreams</h2><div className="album-player" ref={mount} aria-label="Book of Dreams YouTube album player"/><div className="controls"><Button className="start" disabled={!ready || filmError} onClick={() => playing ? pause() : play()}>{playing ? "Ⅱ Pause pairing" : started ? "▶ Resume pairing" : "▶ Start pairing"}</Button><Button className="restart" variant="outline" disabled={!ready || filmError} onClick={() => play(true)}>↻ Restart</Button></div><p className="status" role="status">{message}</p><p className="fine">Use the pairing buttons for both players. Their individual controls work separately. The album is set to loop; this is an experimental pairing, not frame-locked synchronization.</p></div></aside>
      </section>
      <section className="notes" aria-label="Curator notes"><article><p className="eyebrow">THE CURATOR’S PICK</p><h3>Wonder meets wanderlust.</h3><p>I chose this expedition’s strange landscapes and stop-motion creatures for the album’s mix of drifting textures and driving rock. Look for accidental connections—not a pre-scripted match.</p></article><article><p className="eyebrow">THE WAY TO WATCH</p><h3>Picture quiet. Dreams loud.</h3><p>Start from the beginning of both. The film stays muted, the full album playlist repeats, and everything plays here. No file uploads or Archive-player double tap.</p></article><article><p className="eyebrow">THE ORIGINAL SOURCES</p><h3>Two works. One experiment.</h3><p><a href="https://archive.org/details/TheLostWorldCompleteVideoQualityUpgrade" target="_blank" rel="noreferrer">Film on Internet Archive ↗</a><br/><a href={`https://www.youtube.com/playlist?list=${album}`} target="_blank" rel="noreferrer">Album on YouTube ↗</a></p><p>Archive lists this film copy as public domain. Music remains in YouTube’s player, with its availability and advertising rules.</p></article></section>
      <footer><span>SYNCORD</span><p>Different decades. Unexpected company.</p><span>CURATED PAIRING / 001</span></footer>
    </main>
  );
}
