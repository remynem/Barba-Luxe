import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        background: "#1C1209",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "40px", color: "#C9A96E" }}>
          Barba <em>Luxe</em>
        </div>
        <p style={{ color: "rgba(247,242,235,0.6)", fontSize: "15px", maxWidth: "400px", lineHeight: 1.7 }}>
          Une erreur inattendue s'est produite.<br />
          Rechargez la page ou revenez dans quelques instants.
        </p>
        <button
          onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
          style={{
            padding: "12px 28px",
            background: "#C9A96E",
            color: "#1C1209",
            border: "none",
            borderRadius: "2px",
            fontSize: "13px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Recharger
        </button>
        {process.env.NODE_ENV === "development" && (
          <pre style={{
            marginTop: "16px",
            padding: "16px",
            background: "rgba(255,0,0,0.08)",
            border: "1px solid rgba(255,0,0,0.2)",
            borderRadius: "4px",
            fontSize: "11px",
            color: "rgba(247,242,235,0.4)",
            maxWidth: "600px",
            overflow: "auto",
            textAlign: "left",
            whiteSpace: "pre-wrap",
          }}>
            {this.state.error?.toString()}
          </pre>
        )}
      </div>
    );
  }
}
