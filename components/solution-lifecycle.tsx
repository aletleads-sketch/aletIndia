import Link from "next/link";
import "./solution-lifecycle.css";

export function SolutionLifecycle() {
  return (
    <section className="alc-section" aria-labelledby="alc-heading">
      <div className="alc-container">
        <div className="alc-intro">
          <div className="alc-eyebrow">Alet India Solution</div>
          <h2 className="alc-title" id="alc-heading">
            From first idea
            <br />
            to the <span>
              next
              <br />
              upgrade
            </span>
          </h2>
          <p className="alc-lead">
            A continuous cycle — we build, refine, and raise the bar so your product keeps winning
            in a changing digital world.
          </p>

          <Link href="/contact-us" className="alc-btn">
            Let&apos;s Build Together
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>

          <ul className="alc-stats">
            <li className="alc-stat">
              <strong>9+</strong>
              <span>
                Years
                <br />
                Experience
              </span>
            </li>
            <li className="alc-stat">
              <strong>200+</strong>
              <span>
                Projects
                <br />
                Delivered
              </span>
            </li>
            <li className="alc-stat">
              <strong>98%</strong>
              <span>
                Client
                <br />
                Satisfaction
              </span>
            </li>
          </ul>

          <div className="alc-script" aria-hidden="true">
            Ideas<em>into Impact</em>
            <svg viewBox="0 0 150 30" fill="none">
              <path
                d="M3 26 C45 12 95 6 147 3"
                stroke="#7d72e0"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="alc-steps">
          <svg className="alc-rocket" viewBox="0 0 240 140" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="alcTrail" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#1bb067" stopOpacity="0" />
                <stop offset=".35" stopColor="#1bb067" />
                <stop offset="1" stopColor="#12a07a" />
              </linearGradient>
              <linearGradient id="alcBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#cdd8f4" />
              </linearGradient>
              <linearGradient id="alcBlue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3f7dff" />
                <stop offset="1" stopColor="#1342d2" />
              </linearGradient>
            </defs>
            <path
              d="M8 124 C60 124 110 112 148 82"
              stroke="url(#alcTrail)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path d="M150 80 L139 84 L146 92Z" fill="#12a07a" />
            <path d="M128 70 L112 72" stroke="#1342d2" strokeWidth="3" strokeLinecap="round" />
            <path d="M136 90 L122 98" stroke="#2c66f0" strokeWidth="2.5" strokeLinecap="round" />
            <g transform="translate(188 52) rotate(48)">
              <path d="M-7 44 Q0 66 7 44Z" fill="#8cc7ff" opacity=".85" />
              <path d="M-13 14 L-30 40 L-11 35Z" fill="url(#alcBlue)" />
              <path d="M13 14 L30 40 L11 35Z" fill="url(#alcBlue)" />
              <path
                d="M0 -48 C21 -28 19 18 12 40 L-12 40 C-19 18 -21 -28 0 -48Z"
                fill="url(#alcBody)"
              />
              <path
                d="M0 -48 C10 -40 15 -30 17 -20 L-17 -20 C-15 -30 -10 -40 0 -48Z"
                fill="url(#alcBlue)"
              />
              <path d="M-12 30 L12 30 L12 40 L-12 40Z" fill="url(#alcBlue)" />
              <circle r="9" fill="#1c4ed6" />
              <circle r="5.5" fill="#79bdff" />
            </g>
          </svg>

          <div className="alc-cards">
            <article className="alc-card alc-card--1">
              <span className="alc-num">01</span>
              <div className="alc-icon" aria-hidden="true">
                <svg
                  width="56"
                  height="44"
                  viewBox="0 0 60 46"
                  fill="none"
                  stroke="#1552f0"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 9L4 23l13 14" />
                  <path d="M43 9l13 14-13 14" />
                  <path d="M35 3L25 43" />
                </svg>
              </div>
              <svg className="alc-link" viewBox="0 0 110 70" fill="none" aria-hidden="true">
                <path
                  d="M4 64 C28 42 58 18 84 13"
                  stroke="#2563ff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="12" r="6" fill="#fff" stroke="#2563ff" strokeWidth="2.4" />
                <path d="M96 12 L108 11" stroke="#2563ff" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <h3>Development</h3>
              <p>
                We turn your ideas into robust, scalable and high-performing digital products
                tailored to your business goals.
              </p>
              <ul className="alc-list">
                <li>Requirement analysis &amp; planning</li>
                <li>Modern technology stack</li>
                <li>Clean and scalable architecture</li>
                <li>Quality-driven development</li>
                <li>On-time delivery</li>
              </ul>
              <div className="alc-note">
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  stroke="#1a55e6"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M17 9a7 7 0 0 0-4 12.8V25h8v-3.2A7 7 0 0 0 17 9z" />
                  <path d="M14 28h6M15 16l2 3 2-3M17 2v3M6.5 6.5l2 2M27.5 6.5l-2 2M3 17h3M28 17h3" />
                </svg>
                <span>
                  Turn Ideas
                  <br />
                  Into Reality
                </span>
              </div>
            </article>

            <article className="alc-card alc-card--2">
              <span className="alc-num">02</span>
              <div className="alc-icon" aria-hidden="true">
                <svg width="62" height="62" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="alcGear" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#a35cff" />
                      <stop offset="1" stopColor="#6a2cdb" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#alcGear)"
                    fillRule="evenodd"
                    d="M10.3 1.5h3.4l.5 2.6a8 8 0 0 1 2 .9l2.2-1.5 2.4 2.4-1.5 2.2a8 8 0 0 1 .9 2l2.6.5v3.4l-2.6.5a8 8 0 0 1-.9 2l1.5 2.2-2.4 2.4-2.2-1.5a8 8 0 0 1-2 .9l-.5 2.6h-3.4l-.5-2.6a8 8 0 0 1-2-.9l-2.2 1.5-2.4-2.4 1.5-2.2a8 8 0 0 1-.9-2l-2.6-.5v-3.4l2.6-.5a8 8 0 0 1 .9-2L3.2 5.9l2.4-2.4 2.2 1.5a8 8 0 0 1 2-.9zM12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z"
                  />
                </svg>
              </div>
              <svg className="alc-link" viewBox="0 0 120 90" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="alcL2" x1="0" x2="1">
                    <stop offset="0" stopColor="#7e46ec" />
                    <stop offset="1" stopColor="#3d5ff0" />
                  </linearGradient>
                </defs>
                <path
                  d="M4 84 C24 56 54 30 90 22"
                  stroke="url(#alcL2)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <circle cx="96" cy="20" r="6" fill="#fff" stroke="#3d5ff0" strokeWidth="2.4" />
                <path d="M102 19 L118 15" stroke="#3d5ff0" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <h3>Enhancement</h3>
              <p>
                We continuously improve your product based on user feedback, market trends and new
                opportunities.
              </p>
              <ul className="alc-list">
                <li>Feature enhancements</li>
                <li>Performance optimization</li>
                <li>UI/UX improvements</li>
                <li>Security &amp; reliability upgrades</li>
                <li>Analytics &amp; data-driven improvements</li>
              </ul>
              <div className="alc-note">
                <svg viewBox="0 0 34 34">
                  <rect x="4" y="18" width="6" height="12" rx="2" fill="#7b3fe4" />
                  <rect x="14" y="12" width="6" height="18" rx="2" fill="#7b3fe4" />
                  <rect x="24" y="5" width="6" height="25" rx="2" fill="#7b3fe4" />
                </svg>
                <span>
                  Make Your Product
                  <br />
                  Even Stronger
                </span>
              </div>
            </article>

            <article className="alc-card alc-card--3">
              <span className="alc-num">03</span>
              <div className="alc-icon" aria-hidden="true">
                <svg
                  width="72"
                  height="56"
                  viewBox="0 0 78 60"
                  fill="none"
                  stroke="#14a85a"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M24 50H18A14 14 0 0 1 16 22 20 20 0 0 1 54 18 14 14 0 0 1 60 50h-6" />
                  <path d="M39 52V28M30 37l9-9 9 9" />
                </svg>
              </div>
              <h3>Upgrade</h3>
              <p>
                We help you adopt the latest technology, migrate to modern platforms and scale your
                product for future growth.
              </p>
              <ul className="alc-list">
                <li>Technology upgrades</li>
                <li>Migration &amp; modernization</li>
                <li>Scalability &amp; infrastructure improvements</li>
                <li>Integration with new tools and APIs</li>
                <li>Long-term support &amp; maintenance</li>
              </ul>
              <div className="alc-note">
                <svg
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="#14a85a"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="16" cy="20" r="12" />
                  <circle cx="16" cy="20" r="7" />
                  <circle cx="16" cy="20" r="2" fill="#14a85a" />
                  <path d="M16 20L30 6M25 6h5v5" />
                </svg>
                <span>
                  Stay Ahead
                  <br />
                  with Latest Technology
                </span>
              </div>
            </article>
          </div>

          <ul className="alc-timeline">
            <li>Idea</li>
            <li>Build &amp; Improve</li>
            <li>Scale &amp; Grow</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
