import React, { useState, useEffect, useRef, useCallback } from 'react';

// ------------------------------------------------------------
// Main App Component
// ------------------------------------------------------------
const SafeAlertApp = () => {
  // State variables
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countersStarted, setCountersStarted] = useState({
    hero24: false, hero3: false, hero100: false,
    stat5000: false, stat1200: false, stat98: false, stat180: false
  });

  // References for counter elements
  const heroCounters = useRef([]);
  const statCounters = useRef([]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation function
  const animateCounter = useCallback((el, target) => {
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }, []);

  // Intersection Observer for scroll reveals and counters
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Trigger counters inside this element
          const counters = entry.target.querySelectorAll('.count');
          counters.forEach(counterEl => {
            const target = parseInt(counterEl.dataset.target);
            if (target && !counterEl.classList.contains('animated')) {
              counterEl.classList.add('animated');
              animateCounter(counterEl, target);
            }
          });
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    // Initial trigger for hero counters
    setTimeout(() => {
      const heroCounts = document.querySelectorAll('.hero-content .count');
      heroCounts.forEach(el => {
        const target = parseInt(el.dataset.target);
        if (target && !el.classList.contains('animated')) {
          el.classList.add('animated');
          animateCounter(el, target);
        }
      });
      
      const statCounts = document.querySelectorAll('.stats-section .count');
      statCounts.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && !el.classList.contains('animated')) {
          el.classList.add('animated');
          const target = parseInt(el.dataset.target);
          if (target) animateCounter(el, target);
        }
      });
    }, 400);

    return () => observer.disconnect();
  }, [animateCounter]);

  // Smooth scroll for anchor links
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="safealert-app">
      {/* Global Styles */}
      <GlobalStyles />
      
      {/* Navbar */}
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <a href="#home" className="nav-logo" onClick={(e) => handleSmoothScroll(e, '#home')}>
            <div className="nav-logo-icon">🛡️</div>
            <span className="nav-logo-text">ResQNet</span>
          </a>
          <div className="nav-links">
            <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')} className="active">Features</a>
            <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')}>How It Works</a>
            <a href="#tech" onClick={(e) => handleSmoothScroll(e, '#tech')}>Tech Stack</a>
            <a href="#emergency-types" onClick={(e) => handleSmoothScroll(e, '#emergency-types')}>Emergency Types</a>
          </div>
          <div className="nav-cta">
            <a href="/login" className="btn btn-outline" style={{padding:'9px 18px',fontSize:'13px'}}>Login</a>
            <a href="/register" className="btn btn-red" style={{padding:'9px 18px',fontSize:'13px'}}>Get Started</a>
          </div>
          <div className="hamburger" onClick={toggleMobileMenu}>
            <span></span><span></span><span></span>
          </div>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Features</a>
          <a href="#how-it-works" onClick={(e) => handleSmoothScroll(e, '#how-it-works')}>How It Works</a>
          <a href="#tech" onClick={(e) => handleSmoothScroll(e, '#tech')}>Tech Stack</a>
          <a href="#emergency-types" onClick={(e) => handleSmoothScroll(e, '#emergency-types')}>Emergency Types</a>
          <a href="/login" className="btn btn-outline">Login</a>
          <a href="/register" className="btn btn-red">Get Started</a>
        </div>
      </nav>

      {/* Ticker Bar */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          <span>Real-Time SOS Alert</span>
          <span>Live GPS Tracking</span>
          <span>Ambulance Dispatch</span>
          <span>Emergency Chat</span>
          <span>Blood Donor Finder</span>
          <span>Hospital Bed Status</span>
          <span>Shake to SOS</span>
          <span>Voice Activation</span>
          <span>QR Medical Card</span>
          <span>Disaster Alerts</span>
          <span>Real-Time SOS Alert</span>
          <span>Live GPS Tracking</span>
          <span>Ambulance Dispatch</span>
          <span>Emergency Chat</span>
          <span>Blood Donor Finder</span>
          <span>Hospital Bed Status</span>
          <span>Shake to SOS</span>
          <span>Voice Activation</span>
          <span>QR Medical Card</span>
          <span>Disaster Alerts</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">🚨 Emergency Response Platform</div>
              <h1 className="hero-title">
                <div>ONE TAP.</div>
                <div className="line-red">SAVE A</div>
                <div className="line-blue">LIFE.</div>
              </h1>
              <p className="hero-desc">
                ResQNet is a real-time emergency response platform that connects victims with responders instantly. One press of SOS alerts contacts, dispatches help, and tracks everything live.
              </p>
              <div className="hero-actions">
                <a href="/register" className="btn btn-red">🛡️ Get Protected Now</a>
                <a href="#features" className="btn btn-outline" onClick={(e) => handleSmoothScroll(e, '#features')}>Explore Features</a>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-val"><span className="count" data-target="24">0</span><span>+</span></div>
                  <div className="hero-stat-label">Features</div>
                </div>
                <div>
                  <div className="hero-stat-val"><span className="count" data-target="3">0</span><span> sec</span></div>
                  <div className="hero-stat-label">SOS Trigger</div>
                </div>
                <div>
                  <div className="hero-stat-val"><span className="count" data-target="100">0</span><span>%</span></div>
                  <div className="hero-stat-label">Real-Time</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hero-visual">
              <div style={{position:'relative'}}>
                <div className="phone-frame">
                  <div className="phone-screen">
                    <div className="phone-status-bar">
                      <span>9:41</span><span>📶 100%</span>
                    </div>
                    <div style={{textAlign:'center',padding:'0 16px'}}>
                      <div style={{fontSize:'10px',color:'#5a6a85',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'6px',fontFamily:"'DM Mono', monospace"}}>EMERGENCY SOS</div>
                      <div style={{fontSize:'12px',color:'#a8b4c8',marginBottom:'4px'}}>Location acquired</div>
                      <div style={{fontSize:'10px',color:'#5a6a85',fontFamily:"'DM Mono', monospace"}}>22.7196°N 75.8577°E</div>
                    </div>
                    <div className="sos-ring">
                      <div className="sos-btn-mock">SOS</div>
                    </div>
                    <div className="phone-info">
                      <p>Hold 3 seconds<br/>to trigger alert</p>
                    </div>
                    <div className="phone-type-row">
                      <div className="phone-type-chip">🏥 Medical</div>
                      <div className="phone-type-chip">🚗 Accident</div>
                      <div className="phone-type-chip">🔥 Fire</div>
                      <div className="phone-type-chip">🚨 Crime</div>
                    </div>
                  </div>
                </div>
                <div className="hero-deco deco-1">📍 Location Shared</div>
                <div className="hero-deco deco-2">✅ Responder Notified</div>
                <div className="hero-deco deco-3">💬 Chat Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card reveal">
              <div className="stat-number"><span className="count" data-target="5000">0</span><span className="stat-suffix">+</span></div>
              <div className="stat-label">Users Protected</div>
            </div>
            <div className="stat-card reveal reveal-delay-1">
              <div className="stat-number"><span className="count" data-target="120">0</span><span className="stat-suffix">+</span></div>
              <div className="stat-label">Incidents Resolved</div>
            </div>
            <div className="stat-card reveal reveal-delay-2">
              <div className="stat-number"><span className="count" data-target="98">0</span><span className="stat-suffix">%</span></div>
              <div className="stat-label">Response Rate</div>
            </div>
            <div className="stat-card reveal reveal-delay-3">
              <div className="stat-number"><span className="count" data-target="180">0</span><span className="stat-suffix">s</span></div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="features-header">
            <div className="section-label reveal">Core Features</div>
            <h2 className="section-title reveal">Everything You Need<br/>In An Emergency</h2>
            <p className="section-desc reveal">A complete emergency response ecosystem built for speed, reliability, and real-world use.</p>
          </div>
          <div className="features-grid">
            <FeatureCard icon="🚨" title="One-Tap SOS Alert" desc="Hold the SOS button for 3 seconds to instantly alert contacts, dispatch responders, and share your live location." tag="CORE FEATURE" delay={0} />
            <FeatureCard icon="📍" title="Live Location Tracking" desc="Real-time GPS updates shared with responders. Continuous tracking with ETA calculation and route visualization." tag="REAL-TIME" delay={1} />
            <FeatureCard icon="📲" title="Multi-Channel Alerts" desc="Emergency contacts notified instantly via SMS, email, push notifications, and in-app alerts simultaneously." tag="NOTIFICATIONS" delay={2} />
            <FeatureCard icon="🏥" title="Nearby Services Finder" desc="Find nearest hospitals, police stations, ambulances, and fire stations using Google Maps API integration." tag="MAPS API" delay={0} />
            <FeatureCard icon="💬" title="Emergency Chat" desc="Real-time communication between victim and responders via Socket.io powered chat with quick response options." tag="SOCKET.IO" delay={1} />
            <FeatureCard icon="📊" title="Responder Dashboard" desc="Police and hospital staff can view active emergencies, accept incidents, assign responders, and track progress." tag="ADMIN" delay={2} />
            <FeatureCard icon="📷" title="Evidence Upload" desc="Upload images, videos, and voice recordings as evidence for crime reporting or accident documentation." tag="CLOUDINARY" delay={2} />
            <FeatureCard icon="🩸" title="Blood Donor Finder" desc="Search registered donors by blood group with compatibility guide. One-tap call to connect with a donor instantly." tag="COMMUNITY" delay={0} />
           </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div style={{textAlign:'center',marginBottom:'60px'}}>
            <div className="section-label reveal">Process</div>
            <h2 className="section-title reveal">How ResQNet Works</h2>
            <p className="section-desc reveal" style={{margin:'0 auto'}}>From pressing SOS to help arriving — here's the complete flow in seconds.</p>
          </div>
          <div className="steps-grid">
            <StepCard number="01" title="Press SOS Button" desc='Hold the red SOS button for 3 seconds, to trigger the alert.' delay={0} />
            <StepCard number="02" title="Location Captured" desc="GPS coordinates are captured instantly and reverse geocoded to get your exact address automatically." delay={1} />
            <StepCard number="03" title="Alerts Dispatched" desc="Emergency contacts get email. Nearest responders get a real-time dashboard notification instantly." delay={2} />
            <StepCard number="04" title="Help Arrives" desc="Responders track your live location, chat with you, and update status from Accepted → On the Way → Resolved." delay={3} />
          </div>
        </div>
      </section>

      {/* Emergency Types Section */}
      <section className="types-section" id="emergency-types">
        <div className="container">
          <div style={{marginBottom:'48px'}}>
            <div className="section-label reveal">Coverage</div>
            <h2 className="section-title reveal">6 Emergency Types Covered</h2>
            <p className="section-desc reveal">Different responders are notified based on the emergency type you select.</p>
          </div>
          <div className="types-grid">
            <TypeCard emoji="🏥" name="Medical Emergency" desc="Nearest hospitals + ambulance dispatched" delay={0} />
            <TypeCard emoji="🚗" name="Accident" desc="Police + ambulance + traffic control notified" delay={1} />
            <TypeCard emoji="🔥" name="Fire Emergency" desc="Nearest fire station dispatched immediately" delay={2} />
            <TypeCard emoji="🚨" name="Crime / Assault" desc="Police dispatched with live location tracking" delay={0} />
            <TypeCard emoji="👩" name="Women Safety" desc="Dedicated women safety cell + police alerted" delay={1} />
            <TypeCard emoji="🌊" name="Natural Disaster" desc="NDRF teams + disaster management authorities" delay={2} />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section" id="tech">
        <div className="container">
          <div style={{marginBottom:'48px'}}>
            <div className="section-label reveal">Built With</div>
            <h2 className="section-title reveal">Production-Grade Tech Stack</h2>
            <p className="section-desc reveal">Built with industry-standard technologies for speed, scale, and reliability.</p>
          </div>
          <div className="tech-grid">
            <TechCard icon="⚛️" name="React + Vite" role="Frontend Framework" delay={0} />
            <TechCard icon="🟢" name="Node.js + Express" role="Backend API" delay={1} />
            <TechCard icon="🍃" name="MongoDB" role="Database" delay={2} />
            <TechCard icon="🔌" name="Socket.io" role="Real-Time Events" delay={3} />
            <TechCard icon="🗺️" name="Google Maps API" role="Location & Routing" delay={0} />
            {/* <TechCard icon="📱" name="Twilio + Firebase" role="SMS & Notifications" delay={1} /> */}
            <TechCard icon="☁️" name="Cloudinary" role="Media Storage" delay={2} />
            <TechCard icon="🔐" name="JWT + bcrypt" role="Authentication" delay={3} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container" style={{position:'relative',zIndex:1}}>
          <div className="section-label" style={{justifyContent:'center',display:'flex'}}>Ready to Stay Safe?</div>
          <h2 className="section-title reveal">Your Safety Is One<br/><span style={{color:'var(--red)'}}>Tap Away.</span></h2>
          <p className="section-desc reveal">Join thousands of users already protected by ResQNet. Set up your profile, add emergency contacts, and be ready in minutes.</p>
          <div className="cta-actions reveal">
            <a href="/register" className="btn btn-red" style={{fontSize:'15px',padding:'14px 32px'}}>🛡️ Create Free Account</a>
            <a href="/login" className="btn btn-outline" style={{fontSize:'15px',padding:'14px 32px'}}>Sign In</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#home" className="nav-logo" style={{marginBottom:0}} onClick={(e) => handleSmoothScroll(e, '#home')}>
                <div className="nav-logo-icon">🛡️</div>
                <span className="nav-logo-text">ResQNet</span>
              </a>
              <p>A real-time emergency response platform connecting victims with responders instantly. Built as a major college project using modern full-stack technologies.</p>
              <div className="footer-social">
                <a className="social-btn" href="#">G</a>
                <a className="social-btn" href="#">in</a>
                           </div>
            </div>
            <div className="footer-col">
              <h4>Features</h4>
              <ul>
                <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>SOS Alert</a></li>
                <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Live Tracking</a></li>
                <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Emergency Chat</a></li>
                {/* <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Hospital Beds</a></li> */}
                <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>Blood Donors</a></li>
                {/* <li><a href="#features" onClick={(e) => handleSmoothScroll(e, '#features')}>QR Medical Card</a></li> */}
              </ul>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="/register">Get Started</a></li>
                <li><a href="/login">User Login</a></li>
                <li><a href="/admin">Admin Panel</a></li>
                <li><a href="/responder">Responder</a></li>
                <li><a href="/nearby">Nearby Services</a></li>
                <li><a href="/hospitals">Hospital Status</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Emergency Types</h4>
              <ul>
                <li><a href="#"> Medical</a></li>
                <li><a href="#"> Accident</a></li>
                <li><a href="#"> Fire</a></li>
                <li><a href="#"> Crime</a></li>
                <li><a href="#"> Women Safety</a></li>
                <li><a href="#"> Natural Disaster</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ResQNet.  Emergency Response Platform.</p>
                      </div>
        </div>
      </footer>
    </div>
  );
};

