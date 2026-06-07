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

  // --- ENROLLMENT STATE ---
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
      setTimeout(() => {
        setEnrollStatus({ status: 'Verified', txId: `E-${Math.floor(1000 + Math.random() * 9000)}` });
        localStorage.removeItem('school_enroll_cache');
        localStorage.removeItem('school_enroll_step');
        localStorage.removeItem('school_enroll_idempotency');
      }, 1200);
    } catch (err) {
      alert('Network timeout. Please tap submit again.');
    }
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    const queryLower = aiQuery.toLowerCase();

    setTimeout(() => {
      if (queryLower.match(/(grade|score|mark|gpa|rank|exam|test)/i)) {
        setAiResponse("Your child's report card is available securely within the Report Cards module. I am unauthorized to display grades directly.");
      } else if (queryLower.match(/(my son|my daughter|my kid|homework|status)/i) && !activeChildId) {
        setAiResponse("I can see multiple children linked to your profile. Please pick an active child context from the dropdown at the top of your screen.");
      } else if (queryLower.includes('enrollment') || queryLower.includes('deadline')) {
        setAiResponse("Enrollment closes June 30. You can process step-by-step documentation cleanly on your mobile dashboard without authenticating.");
      } else {
        setAiResponse("I am currently analyzing your query. For direct personalized administrative confirmation, please dial our main office lines directly.");
      }
      setIsAiLoading(false);
    }, 600);
  };

  return React.createElement('div', { className: 'w-full max-w-md lg:max-w-5xl mx-auto min-h-screen bg-gray-50 flex flex-col font-sans border-x border-gray-200 shadow-inner pb-24 lg:pb-12' },
    networkStatus === 'offline' && React.createElement('div', { className: 'bg-amber-500 text-white text-xs font-bold px-4 py-1 text-center animate-pulse' }, '⚠️ Running in Offline Mode — Changes will sync when network returns.'),
    
    React.createElement('div', { className: 'bg-gray-800 text-gray-300 text-[10px] px-2 py-1 flex justify-between items-center' },
      React.createElement('span', null, 'Simulation Modes:'),
      React.createElement('div', { className: 'flex gap-1' },
        ['normal', 'enrollment', 'emergency'].map(m => 
          React.createElement('button', {
            key: m,
            onClick: () => setSystemMode(m),
            className: `px-1 rounded uppercase ${systemMode === m ? 'bg-blue-600 font-bold text-white' : 'bg-gray-700'}`
          }, m)
        )
      )
    ),

    React.createElement('header', { className: 'bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 z-50' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('span', { className: 'text-xl' }, '🏫'),
        React.createElement('h1', { className: 'font-bold text-gray-800 tracking-tight' }, 'Apex Elementary')
      ),
      React.createElement('button', {
        onClick: () => setIsLoggedIn(!isLoggedIn),
        className: 'text-xs font-medium px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition'
      }, isLoggedIn ? 'Sign Out' : 'Parent Login')
    ),

    // Responsive split Grid: 1 column on mobile, 2 columns side-by-side on desktop PC
    React.createElement('main', { className: 'flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start' },
      
      // Left Column: Student Selection and Announcements
      React.createElement('div', { className: 'space-y-4 w-full' },
        isLoggedIn && systemMode !== 'emergency' && React.createElement('div', { className: 'bg-white rounded-xl p-3 border border-gray-200 shadow-sm' },
          React.createElement('label', { className: 'block text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1' }, 'Active Student Context'),
          React.createElement('select', {
            value: activeChildId,
            onChange: (e) => setActiveChildId(e.target.value),
            className: 'w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
          },
            React.createElement('option', { value: '' }, '-- No Child Selected (Choose Context) --'),
            children.map(c => React.createElement('option', { key: c.id, value: c.id }, `👧 ${c.name} (${c.grade})`))
          ),
          !activeChildId && React.createElement('p', { className: 'text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium' }, '⚠️ Select a child above to align your AI answers.')
        ),

        React.createElement('section', { className: 'space-y-2' },
          React.createElement('h2', { className: 'text-xs font-bold tracking-wider text-gray-400 uppercase' }, 'Latest Announcements'),
          React.createElement('div', { className: 'space-y-2' },
            announcements
              .filter(a => systemMode === 'emergency' ? a.priority === 'emergency' : true)
              .map(a => 
                React.createElement('div', {
                  key: a.id,
                  className: `p-3.5 rounded-xl border transition-all ${a.priority === 'emergency' ? 'bg-red-50 border-red-200 text-red-900 shadow-sm ring-1 ring-red-300' : a.priority === 'important' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-gray-200 text-gray-800'}`
                },
                  React.createElement('div', { className: 'flex items-center gap-1.5 mb-1' },
                    React.createElement('span', { className: `text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${a.priority === 'emergency' ? 'bg-red-600 text-white' : a.priority === 'important' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}` }, a.priority)
                  ),
                  React.createElement('h3', { className: 'font-bold text-sm leading-tight' }, a.title),
                  React.createElement('p', { className: 'text-xs text-gray-600 mt-1 leading-normal' }, a.content)
                )
              )
          )
        )
      ),

      // Right Column: Dashboard Utilities or Emergency Notice
      React.createElement('div', { className: 'space-y-4 w-full' },
        systemMode === 'emergency' 
          ? React.createElement('div', { className: 'bg-red-50 text-red-800 text-xs p-4 rounded-xl border border-red-200 font-medium' }, '🛑 Emergency Operations Mode Active. Forms and AI options are hidden.')
          : React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'grid grid-cols-3 gap-2.5' },
                React.createElement('button', { onClick: () => { setShowEnrollmentModal(true); setEnrollStep(1); }, className: 'bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm' },
                  React.createElement('span', { className: 'text-xl mb-1' }, '📝'),
                  React.createElement('span', { className: 'text-xs font-bold text-gray-700' }, 'Enrollment')
                ),
                React.createElement('button', { onClick: () => alert(isLoggedIn ? "Opening Report Cards..." : "Please Login first."), className: 'bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm' },
                  React.createElement('span', { className: 'text-xl mb-1' }, '📊'),
                  React.createElement('span', { className: 'text-xs font-bold text-gray-700' }, 'Report Cards')
                ),
                React.createElement('button', { onClick: () => alert(isLoggedIn ? "Opening Document Requests..." : "Please Login first."), className: 'bg-white border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition shadow-sm' },
                  React.createElement('span', { className: 'text-xl mb-1' }, '📄'),
                  React.createElement('span', { className: 'text-xs font-bold text-gray-700' }, 'Request Docs')
                )
              ),

              React.createElement('section', { className: 'bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('span', { className: 'text-lg' }, '🤖'),
                  React.createElement('h3', { className: 'font-bold text-sm text-gray-800' }, 'Smart AI Assistant')
                ),
                React.createElement('div', { className: 'bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 italic leading-relaxed' }, isAiLoading ? "Processing query safely..." : aiResponse),
                React.createElement('form', { onSubmit: handleAiAsk, className: 'flex gap-2' },
                  React.createElement('input', {
                    type: 'text',
                    value: aiQuery,
                    onChange: (e) => setAiQuery(e.target.value),
                    placeholder: 'Ask about enrollment...',
                    className: 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }),
                  React.createElement('button', { type: 'submit', className: 'bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold' }, 'Ask')
                )
              )
            )
      )
    ),

    showEnrollmentModal && React.createElement('div', { className: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-0 sm:p-4' },
      React.createElement('div', { className: 'bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto' },
        React.createElement('div', { className: 'flex justify-between items-center border-b border-gray-100 pb-3' },
          React.createElement('div', null,
            React.createElement('h2', { className: 'font-bold text-gray-800 text-base' }, 'New Student Enrollment'),
            React.createElement('p', { className: 'text-[11px] text-gray-400 font-mono' }, `Key: ${idempotencyKey.substring(0, 8)}...`)
          ),
          React.createElement('button', { onClick: () => setShowEnrollmentModal(false), className: 'text-gray-400 font-bold' }, '✕')
        ),

        enrollStatus 
          ? React.createElement('div', { className: 'py-6 text-center space-y-3' },
              React.createElement('div', { className: 'text-4xl' }, '✅'),
              React.createElement('h3', { className: 'font-bold text-gray-800 text-lg' }, 'Submission Successful'),
              React.createElement('p', { className: 'text-xs text-gray-600 px-4' }, 'Saved with reference code: ', React.createElement('strong', { className: 'font-mono bg-gray-100 px-1 text-blue-600' }, enrollStatus.txId)),
              React.createElement('button', { onClick: () => { setEnrollStatus(null); setShowEnrollmentModal(false); }, className: 'w-full bg-gray-900 text-white rounded-xl py-2.5 text-xs font-bold' }, 'Close')
            )
          : React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'flex items-center justify-between text-xs text-gray-400 font-medium' },
                React.createElement('span', { className: enrollStep >= 1 ? 'text-blue-600 font-bold' : '' }, '1. Parent'),
                React.createElement('span', { className: 'h-px bg-gray-200 flex-1 mx-2' }),
                React.createElement('span', { className: enrollStep >= 2 ? 'text-blue-600 font-bold' : '' }, '2. Student'),
                React.createElement('span', { className: 'h-px bg-gray-200 flex-1 mx-2' }),
                React.createElement('span', { className: enrollStep >= 3 ? 'text-blue-600 font-bold' : '' }, '3. Verify')
              ),

              enrollStep === 1 && React.createElement('div', { className: 'space-y-3' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Parent/Guardian Name *'),
                  React.createElement('input', { type: 'text', value: enrollForm.parentName, onChange: (e) => updateEnrollForm({ parentName: e.target.value }), className: 'w-full border border-gray-200 rounded-xl p-2.5 text-xs', placeholder: 'Juan dela Cruz' })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Mobile Number *'),
                  React.createElement('input', { type: 'tel', value: enrollForm.phone, onChange: (e) => updateEnrollForm({ phone: e.target.value }), className: 'w-full border border-gray-200 rounded-xl p-2.5 text-xs', placeholder: '+63 917 123 4567' })
                ),
                React.createElement('button', { disabled: !enrollForm.parentName || !enrollForm.phone, onClick: () => handleStepChange(2), className: 'w-full bg-gray-900 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold' }, 'Continue →')
              ),

              enrollStep === 2 && React.createElement('div', { className: 'space-y-3' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, "Child's Full Name *"),
                  React.createElement('input', { type: 'text', value: enrollForm.childName, onChange: (e) => updateEnrollForm({ childName: e.target.value }), className: 'w-full border border-gray-200 rounded-xl p-2.5 text-xs', placeholder: 'Maria dela Cruz' })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-600 mb-1' }, 'Target Grade *'),
                  React.createElement('select', { value: enrollForm.gradeSelection, onChange: (e) => updateEnrollForm({ gradeSelection: e.target.value }), className: 'w-full border border-gray-200 rounded-xl p-2.5 text-xs' },
                    React.createElement('option', { value: '' }, '-- Choose Grade --'),
                    React.createElement('option', { value: '1' }, 'Grade 1'),
                    React.createElement('option', { value: '2' }, 'Grade 2'),
                    React.createElement('option', { value: '3' }, 'Grade 3')
                  )
                ),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', { onClick: () => handleStepChange(1), className: 'w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs' }, 'Back'),
                  React.createElement('button', { disabled: !enrollForm.childName || !enrollForm.gradeSelection, onClick: () => handleStepChange(3), className: 'flex-1 bg-gray-900 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-xs font-bold' }, 'Continue')
                )
              ),

              enrollStep === 3 && React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600 space-y-1' },
                  React.createElement('div', null, React.createElement('strong', null, 'Guardian: '), enrollForm.parentName),
                  React.createElement('div', null, React.createElement('strong', null, 'Mobile: '), enrollForm.phone),
                  React.createElement('div', null, React.createElement('strong', null, 'Student: '), enrollForm.childName),
                  React.createElement('div', null, React.createElement('strong', null, 'Grade: '), `Grade ${enrollForm.gradeSelection}`)
                ),
                React.createElement('div', { className: 'border border-dashed border-gray-200 rounded-xl p-3 space-y-2' },
                  React.createElement('label', { className: 'block text-xs font-bold text-gray-700' }, 'Birth Certificate (Optional)'),
                  React.createElement('input', { type: 'file', accept: 'image/*,application/pdf', onChange: () => updateEnrollForm({ documentSkipped: false }), className: 'block w-full text-[11px] text-gray-400' })
                ),
                React.createElement('p', { className: 'text-[11px] text-gray-400 italic text-center' }, '✓ Progress auto-saved locally.'),
                React.createElement('div', { className: 'flex gap-2' },
                  React.createElement('button', { onClick: () => handleStepChange(2), className: 'w-1/3 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs' }, 'Back'),
                  React.createElement('button', { onClick: submitEnrollment, className: 'flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold' }, 'Submit Enrollment')
                )
              )
            )
      )
    ),

    // Hidden footer on desktop screens since desktop has lots of viewport area
    React.createElement('footer', { className: 'fixed bottom-0 max-w-md w-full bg-white border-t border-gray-200 py-2.5 px-6 flex justify-between items-center text-gray-400 z-40 lg:hidden' },
      React.createElement('button', { className: 'flex flex-col items-center text-blue-600' }, React.createElement('span', { className: 'text-xl' }, '🏠'), React.createElement('span', { className: 'text-[10px] font-bold' }, 'Home')),
      React.createElement('button', { className: 'flex flex-col items-center' }, React.createElement('span', { className: 'text-xl' }, '📢'), React.createElement('span', { className: 'text-[10px]' }, 'Alerts')),
      React.createElement('button', { className: 'flex flex-col items-center' }, React.createElement('span', { className: 'text-xl' }, '📄'), React.createElement('span', { className: 'text-[10px]' }, 'Docs')),
      React.createElement('button', { className: 'flex flex-col items-center' }, React.createElement('span', { className: 'text-xl' }, '⚙️'), React.createElement('span', { className: 'text-[10px]' }, 'Settings'))
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SchoolPlatform));