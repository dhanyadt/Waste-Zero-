import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, Download, RotateCcw, FileText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const T = {
  gDark:"#2e7d32", gMid:"#43a047", gPale:"#e8f5e9", gSage:"#a5c8a0",
  bDark:"#3e2723", bMid:"#5d4037",
  bPale:"#efebe9", bSand:"#d7ccc8",
  textDark:"#1c1008", textMid:"#4b3f36", textSoft:"#7b6b63",
};
const font  = "'DM Sans', sans-serif";
const serif = "'Fraunces', serif";
const COLORS = ["#43a047", "#1976d2", "#e53935", "#fb8c00", "#7b1fa2"];

const css = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .report-card { animation: fadeUp .3s ease both; }
`;

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo)   params.append("date_to",   dateTo);
      const res = await API.get(`/admin/reports?${params}`);
      setReports(res.data.reports || null);
    } catch (err) {
      console.error("Reports fetch error:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── CSV download ──────────────────────────────────────────
  const handleDownloadCSV = () => {
    if (!reports) return;
    const { users, opportunities, messages } = reports;
    const rows = [
      ["Section", "Metric", "Value"],
      ["Users", "Total", users.totalUsers],
      ["Users", "Active", users.activeUsers],
      ["Users", "Suspended", users.suspendedUsers],
      ["Users", "Volunteers", users.roles?.volunteers],
      ["Users", "NGOs", users.roles?.ngo],
      ["Users", "Admins", users.roles?.admin],
      ["Opportunities", "Total", opportunities.totalOpportunities],
      ["Messages", "Total", messages.totalMessages],
      ...(messages.topActiveVolunteers || []).map(v => ["Top Volunteers", v.name, v.count]),
      ...(opportunities.opportunitiesByLocation || []).map(l => ["Opps by Location", l._id || "Unknown", l.count]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `wastezero-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ── PDF download ──────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!reports) return;
    const { users, opportunities, messages } = reports;
    const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>WasteZero Reports</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c1008; background: #fff; padding: 40px; }
    h1 { font-size: 28px; font-weight: 900; color: #2e7d32; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #7b6b63; margin-bottom: 32px; }
    h2 { font-size: 16px; font-weight: 700; color: #2e7d32; margin: 28px 0 12px; border-bottom: 2px solid #e8f5e9; padding-bottom: 6px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
    .card { border-radius: 10px; padding: 18px; border-top: 3px solid #43a047; background: #f7fdf7; }
    .card .val { font-size: 28px; font-weight: 900; color: #1c1008; }
    .card .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #7b6b63; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #e8f5e9; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: #5d4037; }
    td { padding: 10px 14px; border-bottom: 1px solid #efebe9; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #efebe9; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>WasteZero — Reports & Analytics</h1>
  <p class="subtitle">Generated on ${date}${dateFrom || dateTo ? ` &nbsp;|&nbsp; Period: ${dateFrom || "—"} to ${dateTo || "—"}` : ""}</p>

  <h2>Summary</h2>
  <div class="grid">
    <div class="card"><div class="val">${users.totalUsers ?? "—"}</div><div class="lbl">Total Users</div></div>
    <div class="card"><div class="val">${users.activeUsers ?? "—"}</div><div class="lbl">Active Users</div></div>
    <div class="card"><div class="val">${opportunities.totalOpportunities ?? "—"}</div><div class="lbl">Opportunities</div></div>
    <div class="card"><div class="val">${messages.totalMessages ?? "—"}</div><div class="lbl">Messages</div></div>
  </div>

  <h2>Users by Role</h2>
  <table>
    <tr><th>Role</th><th>Count</th></tr>
    <tr><td>Volunteers</td><td>${users.roles?.volunteers ?? "—"}</td></tr>
    <tr><td>NGOs</td><td>${users.roles?.ngo ?? "—"}</td></tr>
    <tr><td>Admins</td><td>${users.roles?.admin ?? "—"}</td></tr>
  </table>

  <h2>User Status</h2>
  <table>
    <tr><th>Status</th><th>Count</th></tr>
    <tr><td>Active</td><td>${users.activeUsers ?? "—"}</td></tr>
    <tr><td>Suspended</td><td>${users.suspendedUsers ?? "—"}</td></tr>
  </table>

  ${opportunities.opportunitiesByLocation?.length ? `
  <h2>Opportunities by Location</h2>
  <table>
    <tr><th>#</th><th>Location</th><th>Opportunities</th></tr>
    ${opportunities.opportunitiesByLocation.slice(0, 10).map((l, i) => `
    <tr><td>${i + 1}</td><td>${l._id || "Unknown"}</td><td>${l.count}</td></tr>
    `).join("")}
  </table>` : ""}

  ${opportunities.opportunitiesByNGO?.length ? `
  <h2>Opportunities per NGO</h2>
  <table>
    <tr><th>#</th><th>NGO Name</th><th>Opportunities</th></tr>
    ${opportunities.opportunitiesByNGO.map((item, i) => `
    <tr><td>${i + 1}</td><td>${item.name || "Unknown"}</td><td>${item.count}</td></tr>
    `).join("")}
  </table>` : ""}

  ${messages.topActiveVolunteers?.length ? `
  <h2>Top Active Volunteers</h2>
  <table>
    <tr><th>#</th><th>Volunteer</th><th>Applications</th></tr>
    ${messages.topActiveVolunteers.map((v, i) => `
    <tr><td>${i + 1}</td><td>${v.name}</td><td>${v.count}</td></tr>
    `).join("")}
  </table>` : ""}

  <div class="footer">WasteZero Admin Reports &nbsp;•&nbsp; ${date}</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = window.URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    // Give browser time to load then trigger print-to-PDF
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
    window.URL.revokeObjectURL(url);
  };

  const cardBg     = darkMode ? "#2a2a2a" : "#fff";
  const cardBorder = darkMode ? "rgba(255,255,255,.1)" : T.bSand;

  const userRoleData = reports ? [
    { name:"Volunteers", count: reports.users.roles?.volunteers || 0 },
    { name:"NGOs",       count: reports.users.roles?.ngo        || 0 },
    { name:"Admins",     count: reports.users.roles?.admin      || 0 },
  ] : [];

  const userStatusData = reports ? [
    { name:"Active",    value: reports.users.activeUsers    || 0 },
    { name:"Suspended", value: reports.users.suspendedUsers || 0 },
  ] : [];

  const topLocationData = reports
    ? (reports.opportunities.opportunitiesByLocation || []).slice(0,8).map(l => ({ name: l._id || "Unknown", count: l.count }))
    : [];

  const topVolunteersData = reports
    ? (reports.messages.topActiveVolunteers || []).map(v => ({ name: v.name, count: v.count }))
    : [];

  return (
    <div style={{
      display:"flex", minHeight:"100vh", fontFamily:font,
    }}>
      <style>{css}</style>
      <AdminSidebar />

      <main style={{ flex:1, padding:"40px 36px", overflowY:"auto", position:"relative" }}>

        {/* Header — title color works in both light and dark mode */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <TrendingUp size={24} color="#43a047" />
            </div>
            <div>
              {/* solid white in both modes — gradient was invisible in dark mode */}
              <h1 style={{
                fontFamily:serif, fontSize:32, fontWeight:900, margin:0,
                color: "#fff",
              }}>
                Reports & Analytics
              </h1>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", margin:4 }}>
                Platform insights and statistics
              </p>
            </div>
          </div>
        </div>

        {/* Date filter bar */}
        <div style={{
          background: cardBg, borderRadius:20, padding:"24px 28px", marginBottom:28,
          border:`1px solid ${cardBorder}`,
          boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
        }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, alignItems:"flex-end" }}>
            {[
              { label:"From", value:dateFrom, set:setDateFrom, max:dateTo },
              { label:"To",   value:dateTo,   set:setDateTo,   min:dateFrom },
            ].map(({ label, value, set, min, max }) => (
              <div key={label}>
                <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, marginBottom:6 }}>{label}</div>
                <input type="date" value={value} min={min} max={max}
                  onChange={e => set(e.target.value)}
                  style={{
                    padding:"10px 14px", borderRadius:10,
                    border:`1px solid ${darkMode ? "#555" : T.bSand}`,
                    background: darkMode ? "#333" : "#f8fafc",
                    color: darkMode ? "#eee" : T.textDark, fontSize:14,
                  }}
                />
              </div>
            ))}

            <button onClick={fetchReports} disabled={loading} style={{
              padding:"10px 20px", borderRadius:10, border:"none",
              background:`linear-gradient(135deg, ${T.gMid}, ${T.gDark})`,
              color:"#fff", fontWeight:600, cursor: loading ? "wait" : "pointer",
              display:"flex", alignItems:"center", gap:8, fontSize:14,
              boxShadow:"0 4px 14px rgba(67,160,71,.4)",
            }}>
              <RotateCcw size={16}/> {loading ? "Loading..." : "Filter"}
            </button>

            {/* ── CSV ── */}
            <button onClick={handleDownloadCSV} disabled={!reports} style={{
              padding:"10px 20px", borderRadius:10, border:"none",
              background: reports ? "linear-gradient(135deg, #1976d2, #1565c0)" : "#e5e7eb",
              color: reports ? "#fff" : "#9ca3af", fontWeight:600,
              cursor: reports ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", gap:8, fontSize:14,
              boxShadow: reports ? "0 4px 14px rgba(25,118,210,.4)" : "none",
            }}>
              <Download size={16}/> Download CSV
            </button>

            {/* ── PDF — NEW ── */}
            <button onClick={handleDownloadPDF} disabled={!reports} style={{
              padding:"10px 20px", borderRadius:10, border:"none",
              background: reports ? "linear-gradient(135deg, #e53935, #b71c1c)" : "#e5e7eb",
              color: reports ? "#fff" : "#9ca3af", fontWeight:600,
              cursor: reports ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", gap:8, fontSize:14,
              boxShadow: reports ? "0 4px 14px rgba(229,57,53,.4)" : "none",
            }}>
              <FileText size={16}/> Download PDF
            </button>
          </div>
          {error && <p style={{ color:"#ef4444", marginTop:12, fontSize:13 }}>{error}</p>}
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0", color: darkMode ? "#666" : T.textSoft }}>
            <TrendingUp size={56} style={{ opacity:.4, display:"block", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:17 }}>Loading reports...</p>
          </div>
        )}

        {reports && (
          <>
            {/* Summary cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:28 }}>
              {[
                { label:"Total Users",        value: reports.users.totalUsers,                accent:T.gMid },
                { label:"Active Users",        value: reports.users.activeUsers,               accent:"#22c55e" },
                { label:"Total Opportunities", value: reports.opportunities.totalOpportunities, accent:"#1976d2" },
                { label:"Total Messages",      value: reports.messages.totalMessages,           accent:"#fb8c00" },
              ].map(({ label, value, accent }, i) => (
                <div key={label} className="report-card" style={{
                  borderRadius:18, background: cardBg,
                  borderTop:`4px solid ${accent}`, padding:"22px 24px",
                  border:`1px solid ${cardBorder}`,
                  boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
                  animationDelay:`${i * 0.07}s`,
                }}>
                  <div style={{ fontFamily:serif, fontSize:34, fontWeight:900, color: darkMode ? "#fff" : T.textDark, lineHeight:1 }}>
                    {value ?? "—"}
                  </div>
                  <div style={{ fontSize:12, color: darkMode ? "#aaa" : T.textSoft, fontWeight:600, marginTop:6, textTransform:"uppercase", letterSpacing:".5px" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              <div className="report-card" style={{
                background: cardBg, borderRadius:20, padding:"28px",
                border:`1px solid ${cardBorder}`,
                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
                animationDelay:"0.28s",
              }}>
                <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 20px", color: darkMode ? "#fff" : T.textDark }}>
                  Users by Role
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={userRoleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#f0f0f0"} />
                    <XAxis dataKey="name" tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:12 }} />
                    <Tooltip contentStyle={{ background: darkMode ? "#2a2a2a" : "#fff", border:`1px solid ${cardBorder}`, borderRadius:10 }} />
                    <Bar dataKey="count" fill="#43a047" radius={[6,6,0,0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="report-card" style={{
                background: cardBg, borderRadius:20, padding:"28px",
                border:`1px solid ${cardBorder}`,
                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
                animationDelay:"0.35s",
              }}>
                <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 20px", color: darkMode ? "#fff" : T.textDark }}>
                  User Status
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{ stroke: darkMode ? "#666" : "#ccc" }}
                    >
                      {userStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: darkMode ? "#2a2a2a" : "#fff", border:`1px solid ${cardBorder}`, borderRadius:10 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              <div className="report-card" style={{
                background: cardBg, borderRadius:20, padding:"28px",
                border:`1px solid ${cardBorder}`,
                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
                animationDelay:"0.42s",
              }}>
                <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 20px", color: darkMode ? "#fff" : T.textDark }}>
                  Opportunities by Location
                </h3>
                {topLocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topLocationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#f0f0f0"} />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:11 }} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:11 }} />
                      <Tooltip contentStyle={{ background: darkMode ? "#2a2a2a" : "#fff", border:`1px solid ${cardBorder}`, borderRadius:10 }} />
                      <Bar dataKey="count" fill="#1976d2" radius={[0,6,6,0]} name="Opportunities" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: darkMode ? "#666" : T.textSoft, fontSize:14 }}>No location data available.</p>
                )}
              </div>

              <div className="report-card" style={{
                background: cardBg, borderRadius:20, padding:"28px",
                border:`1px solid ${cardBorder}`,
                boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
                animationDelay:"0.49s",
              }}>
                <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 20px", color: darkMode ? "#fff" : T.textDark }}>
                  Top Active Volunteers
                </h3>
                {topVolunteersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topVolunteersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#f0f0f0"} />
                      <XAxis dataKey="name" tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: darkMode ? "#aaa" : T.textMid, fontSize:12 }} />
                      <Tooltip contentStyle={{ background: darkMode ? "#2a2a2a" : "#fff", border:`1px solid ${cardBorder}`, borderRadius:10 }} />
                      <Bar dataKey="count" fill="#fb8c00" radius={[6,6,0,0]} name="Applications" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: darkMode ? "#666" : T.textSoft, fontSize:14 }}>No volunteer activity data.</p>
                )}
              </div>
            </div>

            {/* NGO table */}
            <div className="report-card" style={{
              background: cardBg, borderRadius:20, padding:"28px",
              border:`1px solid ${cardBorder}`,
              boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 20px rgba(0,0,0,.1)",
              animationDelay:"0.56s",
            }}>
              <h3 style={{ fontFamily:serif, fontSize:16, fontWeight:700, margin:"0 0 20px", color: darkMode ? "#fff" : T.textDark }}>
                Opportunities Created per NGO
              </h3>
              {reports.opportunities.opportunitiesByNGO?.length > 0 ? (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ borderBottom:`2px solid ${darkMode ? "rgba(255,255,255,.1)" : T.bSand}` }}>
                        {["#", "NGO Name", "Opportunities"].map(h => (
                          <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".8px", color: darkMode ? "#888" : T.textSoft }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.opportunities.opportunitiesByNGO.map((item, i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${darkMode ? "rgba(255,255,255,.05)" : T.bPale}` }}>
                          <td style={{ padding:"12px 14px", fontSize:13, color: darkMode ? "#888" : T.textSoft }}>{i + 1}</td>
                          <td style={{ padding:"12px 14px", fontSize:14, fontWeight:600, color: darkMode ? "#ddd" : T.textDark }}>{item.name || "Unknown"}</td>
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, background:T.gPale, color:T.gDark }}>
                              {item.count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: darkMode ? "#666" : T.textSoft, fontSize:14 }}>No NGO data available.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminReports;