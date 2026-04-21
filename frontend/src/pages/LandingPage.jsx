import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";

// ── simple intersection observer hook for scroll reveals ──
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── floating particle blob ──
const Blob = ({ style }) => (
  <div style={{
    position:"absolute", borderRadius:"50%",
    background:"radial-gradient(circle, rgba(67,160,71,.18) 0%, transparent 70%)",
    pointerEvents:"none", ...style,
  }} />
);

// ── nav ──
const Nav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 48px",
      height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(10,20,10,.85)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
      transition:"all .35s ease",
      fontFamily:font,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}>
        <div style={{
          width:34, height:34, borderRadius:9,
          background:"linear-gradient(135deg, #43a047, #1b5e20)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, boxShadow:"0 4px 12px rgba(67,160,71,.4)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </div>
        <span style={{ fontFamily:serif, fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-.2px" }}>WasteZero</span>
      </div>

      {/* Nav links */}
      <div style={{ display:"flex", alignItems:"center", gap:32 }}>
        {[["How it Works","#how"], ["Impact","#impact"], ["About","#about"]].map(([label, href]) => (
          <a key={href} href={href} style={{
            fontSize:14, fontWeight:500, color:"rgba(255,255,255,.65)",
            textDecoration:"none", transition:"color .2s",
          }}
            onMouseEnter={e => e.target.style.color="#fff"}
            onMouseLeave={e => e.target.style.color="rgba(255,255,255,.65)"}
          >{label}</a>
        ))}
      </div>

      {/* Right Section: CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/login")} style={{
          padding:"9px 22px", borderRadius:10, border:"1px solid rgba(67,160,71,.5)",
          background:"rgba(67,160,71,.12)", color:"#81c784",
          fontFamily:font, fontSize:14, fontWeight:600, cursor:"pointer",
          transition:"all .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(67,160,71,.25)"; e.currentTarget.style.borderColor="rgba(67,160,71,.8)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(67,160,71,.12)"; e.currentTarget.style.borderColor="rgba(67,160,71,.5)"; }}
        >
          Sign In
        </button>
      </div>
    </nav>
  );
};

// ── hero ──
const Hero = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const fade = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
  });

  return (
    <section className="relative z-10" style={{
      minHeight:"100vh", overflow:"hidden",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:font,
    }}>
      {/* Atmospheric blobs */}
      <Blob style={{ width:600, height:600, top:"-10%", left:"-8%", opacity:.6 }} />
      <Blob style={{ width:500, height:500, bottom:"-5%", right:"-5%", opacity:.5 }} />
      <Blob style={{ width:300, height:300, top:"35%", right:"18%", opacity:.3 }} />

      {/* Subtle grid texture */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(67,160,71,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(67,160,71,.04) 1px, transparent 1px)",
        backgroundSize:"60px 60px",
      }} />

      {/* Glowing orb */}
      <div style={{
        position:"absolute", top:"42%", left:"50%", transform:"translate(-50%,-50%)",
        width:520, height:520, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(46,125,50,.22) 0%, transparent 68%)",
        pointerEvents:"none",
        animation:"pulse 4s ease-in-out infinite",
      }} />

      <style>{`
        @keyframes pulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.8} 50%{transform:translate(-50%,-50%) scale(1.08);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .hero-btn { transition: all .22s ease !important; }
        .hero-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 32px rgba(46,125,50,.5) !important; }
        .hero-btn-outline:hover { transform: translateY(-3px) !important; background: rgba(255,255,255,.08) !important; }
        .hero-btn-ghost:hover { transform: translateY(-3px) !important; border-color: rgba(67,160,71,.6) !important; color: #81c784 !important; }
        .stat-card { transition: transform .2s, box-shadow .2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.4) !important; }
        .step-card { transition: transform .25s, border-color .25s; }
        .step-card:hover { transform: translateY(-5px); border-color: rgba(67,160,71,.4) !important; }
        .impact-item { transition: transform .2s, background .2s; }
        .impact-item:hover { transform: translateX(6px); background: rgba(67,160,71,.1) !important; }
        .scroll-reveal { transition: opacity .7s ease, transform .7s ease; }
        .scroll-reveal.hidden { opacity:0; transform:translateY(32px); }
        .scroll-reveal.visible { opacity:1; transform:translateY(0); }
      `}</style>

      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:780, padding:"0 32px", paddingTop:80 }}>
        {/* Badge */}
        <div style={{
          ...fade(0),
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"6px 16px", borderRadius:99,
          marginBottom:28,
          background:"rgba(67,160,71,.15)",
          border:"1px solid rgba(67,160,71,.3)",
        }}>
          <span style={{ fontSize:13, fontWeight:600, letterSpacing:".3px", color:"#81c784" }}>
            Building sustainable communities
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          ...fade(120),
          fontFamily:serif, fontSize:"clamp(42px, 6vw, 72px)", fontWeight:900,
          lineHeight:1.06, letterSpacing:"-.03em", margin:"0 0 24px",
          color:"#c8e6c9",
        }}>
          Connecting{" "}
          <span style={{
            background:"linear-gradient(135deg, #66bb6a, #43a047, #2e7d32)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>NGOs & Volunteers</span>
          {" "}to reduce waste
        </h1>

        {/* Tagline */}
        <p style={{
          ...fade(240),
          fontSize:"clamp(16px, 2vw, 19px)",
          lineHeight:1.7, margin:"0 auto 44px", maxWidth:560,
          color:"#a5d6a7",
        }}>
          WasteZero bridges the gap between organizations driving change
          and individuals ready to act — together building a cleaner, greener world.
        </p>

        {/* CTAs */}
        <div style={{ ...fade(360), display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center" }}>
          <button className="hero-btn" onClick={() => navigate("/register?role=volunteer")} style={{
            padding:"14px 28px", borderRadius:12,
            background:"#43a047", color:"#fff",
            fontFamily:font, fontSize:15, fontWeight:600, border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
          }}>
            Join as Volunteer
          </button>
          <button className="hero-btn" onClick={() => navigate("/register?role=volunteer")} style={{
            padding:"14px 28px", borderRadius:12,
            background:"#43a047", color:"#fff",
            fontFamily:font, fontSize:15, fontWeight:600, border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
          }}>
            Register NGO
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          ...fade(480),
          display:"flex", flexWrap:"wrap", justifyContent:"center", gap:16, marginTop:64,
        }}>
          {[
            { value:"500+", label:"Volunteers" },
            { value:"80+",  label:"NGOs" },
            { value:"1200+", label:"Opportunities" },
            { value:"40+",  label:"Cities" },
          ].map(({ value, label }) => (
            <div key={label} className="stat-card" style={{
              padding:"18px 28px", borderRadius:16,
              minWidth:110,
              background:"rgba(255,255,255,.05)",
              backdropFilter:"blur(12px)",
              border:"1px solid rgba(67,160,71,.2)",
            }}>
              <div style={{ fontFamily:serif, fontSize:28, fontWeight:900, lineHeight:1, color:"#81c784" }}>{value}</div>
              <div style={{ fontSize:12, marginTop:4, fontWeight:500, textTransform:"uppercase", letterSpacing:".6px", color:"#a5d6a7" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:.4,
        animation:"float 2s ease-in-out infinite",
      }}>
        <span style={{ fontSize:11, letterSpacing:"1px", textTransform:"uppercase", color:"#fff" }}>Scroll</span>
        <div style={{ width:1, height:32, background:"linear-gradient(to bottom, #fff, transparent)" }} />
      </div>
    </section>
  );
};

// ── why section ──
const Why = () => {
  const [ref, inView] = useInView();
  return (
    <section id="about" ref={ref} className="relative z-10" style={{
      padding:"120px 48px",
      fontFamily:font, overflow:"hidden",
    }}>
      <Blob style={{ width:400, height:400, top:"-10%", right:"-5%", opacity:.4 }} />

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:80,
          alignItems:"center",
        }}>
          {/* Left */}
          <div className={`scroll-reveal ${inView ? "visible" : "hidden"}`} style={{ transitionDelay:"0ms" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:7,
              padding:"5px 14px", borderRadius:99,
              marginBottom:20,
              background:"rgba(67,160,71,.15)",
              border:"1px solid rgba(67,160,71,.3)",
            }}>
              <span style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", color:"#81c784" }}>The Problem</span>
            </div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 44px)", fontWeight:900, margin:"0 0 20px", lineHeight:1.1, color:"#c8e6c9" }}>
              Waste is a crisis.<br/>
              <span style={{ color:"#66bb6a" }}>Coordination</span> is the gap.
            </h2>
            <p style={{ fontSize:16, lineHeight:1.8, margin:"0 0 16px", color:"#a5d6a7" }}>
              Millions of tonnes of waste go unmanaged every year — not because people don't care, but because NGOs with the mission can't find volunteers with the time, and volunteers can't find the right organizations to support.
            </p>
            <p style={{ fontSize:16, lineHeight:1.8, color:"#a5d6a7" }}>
              WasteZero exists to close that gap. We match people to purpose, and turn intent into impact.
            </p>
          </div>

          {/* Right — floating card stack */}
          <div className={`scroll-reveal ${inView ? "visible" : "hidden"}`} style={{ transitionDelay:"160ms", position:"relative", height:420 }}>
            {[
              {
                top: 0, left: 40,
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                ),
                text:"Industrial waste unmanaged", sub:"47% goes uncollected",
              },
              {
                top: 140, left: 0,
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                text:"NGOs lack volunteer reach", sub:"3 in 5 struggle to find help",
              },
              {
                top: 280, left: 60,
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                ),
                text:"Recyclables lost to landfill", sub:"60% recyclable waste discarded",
              },
            ].map(({ top, left, icon, text, sub }, i) => (
              <div key={i} style={{
                position:"absolute", top, left,
                width:300, padding:"18px 22px", borderRadius:16,
                display:"flex", alignItems:"center", gap:14,
                background:"rgba(255,255,255,.05)",
                backdropFilter:"blur(12px)",
                border:"1px solid rgba(67,160,71,.2)",
                animation:`float ${3 + i * 0.6}s ease-in-out infinite`,
                animationDelay:`${i * 0.4}s`,
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(67,160,71,.15)",
                  border:"1px solid rgba(67,160,71,.3)",
                }}>{icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:3, color:"#c8e6c9" }}>{text}</div>
                  <div style={{ fontSize:12, color:"#81c784" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── how it works ──
const HowItWorks = () => {
  const [ref, inView] = useInView();
  const steps = [
    { n:"01", title:"NGOs post opportunities", desc:"Organizations create volunteer drives, cleanup events, and recycling initiatives — specifying skills needed, location, and duration.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
    { n:"02", title:"Smart matching", desc:"Our platform matches volunteers to opportunities based on skills, location, and availability — surfacing the most relevant actions for each person.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    },
    { n:"03", title:"Volunteers apply", desc:"Interested volunteers apply with one click, message NGOs directly, and get accepted for initiatives that fit their profile.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
    },
    { n:"04", title:"Impact is made", desc:"Teams get to work. Communities are cleaner. NGOs track results. Volunteers build their impact portfolio. Everyone wins.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
    },
  ];

  return (
    <section id="how" ref={ref} className="relative z-10" style={{
      padding:"120px 48px",
      fontFamily:font,
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        {/* Section header */}
        <div className={`scroll-reveal ${inView ? "visible" : "hidden"}`} style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"5px 14px", borderRadius:99,
            marginBottom:16,
            background:"rgba(67,160,71,.15)",
            border:"1px solid rgba(67,160,71,.3)",
          }}>
            <span style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", color:"#81c784" }}>How It Works</span>
          </div>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 44px)", fontWeight:900, margin:"0 0 16px", lineHeight:1.1, color:"#c8e6c9" }}>
            From intent to impact<br/>in four steps
          </h2>
          <p style={{ fontSize:16, maxWidth:480, margin:"0 auto", color:"#a5d6a7" }}>
            WasteZero makes it seamless for organizations and individuals to find each other and get to work.
          </p>
        </div>

        {/* Steps grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:20 }}>
          {steps.map(({ n, icon, title, desc }, i) => (
            <div key={n} className={`step-card scroll-reveal ${inView ? "visible" : "hidden"}`} style={{
              transitionDelay:`${i * 80}ms`,
              padding:"32px 28px", borderRadius:20,
              position:"relative", overflow:"hidden",
              background:"rgba(255,255,255,.05)",
              backdropFilter:"blur(12px)",
              border:"1px solid rgba(67,160,71,.2)",
            }}>
              {/* Step number watermark */}
              <div style={{
                position:"absolute", top:-10, right:16,
                fontFamily:serif, fontSize:72, fontWeight:900,
                lineHeight:1, userSelect:"none",
                color:"rgba(255,255,255,.04)",
              }}>{n}</div>

              <div style={{
                width:44, height:44, borderRadius:12, marginBottom:16,
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(67,160,71,.15)",
                border:"1px solid rgba(67,160,71,.3)",
              }}>{icon}</div>
              <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, margin:"0 0 12px", color:"#c8e6c9" }}>{title}</h3>
              <p style={{ fontSize:14, lineHeight:1.7, margin:0, color:"#a5d6a7" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── impact section ──
const Impact = () => {
  const [ref, inView] = useInView();

  const impactIcons = {
    community: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    recycle:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
    handshake:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    chart:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    city:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="18"/><rect x="16" y="8" width="7" height="13"/><rect x="4" y="7" width="3" height="3"/><rect x="4" y="13" width="3" height="3"/><rect x="10" y="7" width="3" height="3"/><rect x="10" y="13" width="3" height="3"/></svg>,
    skills:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  };

  const impacts = [
    { iconKey:"community", title:"Sustainable Communities", desc:"WasteZero initiatives build long-term habits and infrastructure for waste management at the community level." },
    { iconKey:"recycle",   title:"Waste Reduction at Scale", desc:"By connecting more hands to more drives, we help divert recyclables from landfills across cities." },
    { iconKey:"handshake", title:"Stronger NGO–Volunteer Bonds", desc:"Persistent profiles and match scoring mean NGOs build lasting volunteer relationships, not just one-time connections." },
    { iconKey:"chart",     title:"Measurable Change", desc:"Our impact tracking gives NGOs the data to report outcomes, attract funding, and demonstrate real-world results." },
    { iconKey:"city",      title:"Citywide Coverage", desc:"From urban centres to rural communities, WasteZero helps organizations reach volunteers in their area." },
    { iconKey:"skills",    title:"Skills-Based Matching", desc:"Whether you're a logistics expert or just have a free Saturday, we find the right opportunity for your skills." },
  ];

  return (
    <section id="impact" ref={ref} className="relative z-10" style={{
      padding:"120px 48px",
      fontFamily:font, position:"relative", overflow:"hidden",
    }}>
      <Blob style={{ width:500, height:500, bottom:"-10%", left:"-5%", opacity:.35 }} />

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div className={`scroll-reveal ${inView ? "visible" : "hidden"}`} style={{ textAlign:"center", marginBottom:64 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"5px 14px", borderRadius:99,
            marginBottom:16,
            background:"rgba(67,160,71,.15)",
            border:"1px solid rgba(67,160,71,.3)",
          }}>
            <span style={{ fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", color:"#81c784" }}>Our Impact</span>
          </div>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 44px)", fontWeight:900, margin:"0 0 16px", lineHeight:1.1, color:"#c8e6c9" }}>
            Real change,<br/>
            <span style={{ color:"#66bb6a" }}>measurable results</span>
          </h2>
          <p style={{ fontSize:16, maxWidth:480, margin:"0 auto", color:"#a5d6a7" }}>
            Every connection made on WasteZero ripples outward into communities, ecosystems, and futures.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:16 }}>
          {impacts.map(({ iconKey, title, desc }, i) => (
            <div key={title} className={`impact-item scroll-reveal ${inView ? "visible" : "hidden"}`} style={{
              transitionDelay:`${i * 70}ms`,
              display:"flex", alignItems:"flex-start", gap:18,
              padding:"24px 22px", borderRadius:16,
              background:"rgba(255,255,255,.05)",
              backdropFilter:"blur(12px)",
              border:"1px solid rgba(67,160,71,.2)",
            }}>
              <div style={{
                width:44, height:44, borderRadius:12, flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(67,160,71,.15)",
                border:"1px solid rgba(67,160,71,.3)",
              }}>{impactIcons[iconKey]}</div>
              <div>
                <h4 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 6px", color:"#c8e6c9" }}>{title}</h4>
                <p style={{ fontSize:13.5, lineHeight:1.65, margin:0, color:"#a5d6a7" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── CTA banner ──
const CTABanner = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="relative z-10" style={{
      padding:"100px 48px",
      fontFamily:font, position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:700, height:400, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(46,125,50,.2) 0%, transparent 70%)",
        pointerEvents:"none",
      }} />

      <div className={`scroll-reveal ${inView ? "visible" : "hidden"}`} style={{
        maxWidth:700, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1,
      }}>
        <h2 style={{ fontFamily:serif, fontSize:"clamp(28px, 4vw, 50px)", fontWeight:900, margin:"0 0 16px", lineHeight:1.1, color:"#c8e6c9" }}>
          Ready to make a difference?
        </h2>
        <p style={{ fontSize:17, lineHeight:1.7, margin:"0 0 44px", color:"#a5d6a7" }}>
          Join thousands of volunteers and NGOs already using WasteZero to build cleaner, more sustainable communities.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
          <button className="hero-btn" onClick={() => navigate("/register?role=volunteer")} style={{
            padding:"16px 32px", borderRadius:12,
            background:"#43a047", color:"#fff",
            fontFamily:font, fontSize:16, fontWeight:700, border:"none",
            cursor:"pointer",
          }}>
            Join as Volunteer
          </button>
          <button className="hero-btn" onClick={() => navigate("/register?role=volunteer")} style={{
            padding:"14px 28px", borderRadius:12,
            background:"#43a047", color:"#fff",
            fontFamily:font, fontSize:15, fontWeight:600, border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:8,
          }}>
            Register Your NGO
          </button>
        </div>
      </div>
    </section>
  );
};

// ── footer ──
const Footer = () => (
  <footer className="relative z-10" style={{
    padding:"48px 48px 32px",
    fontFamily:font,
    borderTop:"1px solid rgba(67,160,71,.15)",
  }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:24, marginBottom:32 }}>

        {/* Left — brand */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg, #43a047, #1b5e20)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </div>
          <span style={{ fontFamily:serif, fontSize:16, fontWeight:800, color:"#fff" }}>WasteZero</span>
        </div>

        {/* Center — Trademark */}
        <div style={{ flex:1, textAlign:"center" }}>
          <span style={{ fontSize:12, color:"#81c784" }}>WasteZero™</span>
        </div>

        {/* Right — links */}
        <div style={{ display:"flex", gap:20, justifyContent:"flex-end", flex:1 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <span key={l} style={{ fontSize:13, cursor:"pointer", transition:"color .2s", color:"#81c784" }}
              onMouseEnter={e => e.target.style.color="#c8e6c9"}
              onMouseLeave={e => e.target.style.color="#81c784"}
            >{l}</span>
          ))}

        </div>
      </div>
    </div>
  </footer>
);

// ── main export ──
const LandingPage = () => {
  return (
    <div style={{
      background:"linear-gradient(to bottom, #02140b, #052e16, #02140b)",
      minHeight:"100vh",
      color:"#a5d6a7",
    }}>
      <Nav />
      <Hero />
      <Why />
      <HowItWorks />
      <Impact />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default LandingPage;