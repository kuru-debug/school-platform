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
      // Foolproof unique key generator that works on all mobile devices
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
                  <div className="flex items-center gap-1.5