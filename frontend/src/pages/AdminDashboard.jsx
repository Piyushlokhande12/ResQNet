import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, AlertTriangle, CheckCircle, Clock, Ban, Shield, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";

const PIE_COLORS = ["#e53e3e","#3182ce","#d69e2e","#805ad5","#d53f8c","#2b6cb0"];
const TABS = ["overview","incidents","users","role-requests","analytics"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [roleRequests, setRoleRequests] = useState([]);
  const [tab, setTab]             = useState("overview");
  const [loading, setLoading]     = useState(true);
  const [roleModal, setRoleModal] = useState(null);
  const [roleForm, setRoleForm]   = useState({ role:"responder", responderType:"ambulance", badgeId:"", department:"" });

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (tab === "role-requests") loadRoleRequests(); }, [tab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s,u,a] = await Promise.all([api.get("/admin/dashboard"), api.get("/admin/users"), api.get("/admin/analytics")]);
      setStats(s.data.stats); setUsers(u.data.users); setAnalytics(a.data.analytics);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  const loadRoleRequests = async () => {
    try { const {data} = await api.get("/role-requests"); setRoleRequests(data.requests||[]); }
    catch { toast.error("Failed to load role requests"); }
  };

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`);
      setUsers(prev => prev.map(u => u._id===userId ? {...u, isBlocked:!isBlocked} : u));
      toast.success(`User ${isBlocked?"unblocked":"blocked"}`);
    } catch { toast.error("Action failed"); }
  };

  const approveRequest = async (id) => {
    try {
      const {data} = await api.patch(`/role-requests/${id}/approve`, { adminNote:"Your application has been approved. Welcome to the team!" });
      toast.success(data.message); loadRoleRequests(); loadAll();
    } catch(err) { toast.error(err.response?.data?.message||"Failed"); }
  };

  const rejectRequest = async (id) => {
    const note = prompt("Reason for rejection (optional):") || "Application not approved at this time.";
    try { await api.patch(`/role-requests/${id}/reject`, {adminNote:note}); toast.success("Request rejected"); loadRoleRequests(); }
    catch(err) { toast.error(err.response?.data?.message||"Failed"); }
  };

  const handleDirectRoleChange = async () => {
    if (!roleModal) return;
    try {
      await api.patch(`/role-requests/direct-role/${roleModal._id}`, roleForm);
      toast.success(`Role updated to ${roleForm.role}`);
      setRoleModal(null);
      setUsers(prev => prev.map(u => u._id===roleModal._id ? {...u, role:roleForm.role} : u));
    } catch(err) { toast.error(err.response?.data?.message||"Failed"); }
  };

  const pendingCount = roleRequests.filter(r => r.status==="pending").length;
  if (loading) return <div style={{padding:28,color:"var(--text-muted)"}}>Loading...</div>;

  const statCards = [
    {label:"Total Users",value:stats?.totalUsers,icon:Users,color:"var(--info)"},
    {label:"Total Incidents",value:stats?.totalIncidents,icon:AlertTriangle,color:"var(--primary)"},
    {label:"Pending",value:stats?.pendingIncidents,icon:Clock,color:"var(--warning)"},
    {label:"Resolved",value:stats?.resolvedIncidents,icon:CheckCircle,color:"var(--success)"},
  ];

  return (
    <div style={{padding:28}}>
      <h1 style={{fontSize:22,fontWeight:700,marginBottom:20}}>Admin Dashboard</h1>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {statCards.map(({label,value,icon:Icon,color}) => (
          <div key={label} className="card" style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:10,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon size={22} color={color}/>
            </div>
            <div>
              <div style={{fontSize:24,fontWeight:700}}>{value??0}</div>
              <div style={{fontSize:12,color:"var(--text-muted)"}}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--bg-card)",padding:4,borderRadius:10,width:"fit-content"}}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,textTransform:"capitalize",background:tab===t?"var(--primary)":"transparent",color:tab===t?"white":"var(--text-muted)",transition:"all 0.2s",position:"relative"}}>
            {t.replace("-"," ")}
            {t==="role-requests" && pendingCount>0 && (
              <span style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",background:"var(--primary)",color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div className="card">
            <h2 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Incidents by Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats?.typeBreakdown?.map(t=>({name:t._id,value:t.count}))||[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats?.typeBreakdown?.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 style={{fontSize:14,fontWeight:600,marginBottom:14}}>Recent Incidents</h2>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {stats?.recentIncidents?.slice(0,6).map(inc => (
                <div key={inc._id} onClick={() => navigate("/incidents/"+inc._id)}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",background:"var(--bg-surface)",borderRadius:8,cursor:"pointer",fontSize:13}}>
                  <div>
                    <span style={{fontWeight:500,textTransform:"capitalize"}}>{inc.emergencyType?.replace("_"," ")}</span>
                    <span style={{color:"var(--text-muted)",marginLeft:8,fontSize:12}}>{inc.user?.name}</span>
                  </div>
                  <span className={"badge badge-"+inc.status} style={{fontSize:11}}>{inc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INCIDENTS */}
      {tab==="incidents" && (
        <div className="card">
          <h2 style={{fontSize:14,fontWeight:600,marginBottom:16}}>All Incidents</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid var(--border)"}}>
                  {["ID","Type","User","Status","Date","Action"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"var(--text-muted)",fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.recentIncidents?.map(inc=>(
                  <tr key={inc._id} style={{borderBottom:"1px solid var(--border)"}}>
                    <td style={{padding:"10px 12px",color:"var(--text-muted)"}}>#{inc._id.slice(-6)}</td>
                    <td style={{padding:"10px 12px",textTransform:"capitalize"}}>{inc.emergencyType?.replace("_"," ")}</td>
                    <td style={{padding:"10px 12px"}}>{inc.user?.name||"—"}</td>
                    <td style={{padding:"10px 12px"}}><span className={"badge badge-"+inc.status}>{inc.status}</span></td>
                    <td style={{padding:"10px 12px",color:"var(--text-muted)"}}>{new Date(inc.createdAt).toLocaleDateString()}</td>
                    <td style={{padding:"10px 12px"}}>
                      <button className="btn btn-outline" style={{fontSize:11,padding:"4px 10px"}} onClick={()=>navigate("/incidents/"+inc._id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab==="users" && (
        <div className="card">
          <h2 style={{fontSize:14,fontWeight:600,marginBottom:16}}>User Management</h2>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid var(--border)"}}>
                  {["Name","Email","Phone","Role","Status","Fake Alerts","Actions"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"var(--text-muted)",fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u._id} style={{borderBottom:"1px solid var(--border)"}}>
                    <td style={{padding:"10px 12px",fontWeight:500}}>{u.name}</td>
                    <td style={{padding:"10px 12px",color:"var(--text-muted)"}}>{u.email}</td>
                    <td style={{padding:"10px 12px"}}>{u.phone}</td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{textTransform:"capitalize",fontSize:12,
                        background:u.role==="admin"?"rgba(229,62,62,0.12)":u.role==="responder"?"rgba(56,161,105,0.12)":"var(--bg-surface)",
                        color:u.role==="admin"?"var(--primary)":u.role==="responder"?"var(--success)":"var(--text-muted)",
                        borderRadius:6,padding:"2px 8px"}}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{fontSize:12,color:u.isBlocked?"var(--primary)":"var(--success)"}}>{u.isBlocked?"Blocked":"Active"}</span>
                    </td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}>{u.fakeAlertCount||0}</td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-outline" style={{fontSize:11,padding:"4px 10px",color:"var(--info)"}}
                          onClick={()=>{setRoleModal(u);setRoleForm({role:u.role,responderType:"ambulance",badgeId:"",department:""});}}>
                          <Shield size={11}/> Role
                        </button>
                        <button className="btn btn-outline" style={{fontSize:11,padding:"4px 10px",color:u.isBlocked?"var(--success)":"var(--primary)"}}
                          onClick={()=>toggleBlock(u._id,u.isBlocked)}>
                          <Ban size={11}/> {u.isBlocked?"Unblock":"Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROLE REQUESTS */}
      {tab==="role-requests" && (
        <div className="card">
          <h2 style={{fontSize:14,fontWeight:600,marginBottom:16}}>
            Role Requests
            {pendingCount>0 && <span style={{marginLeft:8,fontSize:12,background:"rgba(229,62,62,0.12)",color:"var(--primary)",borderRadius:6,padding:"2px 8px"}}>{pendingCount} pending</span>}
          </h2>
          {roleRequests.length===0 ? (
            <div style={{textAlign:"center",padding:40,color:"var(--text-muted)"}}>No role requests yet.</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {roleRequests.map(r => (
                <div key={r._id} style={{background:"var(--bg-surface)",borderRadius:10,padding:"16px 18px",
                  border:`1px solid ${r.status==="pending"?"rgba(214,158,46,0.3)":r.status==="approved"?"rgba(56,161,105,0.3)":"rgba(229,62,62,0.2)"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:36,height:36,borderRadius:8,background:"var(--bg-card)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"var(--primary)"}}>
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{r.user?.name}</div>
                          <div style={{fontSize:12,color:"var(--text-muted)"}}>{r.user?.email} · {r.user?.phone}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:16,fontSize:12,marginBottom:8,flexWrap:"wrap"}}>
                        <span><span style={{color:"var(--text-muted)"}}>Type: </span><strong style={{textTransform:"capitalize"}}>{r.responderType}</strong></span>
                        <span><span style={{color:"var(--text-muted)"}}>Badge: </span><strong>{r.badgeId}</strong></span>
                        <span><span style={{color:"var(--text-muted)"}}>Dept: </span><strong>{r.department}</strong></span>
                        <span style={{color:"var(--text-muted)"}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{fontSize:12,color:"var(--text-muted)",background:"var(--bg-card)",borderRadius:6,padding:"6px 10px"}}>"{r.reason}"</div>
                      {r.adminNote && <div style={{fontSize:12,color:"var(--warning)",marginTop:6}}>📝 {r.adminNote}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                      <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,
                        color:r.status==="pending"?"var(--warning)":r.status==="approved"?"var(--success)":"var(--primary)",
                        background:r.status==="pending"?"rgba(214,158,46,0.12)":r.status==="approved"?"rgba(56,161,105,0.12)":"rgba(229,62,62,0.1)",
                        padding:"4px 10px",borderRadius:6}}>{r.status}</span>
                      {r.status==="pending" && (
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn" style={{fontSize:12,padding:"6px 14px",background:"rgba(56,161,105,0.15)",color:"var(--success)",border:"1px solid rgba(56,161,105,0.3)"}}
                            onClick={()=>approveRequest(r._id)}><UserCheck size={13}/> Approve</button>
                          <button className="btn btn-outline" style={{fontSize:12,padding:"6px 14px",color:"var(--primary)"}}
                            onClick={()=>rejectRequest(r._id)}><UserX size={13}/> Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {tab==="analytics" && (
        <div className="card">
          <h2 style={{fontSize:14,fontWeight:600,marginBottom:4}}>Incidents per Day</h2>
          <p style={{fontSize:12,color:"var(--text-muted)",marginBottom:16}}>Avg resolution time: <strong>{analytics?.avgResolutionTimeMinutes} mins</strong></p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics?.incidentsByDay||[]}>
              <XAxis dataKey="_id" tick={{fill:"var(--text-muted)",fontSize:11}}/>
              <YAxis tick={{fill:"var(--text-muted)",fontSize:11}}/>
              <Tooltip contentStyle={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:8}}/>
              <Bar dataKey="count" fill="var(--primary)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ROLE MODAL */}
      {roleModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div className="card" style={{width:"100%",maxWidth:440,position:"relative"}}>
            <button onClick={()=>setRoleModal(null)} style={{position:"absolute",top:12,right:12,background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:20}}>×</button>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:4}}>Change Role</h2>
            <p style={{fontSize:13,color:"var(--text-muted)",marginBottom:20}}>Updating role for: <strong>{roleModal.name}</strong></p>
            <div className="form-group">
              <label>New Role</label>
              <select value={roleForm.role} onChange={e=>setRoleForm({...roleForm,role:e.target.value})}>
                <option value="user">User</option>
                <option value="responder">Responder</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {roleForm.role==="responder" && (
              <>
                <div className="form-group">
                  <label>Responder Type</label>
                  <select value={roleForm.responderType} onChange={e=>setRoleForm({...roleForm,responderType:e.target.value})}>
                    <option value="ambulance">🚑 Ambulance</option>
                    <option value="police">👮 Police</option>
                    <option value="fire">🚒 Fire Brigade</option>
                    <option value="medical">⚕️ Medical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge / Employee ID</label>
                  <input placeholder="e.g. AMB-2025-001" value={roleForm.badgeId} onChange={e=>setRoleForm({...roleForm,badgeId:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input placeholder="e.g. City Hospital" value={roleForm.department} onChange={e=>setRoleForm({...roleForm,department:e.target.value})}/>
                </div>
              </>
            )}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button className="btn btn-primary" onClick={handleDirectRoleChange} style={{flex:1,justifyContent:"center"}}><Shield size={14}/> Update Role</button>
              <button className="btn btn-outline" onClick={()=>setRoleModal(null)} style={{flex:1,justifyContent:"center"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}