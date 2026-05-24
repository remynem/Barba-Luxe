import { useState } from "react";
import { useConfig } from "../data/config.js";

export default function DevPanel() {
  const { config, toggleFlag } = useConfig();
  const [open, setOpen] = useState(false);

  if (!config.features.devPanel) return null;

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{
        position:"fixed", bottom:"20px", right:"20px", zIndex:9999,
        background:"#C9A96E", color:"#1C1209", border:"none",
        width:"44px", height:"44px", borderRadius:"50%", cursor:"pointer",
        fontSize:"18px", fontWeight:"bold", boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }} title="Config Panel">⚙</button>

      {open && (
        <div style={{
          position:"fixed", bottom:"74px", right:"20px", zIndex:9998,
          background:"rgba(28,18,9,0.97)", border:"1px solid rgba(201,169,110,0.3)",
          borderRadius:"8px", padding:"1.25rem", width:"240px",
          backdropFilter:"blur(12px)", boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
          maxHeight:"70vh", overflowY:"auto",
        }}>
          <div style={{fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase", color:"#C9A96E", marginBottom:"1rem", borderBottom:"1px solid rgba(201,169,110,0.2)", paddingBottom:"0.5rem"}}>
            Config · Dev Panel
          </div>

          <div style={{fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,242,235,0.4)", marginBottom:"0.6rem"}}>Sections</div>
          {Object.entries(config.sections).map(([key, val]) => (
            <label key={key} style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", cursor:"pointer"}}>
              <span style={{fontSize:"12px", color:"rgba(247,242,235,0.75)"}}>{key}</span>
              <div onClick={() => toggleFlag("sections", key)} style={{
                width:"32px", height:"18px", borderRadius:"9px", cursor:"pointer",
                background: val ? "#C9A96E" : "rgba(247,242,235,0.15)",
                position:"relative", transition:"background 0.2s", flexShrink:0,
              }}>
                <div style={{
                  position:"absolute", top:"3px", left: val ? "17px" : "3px",
                  width:"12px", height:"12px", borderRadius:"50%",
                  background:"white", transition:"left 0.2s",
                }}/>
              </div>
            </label>
          ))}

          <div style={{fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(247,242,235,0.4)", margin:"0.75rem 0 0.6rem"}}>Features</div>
          {Object.entries(config.features).filter(([k]) => k !== "devPanel").map(([key, val]) => (
            <label key={key} style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", cursor:"pointer"}}>
              <span style={{fontSize:"12px", color:"rgba(247,242,235,0.75)"}}>{key}</span>
              <div onClick={() => toggleFlag("features", key)} style={{
                width:"32px", height:"18px", borderRadius:"9px", cursor:"pointer",
                background: val ? "#C9A96E" : "rgba(247,242,235,0.15)",
                position:"relative", transition:"background 0.2s", flexShrink:0,
              }}>
                <div style={{
                  position:"absolute", top:"3px", left: val ? "17px" : "3px",
                  width:"12px", height:"12px", borderRadius:"50%",
                  background:"white", transition:"left 0.2s",
                }}/>
              </div>
            </label>
          ))}

          <div style={{marginTop:"1rem", fontSize:"10px", color:"rgba(247,242,235,0.3)", borderTop:"1px solid rgba(201,169,110,0.15)", paddingTop:"0.75rem", lineHeight:1.6}}>
            Désactiver <code style={{color:"#C9A96E"}}>features.devPanel</code> en production.
          </div>
        </div>
      )}
    </>
  );
}