// ------------------------------------------------------------
// Feature Card Component
// ------------------------------------------------------------
const FeatureCard = ({ icon, title, desc, tag, delay }) => {
  const delayClass = delay === 0 ? '' : `reveal-delay-${delay}`;
  return (
    <div className={`feature-card reveal ${delayClass}`}>
      <div className="feat-icon">{icon}</div>
      <div className="feat-title">{title}</div>
      <div className="feat-desc">{desc}</div>
      <div className="feat-tag">{tag}</div>
    </div>
  );
};

// ------------------------------------------------------------
// Step Card Component
// ------------------------------------------------------------
const StepCard = ({ number, title, desc, delay }) => {
  const delayClass = delay === 0 ? '' : `reveal-delay-${delay}`;
  return (
    <div className={`step-card reveal ${delayClass}`}>
      <div className="step-num">{number}</div>
      <div className="step-title">{title}</div>
      <div className="step-desc">{desc}</div>
    </div>
  );
};

// ------------------------------------------------------------
// Type Card Component
// ------------------------------------------------------------
const TypeCard = ({ emoji, name, desc, delay }) => {
  const delayClass = delay === 0 ? '' : `reveal-delay-${delay}`;
  return (
    <div className={`type-card reveal ${delayClass}`}>
      <div className="type-emoji">{emoji}</div>
      <div>
        <div className="type-name">{name}</div>
        <div className="type-desc">{desc}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Tech Card Component
// ------------------------------------------------------------
const TechCard = ({ icon, name, role, delay }) => {
  const delayClass = delay === 0 ? '' : `reveal-delay-${delay}`;
  return (
    <div className={`tech-card reveal ${delayClass}`}>
      <div className="tech-icon">{icon}</div>
      <div className="tech-name">{name}</div>
      <div className="tech-role">{role}</div>
    </div>
  );
};

// ------------------------------------------------------------
// Global Styles Component (injected via <style>)
// ------------------------------------------------------------
const GlobalStyles = () => (
  <style>{`
    /* ── Reset & Variables ─────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --red:       #e02020;
      --red-dark:  #a80f0f;
      --red-glow:  rgba(224,32,32,0.18);
      --blue:      #1561c8;
      --blue-mid:  #0d3d82;
      --blue-dark: #07213f;
      --black:     #080a0e;
      --gray-900:  #0f1218;
      --gray-800:  #161b24;
      --gray-700:  #1e2636;
      --gray-600:  #2a3447;
      --gray-400:  #5a6a85;
      --gray-200:  #a8b4c8;
      --white:     #f0f4fa;
      --font-display: 'Bebas Neue', sans-serif;
      --font-body:    'DM Sans', sans-serif;
      --font-mono:    'DM Mono', monospace;
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      background: var(--black);
      color: var(--white);
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--gray-900); }
    ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }

    /* ── Noise overlay ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: 0.35;
    }

    /* ── Utility ── */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px; border-radius: 4px; border: none;
      cursor: pointer; font-family: var(--font-body); font-weight: 600;
      font-size: 14px; letter-spacing: 0.5px; text-decoration: none;
      transition: all 0.22s ease; white-space: nowrap;
    }
    .btn-red {
      background: var(--red); color: #fff;
      box-shadow: 0 0 28px rgba(224,32,32,0.35);
    }
    .btn-red:hover { background: var(--red-dark); transform: translateY(-2px); box-shadow: 0 0 40px rgba(224,32,32,0.5); }
    .btn-outline {
      background: transparent; color: var(--white);
      border: 1px solid var(--gray-600);
    }
    .btn-outline:hover { border-color: var(--red); color: var(--red); }

    /* ── NAVBAR ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(8,10,14,0.88);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(224,32,32,0.15);
      transition: all 0.3s ease;
    }
    nav.scrolled { border-bottom-color: rgba(224,32,32,0.35); background: rgba(8,10,14,0.97); }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      height: 68px; max-width: 1200px; margin: 0 auto; padding: 0 24px;
    }
    .nav-logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; color: var(--white);
    }
    .nav-logo-icon {
      width: 36px; height: 36px; border-radius: 8px;
      background: var(--red); display: flex; align-items: center; justify-content: center;
      font-size: 18px; box-shadow: 0 0 16px rgba(224,32,32,0.5);
    }
    .nav-logo-text { font-family: var(--font-display); font-size: 24px; letter-spacing: 2px; }
    .nav-links { display: flex; align-items: center; gap: 8px; }
    .nav-links a {
      padding: 7px 14px; border-radius: 4px; text-decoration: none;
      font-size: 13px; font-weight: 500; color: var(--gray-200);
      transition: all 0.2s; letter-spacing: 0.3px;
    }
    .nav-links a:hover { color: var(--white); background: var(--gray-700); }
    .nav-links a.active { color: var(--red); }
    .nav-cta { display: flex; align-items: center; gap: 10px; }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 6px; }
    .hamburger span { width: 22px; height: 2px; background: var(--white); border-radius: 2px; transition: all 0.3s; }
    .mobile-menu {
      display: none; flex-direction: column; gap: 4px;
      padding: 12px 24px 20px; border-top: 1px solid var(--gray-700);
      background: rgba(8,10,14,0.98);
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a {
      padding: 11px 14px; border-radius: 4px; text-decoration: none;
      font-size: 14px; font-weight: 500; color: var(--gray-200);
      transition: all 0.2s;
    }
    .mobile-menu a:hover { color: var(--white); background: var(--gray-700); }
    .mobile-menu .btn { width: 100%; justify-content: center; margin-top: 8px; }

    /* ── HERO ── */
    .hero {
      min-height: 100vh;
      background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(21,97,200,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 80% 80%, rgba(224,32,32,0.08) 0%, transparent 50%),
                  var(--black);
      display: flex; align-items: center;
      padding: 120px 0 80px;
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }
    .hero-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 60px; align-items: center; position: relative; z-index: 1;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(224,32,32,0.1); border: 1px solid rgba(224,32,32,0.3);
      color: #ff6b6b; border-radius: 999px;
      padding: 6px 14px; font-size: 12px; font-weight: 600;
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px;
    }
    .hero-badge::before {
      content: ''; width: 7px; height: 7px; border-radius: 50%;
      background: var(--red); animation: pulse-dot 1.5s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.7); }
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(52px, 7vw, 92px);
      line-height: 0.93;
      letter-spacing: 3px;
      margin-bottom: 24px;
    }
    .hero-title .line-red { color: var(--red); text-shadow: 0 0 40px rgba(224,32,32,0.4); }
    .hero-title .line-blue { color: #b0b487; }
    .hero-desc {
      font-size: 16px; color: var(--gray-200); line-height: 1.7;
      max-width: 480px; margin-bottom: 36px;
    }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
    .hero-stats {
      display: flex; gap: 32px; padding-top: 32px;
      border-top: 1px solid var(--gray-700);
    }
    .hero-stat-val {
      font-family: var(--font-display); font-size: 32px;
      color: var(--white); letter-spacing: 1px;
    }
    .hero-stat-val span { color: var(--red); }
    .hero-stat-label { font-size: 12px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 1px; }

    /* Phone mockup */
    .hero-visual {
      display: flex; justify-content: center; align-items: center;
      position: relative;
    }
    .phone-frame {
      width: 280px; height: 560px;
      background: var(--gray-800);
      border-radius: 40px;
      border: 2px solid var(--gray-600);
      position: relative; overflow: hidden;
      box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(224,32,32,0.1);
    }
    .phone-screen {
      position: absolute; inset: 12px;
      background: var(--gray-900);
      border-radius: 30px; overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 20px;
    }
    .phone-status-bar {
      position: absolute; top: 0; left: 0; right: 0;
      padding: 10px 20px; display: flex; justify-content: space-between;
      font-size: 11px; font-family: var(--font-mono); color: var(--gray-400);
    }
    .sos-ring {
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .sos-ring::before, .sos-ring::after {
      content: ''; position: absolute;
      width: 140px; height: 140px; border-radius: 50%;
      border: 1px solid rgba(224,32,32,0.3);
      animation: ripple 2s ease-out infinite;
    }
    .sos-ring::after { animation-delay: 1s; }
    @keyframes ripple {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .sos-btn-mock {
      width: 100px; height: 100px; border-radius: 50%;
      background: radial-gradient(circle, #ff3333 0%, #a80f0f 100%);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-size: 28px; color: white;
      letter-spacing: 2px; box-shadow: 0 0 40px rgba(224,32,32,0.7);
      cursor: pointer; position: relative; z-index: 1;
      animation: sos-pulse 2s ease-in-out infinite;
    }
    @keyframes sos-pulse {
      0%, 100% { box-shadow: 0 0 40px rgba(224,32,32,0.7); }
      50% { box-shadow: 0 0 70px rgba(224,32,32,1); }
    }
    .phone-info {
      text-align: center; padding: 0 16px;
    }
    .phone-info p { font-size: 11px; color: var(--gray-400); line-height: 1.5; }
    .phone-type-row {
      display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
      padding: 0 12px;
    }
    .phone-type-chip {
      font-size: 9px; padding: 3px 8px; border-radius: 999px;
      background: var(--gray-700); color: var(--gray-200); border: 1px solid var(--gray-600);
    }
    .hero-deco {
      position: absolute; font-size: 11px; font-family: var(--font-mono);
      color: var(--gray-400); padding: 8px 12px;
      background: var(--gray-800); border: 1px solid var(--gray-700);
      border-radius: 6px; white-space: nowrap;
    }
    .deco-1 { top: 10%; right: -10px; }
    .deco-2 { bottom: 15%; left: -30px; }
    .deco-3 { top: 55%; right: -20px; }

    /* ── Section Common ── */
    section { padding: 100px 0; }
    .section-label {
      font-family: var(--font-mono); font-size: 11px;
      color: var(--red); letter-spacing: 3px; text-transform: uppercase;
      margin-bottom: 12px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: clamp(36px, 5vw, 56px);
      line-height: 1; letter-spacing: 2px; margin-bottom: 16px;
    }
    .section-desc { font-size: 15px; color: var(--gray-200); max-width: 560px; line-height: 1.7; }

    /* ── Stats Counter ── */
    .stats-section {
      padding: 60px 0;
      background: linear-gradient(135deg, var(--gray-800) 0%, var(--gray-900) 100%);
      border-top: 1px solid var(--gray-700);
      border-bottom: 1px solid var(--gray-700);
    }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
    }
    .stat-card {
      padding: 36px 24px; text-align: center;
      border-right: 1px solid var(--gray-700);
      position: relative;
    }
    .stat-card:last-child { border-right: none; }
    .stat-card::before {
      content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 40px; height: 2px;
      background: linear-gradient(90deg, transparent, var(--red), transparent);
    }
    .stat-number {
      font-family: var(--font-display); font-size: 54px;
      color: var(--white); letter-spacing: 2px; line-height: 1;
      margin-bottom: 6px;
    }
    .stat-number .stat-suffix { color: var(--red); }
    .stat-label { font-size: 12px; color: var(--gray-400); letter-spacing: 2px; text-transform: uppercase; }

    /* ── Features Grid ── */
    .features-section { background: var(--gray-900); }
    .features-header { margin-bottom: 60px; }
    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
      background: var(--gray-700); border: 1px solid var(--gray-700);
      border-radius: 12px; overflow: hidden;
    }
    .feature-card {
      background: var(--gray-800);
      padding: 32px 28px;
      transition: all 0.3s ease;
      position: relative; overflow: hidden;
      cursor: default;
    }
    .feature-card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(224,32,32,0.05) 0%, transparent 60%);
      opacity: 0; transition: opacity 0.3s;
    }
    .feature-card:hover { background: var(--gray-700); }
    .feature-card:hover::before { opacity: 1; }
    .feature-card:hover .feat-icon { background: rgba(224,32,32,0.2); color: #ff6b6b; }
    .feat-icon {
      width: 48px; height: 48px; border-radius: 10px;
      background: var(--gray-700); display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 16px;
      transition: all 0.3s;
    }
    .feat-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--white); }
    .feat-desc { font-size: 13px; color: var(--gray-400); line-height: 1.6; }
    .feat-tag {
      display: inline-block; margin-top: 12px;
      font-size: 10px; font-family: var(--font-mono);
      color: var(--blue); background: rgba(21,97,200,0.1);
      border: 1px solid rgba(21,97,200,0.25); border-radius: 3px;
      padding: 2px 7px; letter-spacing: 0.5px;
    }

    /* ── How It Works ── */
    .how-section { background: var(--black); }
    .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
    .steps-grid::before {
      content: ''; position: absolute;
      top: 32px; left: 10%; right: 10%; height: 1px;
      background: linear-gradient(90deg, transparent, var(--gray-600), var(--red), var(--gray-600), transparent);
    }
    .step-card { text-align: center; padding: 0 20px; }
    .step-num {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--gray-800); border: 2px solid var(--gray-600);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      font-family: var(--font-display); font-size: 26px; color: var(--gray-200);
      transition: all 0.3s; position: relative; z-index: 1;
    }
    .step-card:hover .step-num {
      border-color: var(--red); color: var(--red);
      box-shadow: 0 0 20px rgba(224,32,32,0.3);
    }
    .step-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .step-desc { font-size: 13px; color: var(--gray-400); line-height: 1.6; }

    /* ── Tech Stack ── */
    .tech-section { background: var(--gray-900); }
    .tech-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .tech-card {
      background: var(--gray-800);
      border: 1px solid var(--gray-700);
      border-radius: 10px; padding: 24px 20px;
      text-align: center; transition: all 0.3s;
    }
    .tech-card:hover { border-color: var(--blue); transform: translateY(-3px); }
    .tech-card:hover .tech-icon { color: #4a9eff; }
    .tech-icon { font-size: 28px; margin-bottom: 10px; }
    .tech-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .tech-role { font-size: 11px; color: var(--gray-400); font-family: var(--font-mono); }

    /* ── Emergency Types ── */
    .types-section { background: var(--black); }
    .types-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .type-card {
      background: var(--gray-800); border: 1px solid var(--gray-700);
      border-radius: 10px; padding: 24px 20px;
      display: flex; align-items: center; gap: 16px;
      transition: all 0.3s; cursor: default;
    }
    .type-card:hover { border-color: var(--red); background: var(--gray-700); transform: translateX(4px); }
    .type-emoji { font-size: 28px; flex-shrink: 0; }
    .type-name { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
    .type-desc { font-size: 12px; color: var(--gray-400); }

    /* ── CTA ── */
    .cta-section {
      background: linear-gradient(135deg, var(--blue-dark) 0%, #0a0d12 50%, rgba(168,15,15,0.2) 100%);
      border-top: 1px solid var(--gray-700);
      text-align: center; padding: 100px 0;
      position: relative; overflow: hidden;
    }
    .cta-section::before {
      content: '';
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(224,32,32,0.06) 0%, transparent 70%);
    }
    .cta-section .section-title { margin-bottom: 16px; }
    .cta-section .section-desc { margin: 0 auto 40px; text-align: center; }
    .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* ── Footer ── */
    footer {
      background: var(--gray-900);
      border-top: 1px solid var(--gray-700);
      padding: 60px 0 0;
    }
    .footer-grid {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
      margin-bottom: 48px;
    }
    .footer-brand p { font-size: 13px; color: var(--gray-400); line-height: 1.7; margin: 12px 0 20px; max-width: 280px; }
    .footer-social { display: flex; gap: 10px; }
    .social-btn {
      width: 34px; height: 34px; border-radius: 6px;
      background: var(--gray-700); border: 1px solid var(--gray-600);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; cursor: pointer; transition: all 0.2s;
      text-decoration: none; color: var(--gray-200);
    }
    .social-btn:hover { background: var(--red); border-color: var(--red); color: white; }
    .footer-col h4 { font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--white); margin-bottom: 16px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a {
      font-size: 13px; color: var(--gray-400); text-decoration: none; transition: color 0.2s;
    }
    .footer-col ul li a:hover { color: var(--red); }
    .footer-bottom {
      border-top: 1px solid var(--gray-700);
      padding: 20px 0;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 12px;
    }
    .footer-bottom p { font-size: 12px; color: var(--gray-400); }
    .footer-bottom .tech-tag {
      font-family: var(--font-mono); font-size: 11px; color: var(--blue);
      background: rgba(21,97,200,0.1); border: 1px solid rgba(21,97,200,0.2);
      padding: 3px 10px; border-radius: 3px;
    }

    /* ── Alert Ticker ── */
    .ticker-bar {
      background: var(--red); color: white;
      padding: 8px 0; overflow: hidden; white-space: nowrap;
      margin-top: 68px;
    }
    .ticker-inner {
      display: inline-flex; gap: 60px;
      animation: ticker 28s linear infinite;
    }
    .ticker-inner span { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; }
    .ticker-inner span::before { content: '⚡ '; }
    @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    /* ── Scroll Animations ── */
    .reveal {
      opacity: 0; transform: translateY(30px);
      transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .steps-grid { grid-template-columns: repeat(2, 1fr); gap: 40px; }
      .steps-grid::before { display: none; }
      .tech-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .hero-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-visual { display: none; }
      .hero-desc { max-width: 100%; }
      .hero-stats { justify-content: center; gap: 24px; flex-wrap: wrap; }
      .hero-actions { justify-content: center; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .stat-card { border-bottom: 1px solid var(--gray-700); }
      .stat-card:nth-child(2) { border-right: none; }
      .features-grid { grid-template-columns: 1fr; }
      .steps-grid { grid-template-columns: 1fr; }
      .types-grid { grid-template-columns: 1fr; }
      .tech-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr; gap: 32px; }
      .footer-bottom { flex-direction: column; text-align: center; }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
      .stat-card { border-right: none; }
      .tech-grid { grid-template-columns: 1fr 1fr; }
      .section-title { font-size: 36px; }
    }
  `}</style>
);

export default SafeAlertApp;