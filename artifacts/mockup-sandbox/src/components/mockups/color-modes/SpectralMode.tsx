export function SpectralMode() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <style>{`
        @keyframes spectralShift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1
          style={{
            background: "linear-gradient(90deg, #34D399, #60A5FA, #C084FC, #F472B6, #FB923C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Spectral
        </h1>
        <p
          style={{
            color: "rgba(192,132,252,0.6)",
            fontSize: 11,
            margin: "4px 0 0",
            letterSpacing: 1,
          }}
        >
          SELECTED · ACTIVE · ENGAGED
        </p>
      </div>

      {/* Tab Bar - Active Tab */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: "#111111",
          borderRadius: 14,
          padding: 4,
          border: "1px solid rgba(192,132,252,0.15)",
          position: "relative",
        }}
      >
        {["Discover", "Chats", "Search", "Profile"].map((tab, i) => (
          <div
            key={tab}
            style={{
              flex: 1,
              padding: "10px 0",
              textAlign: "center",
              fontSize: 12,
              fontWeight: i === 0 ? 600 : 500,
              color: i === 0 ? "#fff" : "rgba(45,212,191,0.5)",
              borderRadius: 10,
              background:
                i === 0
                  ? "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.2), rgba(192,132,252,0.2))"
                  : "transparent",
              border: i === 0 ? "1px solid rgba(192,132,252,0.25)" : "1px solid transparent",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {i === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  boxShadow:
                    "0 0 12px rgba(52,211,153,0.15), 0 0 12px rgba(96,165,250,0.15), 0 0 12px rgba(192,132,252,0.15)",
                  pointerEvents: "none",
                }}
              />
            )}
            {tab}
          </div>
        ))}
      </div>

      {/* Character Card - Selected / Active */}
      <div
        style={{
          background: "rgba(17,17,17,0.8)",
          borderRadius: 16,
          padding: 2,
          position: "relative",
          backgroundImage:
            "linear-gradient(135deg, rgba(52,211,153,0.4), rgba(96,165,250,0.4), rgba(192,132,252,0.4), rgba(244,114,182,0.4), rgba(251,146,60,0.3))",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(96,165,250,0.15), rgba(192,132,252,0.15), rgba(244,114,182,0.15))",
            filter: "blur(12px)",
            pointerEvents: "none",
            animation: "glowPulse 3s ease-in-out infinite",
          }}
        />
        <div
          style={{
            background: "rgba(10,10,10,0.92)",
            borderRadius: 14,
            padding: 16,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(96,165,250,0.25), rgba(192,132,252,0.25))",
                border: "1px solid rgba(192,132,252,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                boxShadow:
                  "0 0 16px rgba(52,211,153,0.2), 0 0 16px rgba(192,132,252,0.2)",
              }}
            >
              🏛️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 600 }}>
                Aristotle
              </div>
              <div
                style={{
                  background: "linear-gradient(90deg, #34D399, #60A5FA, #C084FC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: 12,
                  fontWeight: 500,
                  marginTop: 2,
                }}
              >
                Philosophy · Ethics & Logic
              </div>
            </div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: "#34D399",
                boxShadow: "0 0 8px rgba(52,211,153,0.6)",
              }}
            />
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              lineHeight: 1.5,
              margin: "12px 0 0",
            }}
          >
            Explore the nature of virtue and the good life through dialectical inquiry.
          </p>
        </div>
      </div>

      {/* Chat List Item - Active */}
      <div
        style={{
          background: "rgba(17,17,17,0.8)",
          borderRadius: 16,
          padding: 2,
          backgroundImage:
            "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(96,165,250,0.3), rgba(192,132,252,0.3))",
        }}
      >
        <div
          style={{
            background: "rgba(10,10,10,0.92)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.2), rgba(192,132,252,0.2))",
                border: "1px solid rgba(192,132,252,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: "0 0 12px rgba(96,165,250,0.15)",
              }}
            >
              🔬
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}>
                  Dr. Nova
                </span>
                <span
                  style={{
                    background: "linear-gradient(90deg, #34D399, #60A5FA)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  Now
                </span>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  marginTop: 3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Quantum entanglement creates fascinating possibilities...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Bubbles - Active */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "80%",
            background: "rgba(21,21,21,0.9)",
            borderRadius: "18px 18px 18px 4px",
            padding: "10px 14px",
            border: "1px solid rgba(96,165,250,0.15)",
            boxShadow: "0 0 8px rgba(96,165,250,0.05)",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            The unexamined life is not worth living, as Socrates would say.
          </p>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "80%",
            borderRadius: "18px 18px 4px 18px",
            padding: 2,
            backgroundImage:
              "linear-gradient(135deg, rgba(52,211,153,0.4), rgba(96,165,250,0.4), rgba(192,132,252,0.4))",
          }}
        >
          <div
            style={{
              background: "rgba(10,10,10,0.9)",
              borderRadius: "16px 16px 2px 16px",
              padding: "10px 14px",
            }}
          >
            <p
              style={{ color: "#FFFFFF", fontSize: 14, margin: 0, lineHeight: 1.5 }}
            >
              What does that mean in practice?
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills - Active */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Philosophy", active: true },
          { label: "Science", active: false },
          { label: "Creative", active: false },
          { label: "Wellness", active: false },
        ].map(({ label, active }) => (
          <div
            key={label}
            style={{
              padding: active ? 2 : 0,
              borderRadius: 22,
              backgroundImage: active
                ? "linear-gradient(135deg, #34D399, #60A5FA, #C084FC, #F472B6)"
                : "none",
            }}
          >
            <div
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: active ? "none" : "1px solid rgba(45,212,191,0.2)",
                background: active ? "rgba(10,10,10,0.9)" : "rgba(45,212,191,0.05)",
                color: active ? "#FFFFFF" : "rgba(45,212,191,0.5)",
                fontSize: 12,
                fontWeight: active ? 600 : 500,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar - Focused */}
      <div
        style={{
          borderRadius: 26,
          padding: 2,
          backgroundImage:
            "linear-gradient(135deg, rgba(52,211,153,0.4), rgba(96,165,250,0.4), rgba(192,132,252,0.4), rgba(244,114,182,0.3))",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 28,
            background:
              "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(96,165,250,0.1), rgba(192,132,252,0.1))",
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            background: "rgba(10,10,10,0.95)",
            borderRadius: 24,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, flex: 1 }}>
            Message Aristotle...
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #34D399, #60A5FA, #C084FC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              boxShadow:
                "0 0 12px rgba(52,211,153,0.3), 0 0 12px rgba(192,132,252,0.3)",
            }}
          >
            ↑
          </div>
        </div>
      </div>

      {/* CTA Button - Active */}
      <button
        style={{
          width: "100%",
          padding: 2,
          borderRadius: 16,
          border: "none",
          backgroundImage:
            "linear-gradient(135deg, #34D399, #60A5FA, #C084FC, #F472B6)",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 19,
            background:
              "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.2), rgba(192,132,252,0.2))",
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            background: "rgba(10,10,10,0.88)",
            borderRadius: 14,
            padding: "14px 0",
            position: "relative",
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #34D399, #60A5FA, #C084FC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Continue Conversation
          </span>
        </div>
      </button>

      {/* Spectral Gradient Swatch */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        {[
          { label: "Green", color: "#34D399" },
          { label: "Blue", color: "#60A5FA" },
          { label: "Violet", color: "#C084FC" },
          { label: "Pink", color: "#F472B6" },
          { label: "Orange", color: "#FB923C" },
        ].map(({ label, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: color,
                boxShadow: `0 0 10px ${color}44`,
                margin: "0 auto 4px",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
