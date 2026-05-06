"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSequenceCanvas } from "./components/ScrollSequenceCanvas";

function useNavVisibility() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = 40;
      setVisible(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

type SectionId = "overview" | "switches" | "performance" | "specs" | "buy";

export default function HomePage() {
  const navVisible = useNavVisibility();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  // rAF-driven scroll → progress mapping for buttery updates
  useEffect(() => {
    let frameId: number;

    const update = () => {
      const container = sectionRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalScroll = rect.height - windowHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
        const nextProgress = totalScroll > 0 ? scrolled / totalScroll : 0;
        setProgress(nextProgress);
      }

      frameId = window.requestAnimationFrame(update);
    };

    frameId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const heroRange = [0, 0.18];
  const engineeringRange = [0.18, 0.4];
  const switchesRange = [0.4, 0.65];
  const performanceRange = [0.65, 0.87];
  const ctaRange = [0.87, 1];

  const heroActive = isInRange(progress, heroRange);
  const engineeringActive = isInRange(progress, engineeringRange);
  const switchesActive = isInRange(progress, switchesRange);
  const performanceActive = isInRange(progress, performanceRange);
  const ctaActive = isInRange(progress, ctaRange);

  // Track which section is active for navbar highlighting
  useEffect(() => {
    if (heroActive) {
      setActiveSection("overview");
    } else if (engineeringActive) {
      setActiveSection("switches");
    } else if (switchesActive) {
      setActiveSection("performance");
    } else if (performanceActive) {
      setActiveSection("specs");
    } else if (ctaActive) {
      setActiveSection("buy");
    }
  }, [heroActive, engineeringActive, switchesActive, performanceActive, ctaActive]);

  return (
    <>
      <header className="nav">
        <div className={`nav-inner ${navVisible ? "nav-inner--visible" : ""}`}>
          <div className="nav-title">KX-01 MECHANICAL KEYBOARD</div>
          <nav className="nav-links">
            <a
              href="#overview"
              className={`nav-link ${
                activeSection === "overview" ? "nav-link--active" : ""
              }`}
            >
              Overview
            </a>
            <a
              href="#switches"
              className={`nav-link ${
                activeSection === "switches" ? "nav-link--active" : ""
              }`}
            >
              Switches
            </a>
            <a
              href="#performance"
              className={`nav-link ${
                activeSection === "performance" ? "nav-link--active" : ""
              }`}
            >
              Performance
            </a>
            <a
              href="#specs"
              className={`nav-link ${
                activeSection === "specs" ? "nav-link--active" : ""
              }`}
            >
              Specs
            </a>
            <a
              href="#buy"
              className={`nav-link ${
                activeSection === "buy" ? "nav-link--active" : ""
              }`}
            >
              Buy
            </a>
          </nav>
          <button className="nav-cta">Experience KX-01</button>
        </div>
      </header>

      <main>
        <section ref={sectionRef} className="scroll-section" id="overview">
          <div className="scroll-section-inner">
            <ScrollSequenceCanvas progress={progress} />

            <div className="sequence-overlay">
              <div className="sequence-text-blocks">
                {/* 0–15% Hero */}
                <div
                  className={`sequence-text sequence-text--center ${
                    heroActive ? "sequence-text--active" : ""
                  }`}
                >
                  <div className="hero-tagline">KX-01 MECHANICAL KEYBOARD</div>
                  <h1 className="hero-headline">Precision, perfected.</h1>
                  <p className="hero-subheadline">
                    Engineered for speed, built for control. A flagship matte black
                    mechanical keyboard designed for creators, coders, and competitors.
                  </p>
                  <div className="hero-cta-row">
                    <button className="hero-cta-primary">Experience KX-01</button>
                    <button className="hero-cta-secondary">See full specs</button>
                  </div>
                </div>

                {/* 15–40% Engineering Reveal */}
                <div
                  className={`sequence-text sequence-text--left ${
                    engineeringActive ? "sequence-text--active" : ""
                  }`}
                  id="switches"
                >
                  <h2 className="sequence-text-title">
                    Precision-engineered for performance.
                  </h2>
                  <p className="sequence-text-subtitle">
                    Every layer is tuned for speed, control, and consistency.
                  </p>
                  <div className="sequence-text-body">
                    <p>
                      Custom mechanical switches, reinforced plate design, and optimized key
                      travel deliver unmatched responsiveness.
                    </p>
                    <p>
                      Every component is calibrated for stability, durability, and repeatable
                      precision—keystroke after keystroke.
                    </p>
                  </div>
                </div>

                {/* 40–65% Switches & Input System */}
                <div
                  className={`sequence-text sequence-text--right ${
                    switchesActive ? "sequence-text--active" : ""
                  }`}
                  id="performance"
                >
                  <h2 className="sequence-text-title">Engineered keystrokes, redefined.</h2>
                  <div className="sequence-text-body">
                    <p>Precision-tuned mechanical switches for tactile accuracy.</p>
                    <p>Stabilized larger keys for consistent feedback and feel.</p>
                    <p>Instant response—every press, every time.</p>
                  </div>
                </div>

                {/* 65–85% Performance & Build Quality */}
                <div
                  className={`sequence-text sequence-text--left ${
                    performanceActive ? "sequence-text--active" : ""
                  }`}
                  id="specs"
                >
                  <h2 className="sequence-text-title">
                    Built for speed. Designed for feel.
                  </h2>
                  <p className="sequence-text-subtitle">
                    A high-performance architecture for ultra-low latency and refined
                    acoustics.
                  </p>
                  <div className="sequence-text-body">
                    <p>
                      Layered foam, precision-milled plate, and dampened case design shape a
                      controlled, satisfying typing sound.
                    </p>
                    <p>
                      PCB traces, hot-swap sockets, and premium materials come together for a
                      build that feels as solid as it looks.
                    </p>
                  </div>
                </div>

                {/* 85–100% Reassembly + CTA */}
                <div
                  className={`sequence-text sequence-text--center ${
                    ctaActive ? "sequence-text--active" : ""
                  }`}
                  id="buy"
                >
                  <h2 className="sequence-text-title">Control every keystroke.</h2>
                  <p className="sequence-text-subtitle">
                    KX-01. Built for precision, crafted for performance.
                  </p>
                  <div className="hero-cta-row">
                    <button className="hero-cta-primary">Experience KX-01</button>
                    <button className="hero-cta-secondary">See full specs</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="credits-section">
          <div className="credits-inner">
            <h3 className="credits-title">Experimental experience</h3>
            <p className="credits-body">
              This is an experimental scrollytelling prototype built to explore cinematic
              product storytelling on the web. Frames are generated and composited using
              Veo, then driven in real time by scroll.
            </p>
            <p className="credits-body">
              Do not treat this as a final product site. Visuals, performance, and
              interaction details may change without notice.
            </p>
            <p className="credits-meta">Visual sequence credits: Veo</p>
          </div>
        </section>

        <footer className="footer">
          <p>KX-01 Mechanical Keyboard · Concept scrollytelling experience</p>
        </footer>
      </main>
    </>
  );
}

function isInRange(value: number, [start, end]: [number, number]) {
  return value >= start && value < end;
}
