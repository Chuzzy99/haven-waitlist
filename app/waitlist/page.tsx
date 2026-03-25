"use client";
import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

type Faith = "christian" | "muslim";
type Step = "form" | "success";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [faith, setFaith] = useState<Faith>("christian");
  const [step, setStep] = useState<Step>("form");
  const [position, setPosition] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => {
        if (d.setupRequired) {
          console.warn("Setup required:", d.error);
          setCount(0);
        } else {
          setCount(d.count || 0);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch waitlist count:", error);
        setCount(0);
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let waitlistPosition = 0;

      // 1. Submit to internal API (Supabase) to store entry and get position
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, faith }),
        });
        const data = await res.json();
        
        if (res.ok) {
          waitlistPosition = data.position;
          setPosition(data.position);
          setTotal(data.total || count + 1);
        } else {
          console.error("Database error:", data.error || data.setupRequired);
          setError(data.error || "Submission failed. Please try again.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Internal waitlist API failed:", err);
        setError("Network error. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Send Welcome Email via EmailJS with the waitlist position
      try {
        const templateParams = {
          to_name: name || "Friend",
          to_email: email, // standard
          email: email,    // fallback
          user_email: email, // fallback
          deity: faith === "muslim" ? "Allah" : "God",
          position: waitlistPosition > 0 ? waitlistPosition : "",
        };
        
        await emailjs.send(
          "service_cypmfup",
          "template_7cixj27",
          templateParams,
          "R1A4JGpkiEa6TzO01"
        );
      } catch (err) {
        console.error("EmailJS Error:", err);
      }

      // Show success screen
      setStep("success");
    } catch (err) {
      console.error("General submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700;900&display=swap');
 * { box-sizing: border-box; margin: 0; padding: 0; }
 html { scroll-behavior: smooth; }
 body { background: #000000; color: #F0E6D0; font-family: 'Lato', sans-serif; }
 ::-webkit-scrollbar { width: 0; }
 input, textarea { font-family: 'Lora', serif; }
 input:focus, textarea:focus { outline: none; }
 @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
 @keyframes fadeIn { from{opacity:0} to{opacity:1} }
 @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
 @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(212,175,55,0.3)} 50%{box-shadow:0 0 60px rgba(212,175,55,0.6),0 0 100px rgba(212,175,55,0.2)} }
 @keyframes glowGreen{ 0%,100%{box-shadow:0 0 30px rgba(34,197,94,0.3)} 50%{box-shadow:0 0 60px rgba(34,197,94,0.6),0 0 100px rgba(34,197,94,0.2)} }
 @keyframes glowGold{ 0%,100%{box-shadow:0 0 30px rgba(212,175,55,0.4)} 50%{box-shadow:0 0 60px rgba(212,175,55,0.7),0 0 100px rgba(212,175,55,0.3)} }
 @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
 @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
 @keyframes countUp { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
 .fade-1 { animation: fadeUp 0.6s ease both; animation-delay: 0.1s; }
 .fade-2 { animation: fadeUp 0.6s ease both; animation-delay: 0.25s; }
 .fade-3 { animation: fadeUp 0.6s ease both; animation-delay: 0.4s; }
 .fade-4 { animation: fadeUp 0.6s ease both; animation-delay: 0.55s; }
 .fade-5 { animation: fadeUp 0.6s ease both; animation-delay: 0.7s; }
 .float { animation: float 4s ease-in-out infinite; }
 .success { animation: slideUp 0.5s ease both; }
 .faith-btn {
 flex: 1; padding: 14px 10px; border-radius: 12px; cursor: pointer;
 display: flex; flex-direction: column; align-items: center; gap: 6px;
 transition: all 0.2s; border: 1px solid transparent;
 }
 .faith-btn:hover { transform: translateY(-1px); }
 .submit-btn {
 width: 100%; padding: 18px; border: none; border-radius: 14px; cursor: pointer;
 font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 600;
 letter-spacing: 1px; transition: all 0.2s; color: #000000;
 background: linear-gradient(135deg, #1a1a1a, #D4AF37);
 }
 .submit-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 0 20px rgba(212,175,55,0.4); }
 .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
 .feature-card {
 background: rgba(20, 20, 20, 0.4); 
 backdrop-filter: blur(12px);
 border: 1px solid rgba(212,175,55,0.2);
 border-radius: 16px; padding: 22px;
 transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
 }
 .feature-card:hover { 
   border-color: rgba(212,175,55,0.5); 
   transform: translateY(-4px); 
   box-shadow: 0 12px 40px rgba(212,175,55,0.15);
   background: rgba(30, 30, 30, 0.6);
 }
 .social-proof {
 display: flex; align-items: center; gap: 12px;
 background: linear-gradient(145deg, #0a0a0a, #1a1a1a); border: 1px solid rgba(34,197,94,0.2);
 border-radius: 12px; padding: 12px 16px;
 margin-bottom: 8px;
 }
 `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#000000",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background orbs with new color scheme */}
        <div
          style={{
            position: "fixed",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "fixed",
            top: "40%",
            right: -150,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          {/* ── NAV ── */}
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "28px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#D4AF37",
                  letterSpacing: 4,
                }}
              >
                HAVEN
              </span>
            </div>
            <a
              href="#waitlist"
              style={{
                background: "linear-gradient(135deg, #1a1a1a, #D4AF37)",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                color: "#000000",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Lato, sans-serif",
                fontWeight: 700,
                letterSpacing: 0.8,
                textDecoration: "none",
              }}
            >
              Join Waitlist →
            </a>
          </nav>
          {/* ── HERO ── */}
          <section
            style={{ paddingTop: 60, paddingBottom: 80, textAlign: "center" }}
          >
            {/* Floating symbols */}
            <div
              className="float"
              style={{
                marginBottom: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  padding: "2px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.8), rgba(212,175,55,0.2))",
                  boxShadow: "0 0 40px rgba(212,175,55,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                   src="/logos/logo.jpg"
                   alt="Haven Logo"
                   style={{
                     width: "100%",
                     height: "100%",
                     borderRadius: "50%",
                     objectFit: "cover",
                   }}
                />
              </div>
            </div>
            <div className="fade-1">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 99,
                  padding: "6px 16px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#D4AF37",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: "#D4AF37",
                    fontWeight: 700,
                    letterSpacing: 1.5,
                  }}
                >
                  COMING SOON
                </span>
              </div>
            </div>
            <h1
              className="fade-2"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(42px, 8vw, 72px)",
                fontWeight: 700,
                color: "#F0E6D0",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              A Haven for
              <br />
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                your heart.
              </span>
            </h1>
            <p
              className="fade-3"
              style={{
                fontFamily: "Lora, serif",
                fontSize: "clamp(16px, 2.5vw, 19px)",
                color: "#8C7040",
                lineHeight: 1.9,
                fontStyle: "italic",
                marginBottom: 14,
                maxWidth: 480,
                margin: "0 auto 14px",
              }}
            >
              Guided by your faith.
            </p>
            <p
              className="fade-3"
              style={{
                fontFamily: "Lora, serif",
                fontSize: "clamp(14px, 2vw, 16px)",
                color: "#4A3A20",
                lineHeight: 1.9,
                marginBottom: 40,
                maxWidth: 520,
                margin: "0 auto 40px",
              }}
            >
              Haven is a daily spiritual companion for Christians and Muslims.
              Pour out your heart. Receive God's Word, a personal prayer, and a step
              to walk closer to Him — every single day.
            </p>
            {/* Count badge */}
            {count > 0 && (
              <div
                className="fade-4"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  marginBottom: 48,
                }}
              >
                <div style={{ display: "flex", gap: -4 }}>
                  {["✦", "✦", "✦"].map((e, i) => (
                    <span
                      key={i}
                      style={{ fontSize: 18, marginLeft: i > 0 ? -4 : 0 }}
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: 14,
                    color: "#D4AF37",
                    fontStyle: "italic",
                  }}
                >
                  <strong
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 18,
                      fontStyle: "normal",
                    }}
                  >
                    {count.toLocaleString()}
                  </strong>{" "}
                  people already waiting
                </span>
              </div>
            )}
            <a
              href="#waitlist"
              style={{
                display: "inline-block",
                padding: "18px 48px",
                background: "linear-gradient(135deg, #1a1a1a, #D4AF37)",
                border: "1px solid rgba(212,175,55,0.4)",
                borderRadius: 14,
                color: "#000000",
                fontSize: 18,
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 600,
                letterSpacing: 1,
                textDecoration: "none",
                animation: "glowGold 3s ease-in-out infinite",
              }}
            >
              Join the Waitlist ✦
            </a>
          </section>
          {/* ── HOW IT WORKS ── */}
          <section style={{ paddingBottom: 80 }}>
            <div
              style={{ textAlign: "center", marginBottom: 48 }}
            >
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: 11,
                  color: "#3A2D15",
                  fontWeight: 700,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                HOW IT WORKS
              </p>
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(28px, 5vw, 42px)",
                  color: "#F0E6D0",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Three steps.
                <br />
                <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                  One divine encounter.
                </span>
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  n: "01",
                  icon: "✦",
                  title: "Pour Out",
                  body: "Speak or type whatever is on your heart. No filter. No judgment. Haven listens.",
                },
                {
                  n: "02",
                  icon: "✦",
                  title: "The Word Meets You",
                  body: "AI delivers scripture, spiritual insight, and guidance from your own faith tradition.",
                },
                {
                  n: "03",
                  icon: "✦",
                  title: "Walk with God",
                  body: "A personal prayer and one practical step to walk closer to God — every single day.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="feature-card"
                  style={{ textAlign: "center" }}
                >
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 11,
                      color: "#D4AF37",
                      fontWeight: 700,
                      letterSpacing: 2,
                      marginBottom: 12,
                    }}
                  >
                    {item.n}
                  </div>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                  <h3
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 20,
                      color: "#F0E6D0",
                      fontWeight: 600,
                      marginBottom: 10,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Lora, serif",
                      fontSize: 13,
                      color: "#4A3A20",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
          {/* ── DUAL FAITH ── */}
          <section style={{ paddingBottom: 80 }}>
            <div
              style={{ textAlign: "center", marginBottom: 40 }}
            >
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: 11,
                  color: "#3A2D15",
                  fontWeight: 700,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                FOR BOTH FAITHS
              </p>
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(28px, 5vw, 42px)",
                  color: "#F0E6D0",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                One app.
                <br />
                <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                  Two sacred traditions.
                </span>
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Christian */}
              <div
                style={{
                  background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    marginBottom: 14,
                    animation: "glowGold 3s ease-in-out infinite",
                    display: "inline-block",
                  }}
                >
                  ✦
                </div>
                <h3
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 22,
                    color: "#D4AF37",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Christian
                </h3>
                  <p
                    style={{
                      fontFamily: "Lora, serif",
                      fontSize: 14,
                      color: "#A38B63",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                      marginBottom: 16,
                    }}
                  >
                    Bible verses, Christ-centred guidance, conversational prayer —
                    walking with Jesus every day.
                  </p>
                {["Holy Bible (NIV)", "Prayer & Reflection", "Walk with Christ"].map(
                  (f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#D4AF37",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Lora, serif",
                          fontSize: 13,
                          color: "#D4AF37",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  )
                )}
              </div>
              {/* Muslim */}
              <div
                style={{
                  background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    marginBottom: 14,
                    animation: "glowGreen 3s ease-in-out infinite",
                    display: "inline-block",
                  }}
                >
                  ✦
                </div>
                <h3
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 22,
                    color: "#22C55E",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Muslim
                </h3>
                <p
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: 14,
                    color: "#86EFAC",
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    marginBottom: 16,
                  }}
                >
                  Quranic ayahs, Islamic wisdom, heartfelt du'a — walking closer
                  to Allah every day.
                </p>
                {["Holy Quran & Hadith", "Du'a & Reflection", "Walk with Allah"].map(
                  (f, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#22C55E",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "Lora, serif",
                          fontSize: 13,
                          color: "#4ADE80",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
          {/* ── WHAT YOU GET ── */}
          <section style={{ paddingBottom: 80 }}>
            <div
              style={{ textAlign: "center", marginBottom: 40 }}
            >
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: 11,
                  color: "#3A2D15",
                  fontWeight: 700,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                EVERY SINGLE DAY
              </p>
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(28px, 5vw, 42px)",
                  color: "#F0E6D0",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Haven responds
                <br />
                <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                  like no one else can.
                </span>
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {[
                {
                  icon: "✦",
                  label: "Feels Heard",
                  body: "Warm acknowledgement that makes you feel completely safe before God.",
                },
                {
                  icon: "✦",
                  label: "God's Word",
                  body: "Scripture or ayah that speaks directly to what you shared.",
                },
                {
                  icon: "✦",
                  label: "Divine Voice",
                  body: faith === "muslim" ? "What Allah is saying to you right now through sacred text." : "What Christ is saying to you right now through sacred text.",
                },
                {
                  icon: "✦",
                  label: "Spiritual Insight",
                  body: "Deep wisdom connecting your feelings to eternal spiritual truth.",
                },
                {
                  icon: "✦",
                  label: "Personal Prayer",
                  body: "A prayer or du'a written specifically for your exact situation.",
                },
                {
                  icon: "✦",
                  label: "Your Step",
                  body: faith === "muslim" ? "One gentle, practical action to walk closer to Allah today." : "One gentle, practical action to walk closer to God today.",
                },
              ].map((item, i) => (
                <div key={i} className="feature-card">
                  <span
                    style={{ fontSize: 22, marginBottom: 10, display: "block" }}
                  >
                    {item.icon}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 17,
                      color: "#D4AF37",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </h3>
                    <p
                      style={{
                        fontFamily: "Lora, serif",
                        fontSize: 13,
                        color: "#A38B63",
                        lineHeight: 1.8,
                        fontStyle: "italic",
                      }}
                    >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
          {/* ── QUOTE ── */}
          <section
            style={{ paddingBottom: 80, textAlign: "center" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 20,
                padding: "48px 40px",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 20 }}>✦</div>
              <p
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  color: "#D4AF37",
                  lineHeight: 1.8,
                  fontStyle: "italic",
                  marginBottom: 16,
                  maxWidth: 480,
                  margin: "0 auto 16px",
                }}
              >
                "4.2 billion people share one need — a daily encounter with the God
                who made them."
              </p>
                  <p
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: 12,
                      color: "#A38B63",
                      fontWeight: 700,
                      letterSpacing: 1.5,
                    }}
                  >
                    HAVEN — 2025
                  </p>
            </div>
          </section>
          {/* ── WAITLIST FORM ── */}
          <section id="waitlist" style={{ paddingBottom: 100 }}>
            {step === "form" ? (
              <div
                style={{
                  background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 24,
                  padding: "clamp(28px, 6vw, 52px)",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <p
                    style={{
                      fontFamily: "Lato, sans-serif",
                      fontSize: 11,
                      color: "#D4AF37",
                      fontWeight: 700,
                      letterSpacing: 2,
                      marginBottom: 12,
                    }}
                  >
                    JOIN THE WAITLIST
                  </p>
                  <h2
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "clamp(28px, 5vw, 44px)",
                      color: "#F0E6D0",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: 12,
                    }}
                  >
                    Be first through the door.
                  </h2>
                  <p
                    style={{
                      fontFamily: "Lora, serif",
                      fontSize: 14,
                      color: "#A38B63",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                    }}
                  >
                    Sign up now and we'll notify you the moment Haven launches. No
                    spam — only the good news.
                  </p>
                </div>
                <form onSubmit={submit}>
                  {/* Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: 10,
                        color: "#D4AF37",
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      YOUR NAME (OPTIONAL)
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name…"
                      style={{
                        width: "100%",
                        background: "#000000",
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "#D4AF37",
                        fontSize: 15,
                        fontStyle: "italic",
                      }}
                    />
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: 10,
                        color: "#D4AF37",
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      YOUR EMAIL *
                    </label>
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      style={{
                        width: "100%",
                        background: "#000000",
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "#D4AF37",
                        fontSize: 15,
                        fontStyle: "italic",
                      }}
                    />
                  </div>
                  {/* Faith selector */}
                  <div style={{ marginBottom: 28 }}>
                    <label
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: 10,
                        color: "#3A2D15",
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      YOUR FAITH
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        {
                          value: "christian" as Faith,
                          label: "Christian",
                          icon: "✦",
                          color: "#D4AF37",
                          dim: "#1a1a1a",
                        },
                        {
                          value: "muslim" as Faith,
                          label: "Muslim",
                          icon: "✦",
                          color: "#22C55E",
                          dim: "#1a1a1a",
                        },

                      ].map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFaith(f.value)}
                          className="faith-btn"
                          style={{
                            background: faith === f.value
                              ? `linear-gradient(135deg, ${f.dim}, ${f.color}22)`
                              : "#000000",
                            border: `1px solid ${
                              faith === f.value ? f.color + "66" : "rgba(212,175,55,0.3)"
                            }`,
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{f.icon}</span>
                          <span
                            style={{
                              fontFamily: "Lora, serif",
                              fontSize: 13,
                              color: faith === f.value ? f.color : "#D4AF37",
                              fontWeight: faith === f.value ? 600 : 400,
                            }}
                          >
                            {f.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {error && (
                    <p
                      style={{
                        fontFamily: "Lora, serif",
                        fontSize: 13,
                        color: "#D4AF37",
                        marginBottom: 14,
                        fontStyle: "italic",
                      }}
                    >
                      {error}
                    </p>
                  )}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Joining…" : "Join the Waitlist ✦"}
                  </button>
                  <p
                    style={{
                      fontFamily: "Lora, serif",
                      fontSize: 12,
                      color: "#666666",
                      textAlign: "center",
                      marginTop: 14,
                      fontStyle: "italic",
                    }}
                  >
                    No spam. No selling your data. Only Haven.
                  </p>
                </form>
              </div>
            ) : (
              /* ── SUCCESS ── */
              <div
                className="success"
                style={{
                  background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                  border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: 24,
                  padding: "clamp(28px, 6vw, 52px)",
                  textAlign: "center",
                }}
              >
                <div
                  className="float"
                  style={{ fontSize: 52, marginBottom: 20 }}
                >
                  ✦
                </div>
                <p
                  style={{
                    fontFamily: "Lato, sans-serif",
                    fontSize: 11,
                    color: "#D4AF37",
                    fontWeight: 700,
                    letterSpacing: 2,
                    marginBottom: 12,
                  }}
                >
                  YOU'RE IN
                </p>
                <h2
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "clamp(28px, 5vw, 44px)",
                    color: "#F0E6D0",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    marginBottom: 14,
                  }}
                >
                  {faith === "muslim" ? "Alhamdulillah." : "Amen."}
                </h2>
                <p
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: 15,
                    color: "#8C7040",
                    lineHeight: 1.9,
                    fontStyle: "italic",
                    marginBottom: 36,
                  }}
                >
                  {name ? `${name}, you're` : "You're"} on the waitlist.{" "}
                  {faith === "muslim" ? "Allah" : "God"} placed this on your heart for a reason. We'll be in touch.
                </p>
                {/* Position */}
                {position > 0 && (
                  <div
                    style={{
                      background: "#000000",
                      border: "1px solid rgba(212,175,55,0.3)",
                      borderRadius: 16,
                      padding: "24px",
                      marginBottom: 36,
                      display: "inline-block",
                      minWidth: 220,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: 10,
                        color: "#D4AF37",
                        fontWeight: 700,
                        letterSpacing: 2,
                        marginBottom: 8,
                      }}
                    >
                      YOUR POSITION
                    </p>
                    <p
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: 56,
                        fontWeight: 700,
                        color: "#D4AF37",
                        lineHeight: 1,
                        marginBottom: 6,
                      }}
                    >
                      #{position}
                    </p>
                    <p
                      style={{
                        fontFamily: "Lato, sans-serif",
                        fontSize: 12,
                        color: "#666666",
                      }}
                    >
                      of {total.toLocaleString()} people waiting
                    </p>
                  </div>
                )}
                <p
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: 14,
                    color: "#A38B63",
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    marginBottom: 24,
                  }}
                >
                  Check your inbox — a confirmation email is on its way. Share Haven
                  with someone who needs it and help them find this too.
                </p>
                {/* Share */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      faith === "muslim"
                        ? "Just joined the waitlist for Haven — a daily spiritual companion. Pour out your heart. Receive guidance from Allah. \n\n"
                        : "Just joined the waitlist for Haven — a daily spiritual companion. Pour out your heart. Receive God's Word. \n\n"
                    )}&url=${encodeURIComponent(
                      process.env.NEXT_PUBLIC_SITE_URL || "https://yourhaven.app"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 22px",
                      background: "#0C0803",
                      border: "1px solid #1E1509",
                      borderRadius: 12,
                      color: "#8C7040",
                      fontSize: 13,
                      fontFamily: "Lato, sans-serif",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Share on X →
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      (faith === "muslim"
                        ? "I just joined the waitlist for Haven — a daily spiritual companion. Walk closer to Allah every day. Check it out: "
                        : "I just joined the waitlist for Haven — a daily spiritual companion. Walk closer to God every day. Check it out: ") +
                        (process.env.NEXT_PUBLIC_SITE_URL ||
                          "https://yourhaven.app")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 22px",
                      background: "linear-gradient(135deg, #2A1C08, #C9933A)",
                      border: "1px solid #C9933A44",
                      borderRadius: 12,
                      color: "#F0E6D0",
                      fontSize: 13,
                      fontFamily: "Lato, sans-serif",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Share on WhatsApp →
                  </a>
                </div>
              </div>
            )}
          </section>


          {/* ── FOOTER ── */}
          <footer
            style={{
              borderTop: "1px solid rgba(212,175,55,0.2)",
              padding: "32px 0 48px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <img src="/logos/logo.jpg" alt="Haven Logo" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)" }} />
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#D4AF37",
                  letterSpacing: 4,
                }}
              >
                HAVEN
              </span>
            </div>
            <p
              style={{
                fontFamily: "Lora, serif",
                fontSize: 13,
                color: "#D4AF37",
                fontStyle: "italic",
                marginBottom: 8,
              }}
            >
              "A Haven for your heart. Guided by your faith."
            </p>
            <p
              style={{
                fontFamily: "Lato, sans-serif",
                fontSize: 11,
                color: "#666666",
              }}
            >
              © {new Date().getFullYear()} Haven App. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
