const { useState, useEffect } = React;

function SchoolPlatform() {
  // --- SYSTEM MODES ---
  const [systemMode, setSystemMode] = useState('normal');

  // --- APP STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [children, setChildren] = useState([
    { id: 'c1', name: 'Maria Santos', grade: 'Grade 3-A' },
    { id: 'c2', name: 'Juan Santos', grade: 'Grade 1-B' }
  ]);
  const [activeChildId, setActiveChildId] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 'a1', title: 'School closed tomorrow due to weather', content: 'Heavy rain expected. Classes suspended.', priority: 'emergency' },
    { id: 'a2', title: 'Parent-teacher meeting June 15', content: 'Please arrive at 3:00 PM in the main hall.', priority: 'important' },
    { id: 'a3', title: 'Sports day photos available', content: 'Check the gallery or request prints from the office.', priority: 'general' }
  ]);

  // --- ENROLLMENT STATE (OFFLINE-FIRST) ---
  const [enrollStep, setEnrollStep] = useState(1);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [enrollForm, setEnrollForm] = useState({
    parentName: '',
    phone: '',
    childName: '',
    gradeSelection: '',
    documentSkipped: true,
  });
  const [enrollStatus, setEnrollStatus] = useState(null);

  // --- AI ASSISTANT STATE ---
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('Need help? Ask me about enrollment or updates.');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- UI FLAGS ---
  const [networkStatus, setNetworkStatus] = useState('online');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  // --- INITIALIZATION & LOCALSTORAGE RESUME ---
  useEffect(() => {
    const updateOnlineStatus = () => setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const savedForm = localStorage.getItem('school_enroll_cache');
    const savedStep = localStorage.getItem('school_enroll_step');
    const savedKey = localStorage.getItem('school_enroll_idempotency');

    if (savedForm) setEnrollForm(JSON.parse(savedForm));
    if (savedStep) setEnrollStep(parseInt(savedStep, 10));
    
    if (savedKey) {
      setIdempotencyKey(savedKey);
    } else {
      const newKey = Math.random().toString(36).substring(2, 15);
      setIdempotencyKey(newKey);
      localStorage.setItem('school_enroll_idempotency', newKey);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const updateEnrollForm = (fields) => {
    const updated = { ...enrollForm, ...fields };
    setEnrollForm(updated);
    localStorage.setItem('school_enroll_cache', JSON.stringify(updated));
  };

  const handleStepChange = (nextStep) => {
    setEnrollStep(nextStep);
    localStorage.setItem('school_enroll_step', nextStep.toString());
  };

  const submitEnrollment = async () => {
    if (!navigator.onLine) {
      alert('You are currently offline. Your data is safely saved on this device and will auto-submit when connection returns.');
      return;
    }

    try {
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, id: `E-${Math.floor(1000 + Math.random() * 9000)}` }), 1200)
      );

      if (response.success) {
        setEnrollStatus({ status: 'Verified', txId: response.id });
        localStorage.removeItem('school_enroll_cache');
        localStorage.removeItem('school_enroll_step');
        localStorage.removeItem('school_enroll_idempotency');
      }
    } catch (err) {
      alert('Network timeout. Please tap submit again.');
    }
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    const queryLower = aiQuery.toLowerCase();

    if (queryLower.match(/(grade|score|mark|gpa|rank|exam|test)/i)) {
      setTimeout(() => {
        setAiResponse("Your child's report card is available securely within the Report Cards module. I am unauthorized to display grades directly.");
        setIsAiLoading(false);
      }, 400);
      return;
    }

    if (queryLower.match(/(my son|my daughter|my kid|homework|status)/i) && !activeChildId) {
      setTimeout(() => {
        setAiResponse("I can see multiple children linked to your profile. Please pick an active child context from the dropdown at the top of your screen.");
        setIsAiLoading(false);
      }, 400);
      return;
    }

    setTimeout(() => {
      if (queryLower.includes('enrollment') || queryLower.includes('deadline')) {
        setAiResponse("Enrollment closes June 30. You can process step-by-step documentation cleanly on your mobile dashboard without authenticating.");
      } else {
        setAiResponse("I am currently analyzing your query. For direct personalized administrative confirmation, please dial our main office lines directly.");
      }
      setIsAiLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans border-x border-gray-200 shadow-inner pb-24">
      
      {networkStatus === 'offline' && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1 text-center animate-pulse">
          ⚠️ Running in Offline Mode — Changes will sync when network returns.
        </div>
      )}

      <div className="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 flex justify-between items-center">
        <span>Simulation Modes:</span>
        <div className="flex gap-1">
          {['normal', 'enrollment', 'emergency'].map((m) => (
            <button
              key={m}
              onClick={() => setSystemMode(m)}
              className={`px-1 rounded uppercase ${systemMode === m ? 'bg-blue-600 font-bold text-white' : 'bg-gray-700'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <header className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏫</span>
          <h1 className="font-bold text-gray-800 tracking-tight">Apex Elementary</h1>
        </div>
        <button
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          {isLoggedIn ? 'Sign Out' : 'Parent Login'}
        </button>
      </header>

      <main className="flex-1 p-4 space-y-4">
        
        {isLoggedIn && systemMode !== 'emergency' && (
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <label className="block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">Active Student Context</label>
            <select
              value={activeChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- No Child Selected (Choose Context) --</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>👧 {c.name} ({c.grade})</option>
              ))}
            </select>
            {!activeChildId && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                ⚠️ Select a child above to align your AI answers and files correctly.
              </p>
            )}
          </div>
        )}

        <section className="space-y-2">
          <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Latest Announcements</h2>
          <div className="space-y-2">
            {announcements
              .filter(a => systemMode === 'emergency' ? a.priority === 'emergency' : true)
              .map((a) => (
                <div 
                  key={a.id} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    a.priority === 'emergency' 
                      ? 'bg-red-50 border-red-200 text-red-900 shadow-sm ring-1 ring-red-300' 
                      : a.priority === 'important'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      a.priority === 'emergency' ? 'bg-red-600 text-white' : a.priority === 'important' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {a.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm leading-tight">{a.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-normal">{a.content}</p>
                </div>
              ))}
          </div>
        </section>

        {systemMode === 'emergency' ? (
          <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl border border-red-200 font-medium">
            🛑 <strong>Emergency Operations Mode Active.</strong> Forms and AI options are hidden to save mobile data and highlight critical notices.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => { setShowEnrollmentModal(true); setEnrollStep(1); }}
                className="bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm"
              >
                <span className="text-xl mb-1">📝</span>
                <span className="text-xs font-bold text-gray-700">Enrollment</span>
              </button>
              
              <button 
                onClick={() => alert(isLoggedIn ? "Opening Report Cards..." : "Please Login first.")}
                className="bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm"
              >
                <span className="text-xl mb-1">📊</span>
                <span className="text-xs font-bold text-gray-700">Report Cards</span>
              </button>

              <button 
                onClick={() => alert(isLoggedIn ? "Opening Document Requests..." : "Please Login first.")}
                className="bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm"
              >
                <span className="text-xl mb-1">📄</span>
                <span className="text-xs font-bold text-gray-700">Request Docs</span>
              </button>
            </div>

            <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className="font-bold text-sm text-gray-800">Smart AI Assistant</h3>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 italic leading-relaxed">
                {isAiLoading ? "Processing query safely..." : aiResponse}
              </div>
              <form onSubmit={handleAiAsk} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about enrollment..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold">
                  Ask
                </button>
              </form>
            </section>
          </>
        )}
      </main>

      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-bold text-gray-800 text-base">New Student Enrollment</h2>
                <p className="text-[11px] text-gray-400 font-mono">Key: {idempotencyKey.substring(0,8)}...</p>
              </div>
              <button onClick={() => setShowEnrollmentModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            {enrollStatus ? (
              <div className="py-6 text-center space-y-3">
                <div className="text-4xl">✅</div>
                <h3 className="font-bold text-gray-800 text-lg">Submission Successful</h3>
                <p className="text-xs text-gray-600 px-4">
                  Saved with reference code: <strong className="font-mono bg-gray-100 px-1 text-blue-600">{enrollStatus.txId}</strong>.
                </p>
                <button onClick={() => { setEnrollStatus(null); setShowEnrollmentModal(false); }} className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-xs font-bold">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span className={enrollStep >= 1 ? 'text-blue-600 font-bold' : ''}>1. Parent</span>
                  <span className="h-px bg-gray-200 flex-1 mx-2"></span>
                  <span className={enrollStep >= 2 ? 'text-blue-600 font-bold' : ''}>2. Student</span>
                  <span className="h-px bg-gray-200 flex-1 mx-2"></span>
                  <span className={enrollStep >= 3 ? 'text-blue-600 font-bold' : ''}>3. Verify</span>
                </div>

                {enrollStep === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Parent/Guardian Name *</label>
                      <input
                        type="text"
                        value={enrollForm.parentName || ''}
                        onChange={(e) => updateEnrollForm({ parentName: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                        placeholder="Juan dela Cruz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={enrollForm.phone || ''}
                        onChange={(e) => updateEnrollForm({ phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                        placeholder="+63 917 123 4567"
                      />
                    </div>
                    <button
                      disabled={!enrollForm.parentName || !enrollForm.phone}
                      onClick={() => handleStepChange(2)}
                      className="w-full bg-gray-900 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold"
                    >
                      Continue →
                    </button>
                  </div>
                )}

                {enrollStep === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Child's Full Name *</label>
                      <input
                        type="text"
                        value={enrollForm.childName || ''}
                        onChange={(e) => updateEnrollForm({ childName: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                        placeholder="Maria dela Cruz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Target Grade *</label>
                      <select
                        value={enrollForm.gradeSelection || ''}
                        onChange={(e) => updateEnrollForm({ gradeSelection: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                      >
                        <option value="">-- Choose Grade --</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleStepChange(1)} className="w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs">Back</button>
                      <button
                        disabled={!enrollForm.childName || !enrollForm.gradeSelection}
                        onClick={() => handleStepChange(3)}
                        className="flex-1 bg-gray-900 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {enrollStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600 space-y-1">
                      <div><strong>Guardian:</strong> {enrollForm.parentName}</div>
                      <div><strong>Mobile:</strong> {enrollForm.phone}</div>
                      <div><strong>Student:</strong> {enrollForm.childName}</div>
                      <div><strong>Grade:</strong> Grade {enrollForm.gradeSelection}</div>
                    </div>

                    <div className="border border-dashed border-gray-200 rounded-xl p-3 space-y-2">
                      <label className="block text-xs font-bold text-gray-700">Birth Certificate (Optional)</label>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={() => updateEnrollForm({ documentSkipped: false })}
                        className="block w-full text-[11px] text-gray-400"
                      />
                    </div>

                    <p className="text-[11px] text-gray-400 italic text-center">✓ Progress auto-saved locally.</p>

                    <div className="flex gap-2">
                      <button onClick={() => handleStepChange(2)} className="w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs">Back</button>
                      <button onClick={submitEnrollment} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold">
                        Submit Enrollment
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 py-2.5 px-6 flex justify-between items-center text-gray-400 z-40">
        <button className="flex flex-col items-center text-blue-600"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">Home</span></button>
        <button className="flex flex-col items-center"><span className="text-xl">📢</span><span className="text-[10px]">Alerts</span></button>
        <button className="flex flex-col items-center"><span className="text-xl">📄</span><span className="text-[10px]">Docs</span></button>
        <button className="flex flex-col items-center"><span className="text-xl">⚙️</span><span className="text-[10px]">Settings</span></button>
      </footer>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SchoolPlatform));