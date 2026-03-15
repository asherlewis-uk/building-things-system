export function TealCore() {
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
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1
          style={{
            color: "#2DD4BF",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Teal-Core
        </h1>
        <p
          style={{
            color: "rgba(45,212,191,0.5)",
            fontSize: 11,
            margin: "4px 0 0",
            letterSpacing: 1,
          }}
        >
          INACTIVE · DEFAULT · UNSELECTED
        </p>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: "#111111",
          borderRadius: 14,
          padding: 4,
          border: "1px solid rgba(45,212,191,0.15)",
        }}
      >
        {["Discover", "Chats", "Search", "Profile"].map((tab) => (
          <div
            key={tab}
            style={{
              flex: 1,
              padding: "10px 0",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(45,212,191,0.6)",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Character Card - Inactive */}
      <div
        style={{
          background: "#111111",
          borderRadius: 16,
          border: "1px solid rgba(45,212,191,0.2)",
          padding: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            boxShadow: "inset 0 0 30px rgba(45,212,191,0.03)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(45,212,191,0.05))",
              border: "1px solid rgba(45,212,191,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🏛️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#E5E5E5", fontSize: 15, fontWeight: 600 }}>
              Aristotle
            </div>
            <div style={{ color: "rgba(45,212,191,0.5)", fontSize: 12, marginTop: 2 }}>
              Philosophy · Ethics & Logic
            </div>
          </div>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "rgba(45,212,191,0.3)",
            }}
          />
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            lineHeight: 1.5,
            margin: "12px 0 0",
          }}
        >
          Explore the nature of virtue and the good life through dialectical inquiry.
        </p>
      </div>

      {/* Chat List Item - Unread (inactive) */}
      <div
        style={{
          background: "#111111",
          borderRadius: 16,
          border: "1px solid rgba(45,212,191,0.12)",
          padding: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(45,212,191,0.12), rgba(45,212,191,0.04))",
              border: "1px solid rgba(45,212,191,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🔬
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#D4D4D4", fontSize: 14, fontWeight: 500 }}>
                Dr. Nova
              </span>
              <span style={{ color: "rgba(45,212,191,0.35)", fontSize: 11 }}>
                2h ago
              </span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
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

      {/* Message Bubble - Inactive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "80%",
            background: "#151515",
            borderRadius: "18px 18px 18px 4px",
            padding: "10px 14px",
            border: "1px solid rgba(45,212,191,0.1)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            The unexamined life is not worth living, as Socrates would say.
          </p>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "80%",
            background: "rgba(45,212,191,0.08)",
            borderRadius: "18px 18px 4px 18px",
            padding: "10px 14px",
            border: "1px solid rgba(45,212,191,0.15)",
          }}
        >
          <p style={{ color: "rgba(45,212,191,0.7)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            What does that mean in practice?
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Philosophy", "Science", "Creative", "Wellness"].map((cat) => (
          <div
            key={cat}
            style={{
              padding: "7px 14px",
              borderRadius: 20,
              border: "1px solid rgba(45,212,191,0.2)",
              background: "rgba(45,212,191,0.05)",
              color: "rgba(45,212,191,0.55)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div
        style={{
          background: "#111111",
          borderRadius: 24,
          border: "1px solid rgba(45,212,191,0.15)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "rgba(45,212,191,0.3)", fontSize: 14, flex: 1 }}>
          Message Aristotle...
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: "rgba(45,212,191,0.1)",
            border: "1px solid rgba(45,212,191,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(45,212,191,0.4)",
            fontSize: 14,
          }}
        >
          ↑
        </div>
      </div>

      {/* Button - Inactive */}
      <button
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          border: "1px solid rgba(45,212,191,0.25)",
          background: "rgba(45,212,191,0.06)",
          color: "rgba(45,212,191,0.6)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: 0.5,
        }}
      >
        Start Conversation
      </button>

      {/* Color Swatch */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        {[
          { label: "Teal", color: "#2DD4BF" },
          { label: "20%", color: "rgba(45,212,191,0.2)" },
          { label: "10%", color: "rgba(45,212,191,0.1)" },
          { label: "Border", color: "rgba(45,212,191,0.15)" },
          { label: "BG", color: "#111111" },
        ].map(({ label, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: color,
                border: "1px solid rgba(45,212,191,0.3)",
                margin: "0 auto 4px",
              }}
            />
            <span style={{ color: "rgba(45,212,191,0.4)", fontSize: 9 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
