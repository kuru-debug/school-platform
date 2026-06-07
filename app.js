const { useState, useEffect } = React;

function SchoolPlatform() {
  // --- SYSTEM ACCESS & ROLES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // --- COGNITIVE CORE: PASSWORD MANAGEMENT ---
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('school_admin_pass') || 'admin123');
  const [parentPassword, setParentPassword] = useState(() => localStorage.getItem('school_parent_pass') || 'parent123');
  const [adminSecurityAnswer] = useState('buddy'); // Hardcoded security check answer (lowercase)
  const [parentSecurityAnswer] = useState('apex'); 

  // --- THEME ENGINE STATE ---
  const [siteTheme, setSiteTheme] = useState(() => localStorage.getItem('school_site_theme') || 'standard');
  const [systemMode, setSystemMode] = useState('normal');

  // --- APP SEED DATA DATASETS ---
  const [children] = useState([
    { id: 'c1', name: 'Maria Santos', grade: 'Grade 3-A' },
    { id: 'c2', name: 'Juan Santos', grade: 'Grade 1-B' }
  ]);
  const [activeChildId, setActiveChildId] = useState('');
  
  // LIVE PIPELINE: Document Requests Array Tracking
  const [documentRequests, setDocumentRequests] = useState([
    { id: 'req-101', studentName: 'Maria Santos', docType: 'Form 137', status: 'Pending' },
    { id: 'req-102', studentName: 'Juan Santos', docType: 'Birth Certificate', status: 'Pending' }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 'a1', title: 'School closed tomorrow due to weather', content: 'Heavy rain expected. Classes suspended.', priority: 'emergency' },
    { id: 'a2', title: 'Parent-teacher meeting June 15', content: 'Please arrive at 3:00 PM in the main hall.', priority: 'important' },
    { id: 'a3', title: 'Sports day photos available', content: 'Check the gallery or request prints from the office.', priority: 'general' }
  ]);

  // --- FORM FIELDS & MODALS ---
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState('general');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollStep, setEnrollStep] = useState(1);
  const [enrollForm, setEnrollForm] = useState({ parentName: '', phone: '', childName: '', gradeSelection: '' });
  const [enrollStatus, setEnrollStatus] = useState(null);

  // --- COPILES / AI TRANSACTION GATE ENGINE ---
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('Need help? Ask me about enrollment or school updates.');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingAiAction, setPendingAiAction] = useState(null); // The execution freeze payload storage

  // Sync styles out to local storage memory blocks
  useEffect(() => {
    localStorage.setItem('school_site_theme', siteTheme);
  }, [siteTheme]);

  // --- COMPREHENSIVE LOGIN / PASSWORD RESET PARSER ---
  const handleAuthFlow = () => {
    if (isLoggedIn || isAdmin) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUserEmail('');
      setActiveChildId('');
      setPendingAiAction(null);
      setAiResponse('Need help? Ask me about enrollment or school updates.');
      return;
    }

    const actionChoice = prompt("Type 'login' to sign in, or 'forgot' to recover/reset a password:");
    if (!actionChoice) return;

    if (actionChoice.toLowerCase() === 'forgot') {
      const roleReset = prompt("Are you resetting an 'admin' or 'parent' account?");
      if (!roleReset) return;

      if (roleReset.toLowerCase() === 'admin') {
        const securityAns = prompt("SECURITY CHALLENGE: What was the name of the school's first official mascot? (Hint: b____)");
        if (securityAns && securityAns.toLowerCase() === adminSecurityAnswer) {
          const newPass = prompt("Identity Confirmed. Enter your new Admin master password:");
          if (newPass) {
            setAdminPassword(newPass);
            localStorage.setItem('school_admin_pass', newPass);
            alert("Administrative master credentials updated successfully.");
          }
        } else {
          alert("Security verification failed. Access Denied.");
        }
      } else if (roleReset.toLowerCase() === 'parent') {
        const securityAns = prompt("SECURITY CHALLENGE: What is the target elementary institution name? (Hint: a___)");
        if (securityAns && securityAns.toLowerCase() === parentSecurityAnswer) {
          const newPass = prompt("Identity Confirmed. Enter your new Parent password:");
          if (newPass) {
            setParentPassword(newPass);
            localStorage.setItem('school_parent_pass', newPass);
            alert("Parent dashboard credentials updated successfully.");
          }
        } else {
          alert("Security verification failed.");
        }
      }
      return;
    }

    if (actionChoice.toLowerCase() === 'login') {
      const emailInput = prompt("Enter your account email address (Staff use official @apex.edu domain):");
      if (!emailInput) return;

      const userPassword = prompt("Enter your system password:");
      
      // Verification rules logic engine
      if (emailInput.toLowerCase().endsWith('@apex.edu')) {
        if (userPassword === adminPassword) {
          setIsAdmin(true);
          setCurrentUserEmail(emailInput);
          setAiResponse("Secure Administration Terminal active. Welcome back, system administrator. Input command structures to override parameters.");
          alert(`Access Granted. Welcome back Staff Administrator: ${emailInput}`);
        } else {
          alert("Invalid password matching administrative registry.");
        }
      } else {
        if (userPassword === parentPassword) {
          setIsLoggedIn(true);
          setCurrentUserEmail(emailInput);
          alert(`Access Granted. Logged in as: ${emailInput}`);
        } else {
          alert("Invalid parent access credentials.");
        }
      }
    }
  };

  // --- MANUAL ANNOUNCEMENT OPERATIONS ---
  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newAlert = {
      id: `a-${Date.now()}`,
      title: newTitle,
      content: newContent,
      priority: newPriority
    };

    setAnnouncements([newAlert, ...announcements]);
    setNewTitle('');
    setNewContent('');
    setNewPriority('general');
  };

  // --- AI SECURITY CONTROLLER ENGINE (PARENT VS ADMIN SWITCH) ---
  const handleAiSubmission = (e) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;

    // Freeze input if a confirmation loop is currently waiting on the screen
    if (pendingAiAction) {
      alert("Please Confirm or Cancel the pending system operation execution sequence first.");
      return;
    }

    setIsAiLoading(true);
    const textQuery = aiQuery.toLowerCase().trim();
    setAiQuery('');

    setTimeout(() => {
      // 1. ISOLATED GATEWAY: SECURE ADMIN EVALUATION ENGINE
      if (isAdmin) {
        // Theme setting syntax trigger parsing
        if (textQuery.includes('set theme') || textQuery.includes('change theme')) {
          let targetTheme = 'standard';
          if (textQuery.includes('dark')) targetTheme = 'dark';
          if (textQuery.includes('ocean')) targetTheme = 'ocean';

          setAiResponse(`VALIDATED COMMAND CHAIN DETECTED.\nRequest: Alter visual structural container to '${targetTheme.toUpperCase()}' mode.`);
          setPendingAiAction({ type: 'THEME', value: targetTheme });
        } 
        // Mode setting syntax trigger parsing
        else if (textQuery.includes('system mode') || textQuery.includes('switch mode')) {
          let targetMode = 'normal';
          if (textQuery.includes('emergency')) targetMode = 'emergency';
          if (textQuery.includes('enrollment')) targetMode = 'enrollment';

          setAiResponse(`VALIDATED SYSTEM CONFIGURATION CHANGE DETECTED.\nRequest: Shift platform state index to operational bracket: [${targetMode.toUpperCase()}].`);
          setPendingAiAction({ type: 'MODE', value: targetMode });
        }
        // Document approval syntax trigger parsing
        else if (textQuery.includes('approve request') || textQuery.includes('approve doc')) {
          let targetReqId = 'req-101';
          if (textQuery.includes('102')) targetReqId = 'req-102';
          
          const match = documentRequests.find(r => r.id === targetReqId);
          setAiResponse(`SECURITY COMMAND ACCESSED.\nRequest: Flip record status to [APPROVED] for student file instance ${match ? match.studentName : 'Unknown'}.`);
          setPendingAiAction({ type: 'APPROVE_DOC', value: targetReqId });
        }
        // Generic response if text input doesn't hit prefix command tags
        else {
          setAiResponse("Command context unassigned. Please structure parameters clearly using prefixes like '/set theme [dark/ocean]', '/switch mode [emergency/normal]', or '/approve request [101/102]'.");
        }
      } 
      
      // 2. PUBLIC SECURITY GATEWAY: PARENT AND VISITOR LOGIC
      else {
        // Safe check: If parent inputs dangerous strings, structural isolation blocks execution
        if (textQuery.includes('theme') || textQuery.includes('approve') || textQuery.includes('mode')) {
          setAiResponse("Access Error: Administrative security clearance is required to rewrite platform structural parameters or document status fields.");
        } else if (textQuery.match(/(grade|score|report)/i)) {
          setAiResponse("Student metrics are locked securely inside the Report Cards encryption module. Select authentication to pull encrypted views.");
        } else {
          setAiResponse("General Query Parsed: Enrollment portals are open until June 30. Use the step-by-step documentation panel to submit data lines cleanly.");
        }
      }
      setIsAiLoading(false);
    }, 500);
  };

  // --- TWO-HAND STRIKE TRANSACTION EXECUTORS ---
  const executeConfirmedAction = () => {
    if (!pendingAiAction) return;

    if (pendingAiAction.type === 'THEME') {
      setSiteTheme(pendingAiAction.value);
      setAiResponse(`System modification successful. Core visual framework shifted to configuration profile: ${pendingAiAction.value.toUpperCase()}.`);
    } else if (pendingAiAction.type === 'MODE') {
      setSystemMode(pendingAiAction.value);
      setAiResponse(`Platform operation override confirmation completed. Operational index shifted to [${pendingAiAction.value.toUpperCase()}].`);
    } else if (pendingAiAction.type === 'APPROVE_DOC') {
      setDocumentRequests(documentRequests.map(req => 
        req.id === pendingAiAction.value ? { ...req, status: 'Approved ✓' } : req
      ));
      setAiResponse(`Database write array updated. File reference instance ${pendingAiAction.value} marked complete.`);
    }
    setPendingAiAction(null);
  };

  const cancelPendingAction = () => {
    setPendingAiAction(null);
    setAiResponse("Operation canceled by administrative supervisor safely. System integrity parameters intact.");
  };

  // --- DESIGN THEME ASSIGNMENTS ENGINE ---
  let themeBg = 'bg-gray-50';
  let themeHeader = 'bg-white text-gray-800 border-b border-gray-200';
  let themePanel = 'bg-white text-gray-800 border-gray-200';
  let themeText = 'text-gray-700';

  if (siteTheme === 'dark') {
    themeBg = 'bg-slate-900';
    themeHeader = 'bg-slate-900 text-slate-100 border-b border-slate-800';
    themePanel = 'bg-slate-800 text-slate-100 border-slate-700';
    themeText = 'text-slate-300';
  } else if (siteTheme === 'ocean') {
    themeBg = 'bg-sky-950';
    themeHeader = 'bg-sky-900 text-sky-50 border-b border-sky-800';
    themePanel = 'bg-sky-900/60 text-sky-100 border-sky-700';
    themeText = 'text-sky-200';
  }

  return React.createElement('div', { className: `w-full max-w-5xl mx-auto min-h-screen transition-all duration-300 flex flex-col font-sans shadow-2xl ${themeBg}` },
    
    // Top Simulation Mode Controller Strip
    React.createElement('div', { className: 'bg-gray-950 text-gray-400 text-[10px] px-4 py-1 flex justify-between items-center z-50 border-b border-gray-800' },
      React.createElement('span', { className: 'font-mono' }, `System Registry Context: Mode=[${systemMode.toUpperCase()}] Theme=[${siteTheme.toUpperCase()}]`),
      React.createElement('div', { className: 'flex gap-1' },
        ['normal', 'enrollment', 'emergency'].map(m => 
          React.createElement('button', {
            key: m,
            onClick: () => setSystemMode(m),
            className: `px-2 py-0.5 rounded uppercase font-bold text-[9px] transition ${systemMode === m ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`
          }, m)
        )
      )
    ),

    // App Navigation Header Bar
    React.createElement('header', { className: `px-6 py-4 flex justify-between items-center sticky top-0 z-40 ${themeHeader}` },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-2xl' }, '🏫'),
        React.createElement('div', null,
          React.createElement('h1', { className: 'font-black tracking-tight text-base lg:text-lg' }, 'Apex Elementary Integration Platform'),
          currentUserEmail && React.createElement('p', { className: 'text-[10px] font-mono text-blue-500 opacity-90' }, `Session user: ${currentUserEmail}`)
        )
      ),
      React.createElement('button', {
        onClick: handleAuthFlow,
        className: `text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${isLoggedIn || isAdmin ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
      }, (isLoggedIn || isAdmin) ? 'Sign Out / Terminate Access' : 'Secure Sign In / Recover Account')
    ),

    // Primary Layout Grid Workspace
    React.createElement('main', { className: 'flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' },
      
      // Left Dashboard View Panel Column (Announcements Feed & Document Pipeline Tables)
      React.createElement('div', { className: 'lg:col-span-5 space-y-6' },
        
        // Active Profile Frame Context Box
        isLoggedIn && systemMode !== 'emergency' && React.createElement('div', { className: `rounded-2xl p-4 border shadow-sm ${themePanel}` },
          React.createElement('label', { className: 'block text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1' }, 'Active Household Account Access'),
          React.createElement('select', {
            value: activeChildId,
            onChange: (e) => setActiveChildId(e.target.value),
            className: 'w-full text-xs bg-black/10 border border-gray-500/20 rounded-xl p-2.5 font-medium focus:outline-none'
          },
            React.createElement('option', { value: '' }, '-- Connect Child Identity Context --'),
            children.map(c => React.createElement('option', { key: c.id, value: c.id }, `👧 ${c.name} (${c.grade})`))
          )
        ),

        // Live Administrative Tracker Table Interface Panel View
        isAdmin && React.createElement('section', { className: `rounded-2xl p-4 border shadow-md space-y-3 ${themePanel}` },
          React.createElement('div', { className: 'flex justify-between items-center border-b border-gray-500/20 pb-2' },
            React.createElement('h3', { className: 'text-xs font-black tracking-wider text-blue-400 uppercase' }, '📂 Live Document Approval Pipeline'),
            React.createElement('span', { className: 'text-[9px] bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300 font-mono' }, 'System Database Status')
          ),
          React.createElement('div', { className: 'space-y-2 text-xs font-mono' },
            documentRequests.map(req => 
              React.createElement('div', { key: req.id, className: 'flex items-center justify-between p-2 rounded-xl bg-black/10 border border-gray-500/10' },
                React.createElement('div', null,
                  React.createElement('p', { className: 'font-bold' }, req.studentName),
                  React.createElement('p', { className: 'text-[10px] text-gray-400' }, `${req.id} • ${req.docType}`)
                ),
                React.createElement('span', { className: `px-2 py-0.5 rounded text-[10px] font-bold ${req.status.startsWith('App') ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}` }, req.status)
              )
            )
          )
        ),

        // Core Public Announcement Feed Frame Window View
        React.createElement('section', { className: 'space-y-3' },
          React.createElement('h2', { className: 'text-xs font-black tracking-widest text-gray-400 uppercase' }, 'Latest Campus Board Bulletins'),
          React.createElement('div', { className: 'space-y-3' },
            announcements
              .filter(a => systemMode === 'emergency' ? a.priority === 'emergency' : true)
              .map(a => 
                React.createElement('div', {
                  key: a.id,
                  className: `p-4 rounded-2xl border transition-all duration-200 shadow-sm ${a.priority === 'emergency' ? 'bg-red-500/10 border-red-500 text-red-100 ring-1 ring-red-500/30' : a.priority === 'important' ? 'bg-amber-500/10 border-amber-500 text-amber-100' : `${themePanel}`}`
                },
                  React.createElement('span', { className: `text-[8px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md ${a.priority === 'emergency' ? 'bg-red-600 text-white' : a.priority === 'important' ? 'bg-amber-600 text-white' : 'bg-gray-500/20 text-gray-400'}` }, a.priority),
                  React.createElement('h3', { className: 'font-black text-sm mt-1.5' }, a.title),
                  React.createElement('p', { className: `text-xs mt-1 leading-relaxed ${themeText}` }, a.content)
                )
              )
          )
        )
      ),

      // Right Dashboard Column Panel (Operational Forms, Dynamic Interactive Admin Controls, Secure AI Engine)
      React.createElement('div', { className: 'lg:col-span-7 space-y-6' },
        
        systemMode === 'emergency' 
          ? React.createElement('div', { className: 'bg-red-950/40 text-red-200 border border-red-900/50 text-xs p-4 rounded-2xl font-mono' }, '🛑 EMERGENCY OVERRIDE STATUS HIGH. Operational workflows, enrollment modifications, and public AI systems are temporarily locked for synchronization security.')
          : React.createElement(React.Fragment, null,
              
              // LIVE CONTROL INTERFACE: SECURE ADMIN WRITER PORTAL PANEL
              isAdmin && React.createElement('section', { className: 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-5 shadow-lg space-y-3 animate-fadeIn' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('span', { className: 'text-xl' }, '📢'),
                  React.createElement('h3', { className: 'font-black text-xs tracking-wider text-blue-300 uppercase' }, 'Publish Live System Bulletin (Supervisor Pipeline)')
                ),
                React.createElement('form', { onSubmit: handleCreateAnnouncement, className: 'space-y-3' },
                  React.createElement('input', {
                    type: 'text',
                    value: newTitle,
                    onChange: (e) => setNewTitle(e.target.value),
                    placeholder: 'Enter announcement headline title string...',
                    className: 'w-full bg-black/20 border border-gray-500/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono'
                  }),
                  React.createElement('textarea', {
                    value: newContent,
                    onChange: (e) => setNewContent(e.target.value),
                    placeholder: 'Write main verification message or emergency parameter details here details...',
                    rows: 2,
                    className: 'w-full bg-black/20 border border-gray-500/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none'
                  }),
                  React.createElement('div', { className: 'flex gap-3 items-center justify-between' },
                    React.createElement('select', {
                      value: newPriority,
                      onChange: (e) => setNewPriority(e.target.value),
                      className: 'text-xs bg-slate-800 text-white border border-gray-600 rounded-lg p-2 font-mono focus:outline-none'
                    },
                      React.createElement('option', { value: 'general' }, '💚 Priority: General'),
                      React.createElement('option', { value: 'important' }, '💛 Priority: Important'),
                      React.createElement('option', { value: 'emergency' }, '❤️ Priority: Emergency')
                    ),
                    React.createElement('button', { type: 'submit', className: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow' }, 'Broadcast Notice Live')
                  )
                )
              ),

              // Action Trigger Shortcut Buttons Module Link Matrix
              React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
                React.createElement('button', { onClick: () => { setShowEnrollmentModal(true); setEnrollStep(1); }, className: `border p-4 rounded-2xl flex flex-col items-center text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm ${themePanel}` },
                  React.createElement('span', { className: 'text-2xl mb-1' }, '📝'),
                  React.createElement('span', { className: 'text-xs font-black' }, 'Enrollment')
                ),
                React.createElement('button', { onClick: () => alert((isLoggedIn || isAdmin) ? "Opening Report Cards Encrypted Module..." : "Security Notification: Sign-in initialization parameters required."), className: `border p-4 rounded-2xl flex flex-col items-center text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm ${themePanel}` },
                  React.createElement('span', { className: 'text-2xl mb-1' }, '📊'),
                  React.createElement('span', { className: 'text-xs font-black' }, 'Report Cards')
                ),
                React.createElement('button', { onClick: () => alert((isLoggedIn || isAdmin) ? "Opening Document Verification Request Storage..." : "Security Notification: Authentication credentials verification required."), className: `border p-4 rounded-2xl flex flex-col items-center text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm ${themePanel}` },
                  React.createElement('span', { className: 'text-2xl mb-1' }, '📄'),
                  React.createElement('span', { className: 'text-xs font-black' }, 'Request Docs')
                )
              ),

              // DUAL INTERACTIVE SMART AI TERMINAL INTERFACE BOX
              React.createElement('section', { 
                className: `border rounded-2xl p-5 shadow-lg space-y-4 transition-all duration-300 ${
                  isAdmin 
                    ? 'bg-slate-950 text-slate-100 border-indigo-500/40 ring-1 ring-indigo-500/20' 
                    : `${themePanel}`
                }` 
              },
                React.createElement('div', { className: 'flex justify-between items-center' },
                  React.createElement('div', { className: 'flex items-center gap-2.5' },
                    React.createElement('span', { className: 'text-xl' }, isAdmin ? '🎛️' : '🤖'),
                    React.createElement('h3', { className: 'font-black text-xs tracking-wider uppercase' }, isAdmin ? 'Secure Admin Operations Copilot' : 'Smart Campus AI Assistant')
                  ),
                  React.createElement('span', { 
                    className: `px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold tracking-widest ${
                      isAdmin ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-gray-500/20 text-gray-400'
                    }` 
                  }, isAdmin ? 'Admin Console: Secure' : 'Public Sandbox')
                ),
                
                // Display Area Box Frame Window
                React.createElement('div', { 
                  className: `rounded-xl p-4 text-xs font-mono whitespace-pre-line leading-relaxed border ${
                    isAdmin ? 'bg-black text-green-400 border-indigo-900/40' : 'bg-gray-50 border-gray-200 text-gray-600 italic'
                  }` 
                }, 
                  isAiLoading ? "Synchronizing state transaction arrays..." : aiResponse
                ),

                // THE SECURE TWO-HAND STRIKE ACTION CONFIRMATION OVERRIDE DIALOGUE BOX INTERFACE
                pendingAiAction && React.createElement('div', { className: 'bg-amber-500/10 border border-amber-500 rounded-xl p-4 space-y-3 animate-fadeIn' },
                  React.createElement('div', { className: 'text-xs font-mono text-amber-200 space-y-1' },
                    React.createElement('p', { className: 'font-bold' }, '⚠️ SECURITY CONFIRMATION REQUIREMENT ACTIVE'),
                    React.createElement('p', null, `Operation Profile: [${pendingAiAction.type}] Target Parameter Value: [${pendingAiAction.value.toUpperCase()}]`),
                    React.createElement('p', { className: 'text-[10px] text-amber-400/80 italic' }, 'Confirming this pipeline change will write modifications across all public user views instantly.')
                  ),
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', { onClick: cancelPendingAction, className: 'w-1/2 bg-gray-800 text-gray-300 font-mono text-xs font-bold rounded-lg py-1.5 hover:bg-gray-700 transition' }, 'Cancel Operation'),
                    React.createElement('button', { onClick: executeConfirmedAction, className: 'w-1/2 bg-amber-500 text-black font-mono text-xs font-black rounded-lg py-1.5 hover:bg-amber-600 transition' }, 'Confirm Execution')
                  )
                ),

                // Input Action Frame Terminal Bar Box Line
                React.createElement('form', { onSubmit: handleAiSubmission, className: 'flex gap-2' },
                  React.createElement('div', { className: 'relative flex-1 flex items-center' },
                    isAdmin && React.createElement('span', { className: 'absolute left-3 text-xs font-mono text-indigo-400 font-bold' }, '$'),
                    React.createElement('input', {
                      type: 'text',
                      value: aiQuery,
                      onChange: (e) => setAiQuery(e.target.value),
                      disabled: !!pendingAiAction,
                      placeholder: isAdmin ? 'Execute: theme dark / change mode emergency / approve doc 101...' : 'Ask assistant about campus timelines...',
                      className: `w-full rounded-xl py-2.5 text-xs font-mono focus:outline-none focus:ring-2 transition-all ${
                        isAdmin 
                          ? 'bg-black text-white border border-gray-800 pl-7 focus:ring-indigo-500' 
                          : 'bg-black/5 border border-gray-500/20 px-3 focus:ring-blue-500'
                      } ${pendingAiAction ? 'opacity-40 cursor-not-allowed' : ''}`
                    })
                  ),
                  React.createElement('button', { 
                    type: 'submit', 
                    disabled: !!pendingAiAction,
                    className: `px-4 rounded-xl text-xs font-bold transition font-mono ${
                      isAdmin ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-950 text-white hover:bg-gray-800'
                    } ${pendingAiAction ? 'opacity-40 cursor-not-allowed' : ''}` 
                  }, 'Send')
                ),

                // Helper command template quick pills for administrative usage
                isAdmin && !pendingAiAction && React.createElement('div', { className: 'flex flex-wrap gap-1 text-[9px] font-mono opacity-60' },
                  React.createElement('span', { className: 'text-gray-400 mr-1 self-center' }, 'Quick Template Starters:'),
                  React.createElement('button', { onClick: () => setAiQuery('set theme dark'), className: 'bg-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-700' }, 'set theme dark'),
                  React.createElement('button', { onClick: () => setAiQuery('switch mode emergency'), className: 'bg-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-700' }, 'switch mode emergency'),
                  React.createElement('button', { onClick: () => setAiQuery('approve request 101'), className: 'bg-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-700' }, 'approve doc 101')
                )
              )
            )
      )
    ),

    // Enrollment Multi-Step Form Modal Layer
    showEnrollmentModal && React.createElement('div', { className: 'fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4' },
      React.createElement('div', { className: 'bg-white text-gray-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-scaleUp' },
        React.createElement('div', { className: 'flex justify-between items-center border-b border-gray-100 pb-3' },
          React.createElement('h2', { className: 'font-black text-gray-900 text-base' }, 'New Student Registration Portal'),
          React.createElement('button', { onClick: () => setShowEnrollmentModal(false), className: 'text-gray-400 text-lg hover:text-gray-600 font-bold' }, '✕')
        ),

        enrollStatus 
          ? React.createElement('div', { className: 'py-6 text-center space-y-3' },
              React.createElement('div', { className: 'text-4xl' }, '🎉'),
              React.createElement('h3', { className: 'font-black text-gray-900 text-lg' }, 'Application Logged'),
              React.createElement('p', { className: 'text-xs text-gray-600' }, 'Record pipeline synchronization reference token ID: ', React.createElement('strong', { className: 'font-mono bg-gray-100 px-1.5 py-0.5 rounded text-blue-600' }, enrollStatus.txId)),
              React.createElement('button', { onClick: () => { setEnrollStatus(null); setShowEnrollmentModal(false); }, className: 'w-full bg-gray-900 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-gray-800' }, 'Close Stream')
            )
          : React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'flex items-center justify-between text-[11px] text-gray-400 font-mono border-b border-gray-100 pb-2' },
                React.createElement('span', { className: enrollStep === 1 ? 'text-blue-600 font-bold' : '' }, '1. PARENT'),
                React.createElement('span', { className: enrollStep === 2 ? 'text-blue-600 font-bold' : '' }, '2. STUDENT'),
                React.createElement('span', { className: enrollStep === 3 ? 'text-blue-600 font-bold' : '' }, '3. COMMIT')
              ),

              enrollStep === 1 && React.createElement('div', { className: 'space-y-3' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Guardian Signature Name *'),
                  React.createElement('input', { type: 'text', value: enrollForm.parentName, onChange: (e) => setEnrollForm({ ...enrollForm, parentName: e.target.value }), className: 'w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500', placeholder: 'Juan dela Cruz' })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Mobile Contact String *'),
                  React.createElement('input', { type: 'tel', value: enrollForm.phone, onChange: (e) => setEnrollForm({ ...enrollForm, phone: e.target.value }), className: 'w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500', placeholder: '+63 917 123 4567' })
                ),
                React.createElement('button', { disabled: !enrollForm.parentName || !enrollForm.phone, onClick: () => setEnrollStep(2), className: 'w-full bg-gray-950 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold transition' }, 'Next Segment →')
              ),

              enrollStep === 2 && React.createElement('div', { className: 'space-y-3' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, "Student Legal Full Name *"),
                  React.createElement('input', { type: 'text', value: enrollForm.childName, onChange: (e) => setEnrollForm({ ...enrollForm, childName: e.target.value }), className: 'w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500', placeholder: 'Maria dela Cruz' })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Target Grade Category *'),
                  React.createElement('select', { value: enrollForm.gradeSelection, onChange: (e) => setEnrollForm({ ...enrollForm, gradeSelection: e.target.value }), className: 'w-full border border-gray-200 bg-gray-50 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500' },
                    React.createElement('option', { value: '' }, '-- Target Level Select --'),
                    React.createElement('option', { value: 'Grade 1' }, 'Grade 1 Cluster'),
                    React.createElement('option', { value: 'Grade 2' }, 'Grade 2 Cluster'),
                    React.createElement('option', { value: 'Grade 3' }, 'Grade 3 Cluster')
                  )
                ),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', { onClick: () => setEnrollStep(1), className: 'w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-bold hover:bg-gray-50' }, 'Back'),
                  React.createElement('button', { disabled: !enrollForm.childName || !enrollForm.gradeSelection, onClick: () => setEnrollStep(3), className: 'flex-1 bg-gray-950 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold transition' }, 'Review')
                )
              ),

              enrollStep === 3 && React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-xs text-gray-600 font-mono space-y-1.5' },
                  React.createElement('div', null, React.createElement('span', { className: 'text-gray-400' }, 'Parent: '), enrollForm.parentName),
                  React.createElement('div', null, React.createElement('span', { className: 'text-gray-400' }, 'Contact: '), enrollForm.phone),
                  React.createElement('div', null, React.createElement('span', { className: 'text-gray-400' }, 'Student: '), enrollForm.childName),
                  React.createElement('div', null, React.createElement('span', { className: 'text-gray-400' }, 'Level: '), enrollForm.gradeSelection)
                ),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', { onClick: () => setEnrollStep(2), className: 'w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-bold hover:bg-gray-50' }, 'Edit'),
                  React.createElement('button', { 
                    onClick: () => {
                      setEnrollStatus({ txId: `TX-APEX-${Math.floor(100000 + Math.random() * 900000)}` });
                      setEnrollForm({ parentName: '', phone: '', childName: '', gradeSelection: '' });
                    }, 
                    className: 'flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-blue-700 shadow transition' 
                  }, 'Commit Application Array')
                )
              )
            )
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SchoolPlatform));