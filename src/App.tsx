import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Leaf, Moon, BarChart2, BookOpen, User, FileText, Settings,
  Calendar, ChevronDown, AlertCircle, RefreshCw, Droplet, LogIn, UserPlus, LogOut
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
// Ensure Bootstrap JS is imported, typically in index.tsx for dropdowns etc.
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
// Import types and API service
import { Thought, Mood, ThoughtCreatePayload, JournalSummaryData, GrowthInsightsData, User as AppUser, Practice, ApiErrorDetail } from './types'; // Added Practice type
import * as api from './services/api';
// Import Auth Context and Pages/Components
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignUpPage';
import { LoadingSpinner, ErrorMessage } from './components/common';

// --- Interfaces ---
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}
interface MobileNavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}
interface MobileMenuLinkProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}
interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}
interface HomePageProps {
  setActivePage: (page: string) => void;
  isLoggedIn?: boolean;
  username?: string;
}
interface GrowthPageProps { setActivePage: (page: string) => void; }
interface GardenPageProps {} // No specific props needed
interface MindspacePageProps {} // No specific props needed
interface JournalPageProps {}
interface ResourcesPageProps {}
interface AboutPageProps {}
interface AccountPageProps {}
interface GrowthInsightsProps {
    insights: GrowthInsightsData | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}
interface PracticeCardProps { // Added for Mindspace
    practice: Practice;
    onStart: (practice: Practice) => void;
    isFeatured?: boolean;
}


// --- Main App Structure (Wrapper) ---
const AppWrapper: React.FC = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};


// --- Main App Component (Consumes AuthContext) ---
const App: React.FC = () => {
   const [activePage, setActivePage] = useState('home');
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [showLogin, setShowLogin] = useState(true);

   const { isAuthenticated, user, isLoading: isAuthLoading, logout, error: authError } = useAuth();

   const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

   const handleNav = (page: string) => {
       setActivePage(page);
       setMobileMenuOpen(false);
   };

   // Show loading spinner during initial auth check
   if (isAuthLoading) {
       return (
           <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
               <LoadingSpinner text="Initializing..." size="lg"/>
           </div>
       );
   }

   // Show Login/Signup forms if not authenticated
   if (!isAuthenticated) {
       return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
                {showLogin ? (
                    <LoginPage onSignupClick={() => setShowLogin(false)} />
                ) : (
                    <SignupPage
                        onLoginClick={() => setShowLogin(true)}
                        onSignupSuccess={() => setShowLogin(true)}
                     />
                )}
           </div>
       );
   }

   // --- Render Authenticated App ---
   const renderContent = () => {
     switch(activePage) {
       case 'home':
         return <HomePage setActivePage={handleNav} isLoggedIn={isAuthenticated} username={user?.username} />;
       case 'growth':
         return <GrowthPage setActivePage={handleNav} />;
       case 'mindspace':
         return <MindspacePage />; // Render the implemented MindspacePage
       case 'garden':
         return <GardenPage />; // Render the working GardenPage
       case 'journal':
         return <JournalPage />;
       case 'resources':
         return <ResourcesPage />; // Placeholder
       case 'about':
         return <AboutPage />; // Placeholder
       case 'account':
         return <AccountPage />;
       default:
         return <HomePage setActivePage={handleNav} isLoggedIn={isAuthenticated} username={user?.username} />;
     }
   };

   // --- Main App Return (JSX Structure) ---
   // This structure remains the same
   return (
     <div className="d-flex flex-column min-vh-100 bg-light">
        {/* Header */}
        <header className="bg-success text-white p-3 shadow sticky-top">
            <div className="container d-flex justify-content-between align-items-center">
                <h1 className="fs-3 fw-bold cursor-pointer mb-0" onClick={() => handleNav('home')}>NeuroNest</h1>
                {/* Desktop Nav */}
                <nav className="d-none d-md-flex align-items-center" aria-label="Main navigation">
                    <NavButton icon={<Home size={16} />} label="Home" isActive={activePage === 'home'} onClick={() => handleNav('home')} />
                    <NavButton icon={<Leaf size={16} />} label="Growth" isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
                    <NavButton icon={<Moon size={16} />} label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
                    <NavButton icon={<BarChart2 size={16} />} label="Garden" isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
                    <NavButton icon={<FileText size={16} />} label="Journal" isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
                    {/* Account/Logout Dropdown */}
                    <div className="dropdown">
                         <button className={`d-flex align-items-center btn ${activePage === 'account' ? 'btn-light text-success' : 'btn-success text-white'} rounded ms-1 px-3 py-1 dropdown-toggle`} type="button" id="desktopUserMenu" data-bs-toggle="dropdown" aria-expanded="false">
                            <Settings size={16} className="me-1" />
                            <span>{user?.username || "Account"}</span>
                        </button>
                         <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="desktopUserMenu">
                            <li><button className="dropdown-item d-flex align-items-center" onClick={() => handleNav('account')}><User size={16} className="me-2"/>My Account</button></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><button className="dropdown-item d-flex align-items-center text-danger" onClick={logout}><LogOut size={16} className="me-2"/>Logout</button></li>
                        </ul>
                    </div>
                </nav>
                {/* Mobile Nav Toggle */}
                <div className="d-md-none">
                     <span className="fs-6 me-2 text-white-50">Hi, {user?.username}</span>
                    <button className="btn btn-success" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>
        </header>

         {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="d-md-none bg-white shadow position-fixed top-0 end-0 mt-5 me-2 w-75 rounded-bottom z-index-1000" style={{ paddingTop: '60px' }}>
            <nav className="d-flex flex-column py-2" aria-label="Mobile navigation">
                <MobileMenuLink label="Home" isActive={activePage === 'home'} onClick={() => handleNav('home')} />
                <MobileMenuLink label="Growth" isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
                <MobileMenuLink label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
                <MobileMenuLink label="Garden" isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
                <MobileMenuLink label="Journal" isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
                <hr className="my-1"/>
                <MobileMenuLink label="My Account" isActive={activePage === 'account'} onClick={() => handleNav('account')} />
                <button className="w-100 text-start px-4 py-2 border-0 text-danger d-flex align-items-center" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut size={16} className="me-2"/>Logout
                </button>
            </nav>
            </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="d-md-none fixed-bottom w-100 bg-white border-top d-flex justify-content-around p-2 z-index-100 shadow-lg" aria-label="Mobile bottom navigation">
            <MobileNavButton icon={<Home size={20} />} isActive={activePage === 'home'} onClick={() => handleNav('home')} />
            <MobileNavButton icon={<Leaf size={20} />} isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
            <MobileNavButton icon={<Moon size={20} />} isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
            <MobileNavButton icon={<BarChart2 size={20} />} isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
            <MobileNavButton icon={<FileText size={20} />} isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
             <MobileNavButton icon={<User size={20} />} isActive={activePage === 'account'} onClick={() => handleNav('account')} />
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1 container py-4" style={{ paddingBottom: '80px' }}>
            {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-success text-white p-3 text-center mt-auto">
            <p className="mb-0">© {new Date().getFullYear()} NeuroNest - Nurturing Your Mind</p>
        </footer>
     </div>
   );
};

// --- Navigation Components ---
// (NavButton, MobileNavButton, MobileMenuLink - No changes needed)
const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => ( <button className={`d-flex align-items-center btn ${isActive ? 'btn-light text-success' : 'btn-success text-white'} rounded me-1 px-3 py-1`} onClick={onClick}> <span className="me-1" aria-hidden="true">{icon}</span><span>{label}</span> </button> );
const MobileNavButton: React.FC<MobileNavButtonProps> = ({ icon, isActive, onClick }) => ( <button className={`btn ${isActive ? 'text-success bg-success-subtle' : 'text-secondary'} rounded-circle p-2`} onClick={onClick} aria-label={`Navigate ${isActive ? '(current page)' : ''}`}> {icon} </button> );
const MobileMenuLink: React.FC<MobileMenuLinkProps> = ({ label, isActive, onClick }) => ( <button className={`w-100 text-start px-4 py-2 border-0 ${isActive ? 'bg-success-subtle text-success fw-medium' : 'text-secondary hover-bg-light'}`} onClick={onClick} aria-current={isActive ? 'page' : undefined}> {label} </button> );

// --- Feature Card Component ---
// (No changes needed)
const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, description, onClick }) => ( <div className="bg-white rounded shadow p-4 text-center hover-shadow-lg transition cursor-pointer h-100 d-flex flex-column" onClick={onClick} role="button" tabIndex={0} onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}> <div className="d-flex justify-content-center mb-3" aria-hidden="true">{icon}</div><h3 className="fs-5 fw-semibold text-dark mb-2">{title}</h3><p className="text-secondary flex-grow-1">{description}</p> </div> );

// --- Home Page Component ---
// (No changes needed)
const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, username }) => ( <div className="mx-auto" style={{maxWidth: "960px"}}> {isLoggedIn && (<div className="alert alert-primary mb-4" role="alert"><p className="fw-medium mb-1">Welcome back, {username}!</p><p className="small mb-0">Continue your wellness journey.</p></div>)} <div className="bg-white rounded shadow p-4 my-4 text-center"><h2 className="fs-2 fw-bold text-success mb-4">Welcome to NeuroNest</h2><div className="mb-4 display-4" aria-hidden="true">🌳</div><p className="text-secondary fs-5 mb-4">Your sanctuary for mental wellness and personal growth.</p><p className="text-secondary mb-4">Plant seeds of change, nurture them, and watch your mindset flourish.</p><div className="d-flex flex-wrap justify-content-center gap-2"><button className="btn btn-success px-4 py-2" onClick={() => setActivePage('growth')}>Start Your Journey</button></div></div> <div className="row row-cols-1 row-cols-md-3 g-4 my-4"> <div className="col d-flex"><FeatureCard title="Plant a Thought" icon={<Leaf className="text-success" size={48} />} description="Transform thoughts into growing visualizations." onClick={() => setActivePage('growth')}/></div> <div className="col d-flex"><FeatureCard title="Find Your Peace" icon={<Moon className="text-indigo" size={48} />} description="Access meditation and breathing exercises." onClick={() => setActivePage('mindspace')}/></div> <div className="col d-flex"><FeatureCard title="Track Your Growth" icon={<BarChart2 className="text-primary" size={48} />} description="Visualize progress and celebrate milestones." onClick={() => setActivePage('garden')}/></div> </div> </div> );

// --- Growth Page Component ---
// (Verified - Same implementation as previous working versions)
const GrowthPage: React.FC<GrowthPageProps> = ({ setActivePage }) => {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newThoughtContent, setNewThoughtContent] = useState('');
    const [newThoughtMood, setNewThoughtMood] = useState<Mood>(Mood.Neutral);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wateringStates, setWateringStates] = useState<{ [key: number]: boolean }>({});

    const fetchThoughts = useCallback(async () => { setIsLoading(true); setError(null); try { const data = await api.getThoughts(); setThoughts(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); } catch (err: any) { setError(err.message || "Failed to load thoughts."); console.error("Fetch thoughts error:", err); } finally { setIsLoading(false); } }, []);
    useEffect(() => { fetchThoughts(); }, [fetchThoughts]);
    const handleCreateThought = async (e: React.FormEvent) => { e.preventDefault(); if (!newThoughtContent.trim()) { alert("Please enter a thought."); return; } setIsSubmitting(true); setError(null); try { const payload: ThoughtCreatePayload = { content: newThoughtContent, mood: newThoughtMood }; await api.createThought(payload); setNewThoughtContent(''); setNewThoughtMood(Mood.Neutral); await fetchThoughts(); } catch (err: any) { setError(err.message || "Failed to plant seed."); console.error("Create thought error:", err); } finally { setIsSubmitting(false); } };
    const handleWaterPlant = async (thoughtId: number) => { setWateringStates(prev => ({ ...prev, [thoughtId]: true })); const originalThoughts = [...thoughts]; setThoughts(prevThoughts => prevThoughts.map(t => t.id === thoughtId ? { ...t, growth_stage: Math.min(t.growth_stage + 1, 3), last_watered_at: new Date().toISOString() } : t )); try { await api.waterThought(thoughtId); } catch (err: any) { setError(err.message || `Failed to water plant ${thoughtId}.`); console.error(`Water plant ${thoughtId} error:`, err); setThoughts(originalThoughts); } finally { setWateringStates(prev => ({ ...prev, [thoughtId]: false })); } };
    const getGrowthEmoji = (stage: number) => ['🌱', '🌿', '🌿', '🌸'][stage] || '❓';
    const getGrowthStageName = (stage: number) => ['Seed', 'Sprout', 'Growing', 'Flowering'][stage] || 'Unknown';

    return ( <div className="mx-auto" style={{maxWidth: "960px"}}> <h2 className="fs-2 fw-bold text-success mb-4">Growth Space</h2><p className="text-secondary mb-4">Plant seeds of thoughts, intentions, or goals. Nurture them by watering daily and watch them grow.</p> {/* Plant New Seed Form */} <div className="bg-white rounded shadow p-4 mb-4"> <h3 className="fs-4 fw-semibold mb-3">Plant a New Seed</h3> <form onSubmit={handleCreateThought}> <ErrorMessage message={error && isSubmitting ? error : null} /> <div className="mb-3"><label className="form-label text-secondary" htmlFor="thoughtContent">What's on your mind today?</label><textarea id="thoughtContent" className="form-control" placeholder="Share a thought, goal, or feeling..." value={newThoughtContent} onChange={(e) => setNewThoughtContent(e.target.value)} rows={3} disabled={isSubmitting} required aria-required="true"/></div> <div className="mb-3"><label className="form-label text-secondary">How are you feeling about this?</label><div className="d-flex flex-wrap gap-2">{(Object.values(Mood)).map((moodValue) => (<button key={moodValue} type="button" onClick={() => setNewThoughtMood(moodValue)} className={`btn btn-sm ${newThoughtMood === moodValue ? (moodValue === Mood.Positive ? 'btn-success' : moodValue === Mood.Neutral ? 'btn-primary' : 'btn-warning') : 'btn-outline-secondary'}`} disabled={isSubmitting} aria-pressed={newThoughtMood === moodValue}>{moodValue.charAt(0).toUpperCase() + moodValue.slice(1)}</button>))}</div></div> <button type="submit" className="btn btn-success px-4 py-2" disabled={isSubmitting}>{isSubmitting ? <LoadingSpinner text="Planting..." size="sm" /> : <><Leaf size={16} className="me-1" /> Plant Seed</>}</button> </form> </div> {/* Your Growing Seeds */} <div className="bg-white rounded shadow p-4"> <div className="d-flex justify-content-between align-items-center mb-3"><h3 className="fs-4 fw-semibold mb-0">Your Growing Seeds</h3><button className="btn btn-sm btn-outline-secondary" onClick={fetchThoughts} disabled={isLoading} aria-label="Refresh thoughts list"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button></div> {isLoading && <LoadingSpinner text="Loading your seeds..."/>} <ErrorMessage message={error && !isSubmitting ? error : null} onRetry={fetchThoughts}/> {!isLoading && !error && thoughts.length === 0 && ( <div className="text-center py-4 text-secondary"><Leaf size={48} className="mx-auto mb-3 opacity-50" /><p>You haven't planted any seeds yet.</p></div> )} {!isLoading && thoughts.length > 0 && (<div className="d-flex flex-column gap-3">{thoughts.map(thought => (<div key={thought.id} className="border rounded p-3 hover-border-success transition"><div className="d-flex justify-content-between align-items-start mb-2 gap-2"><span className="fs-3" title={`Growth Stage: ${getGrowthStageName(thought.growth_stage)}`}>{getGrowthEmoji(thought.growth_stage)}</span><span className={`badge ms-2 ${ thought.mood === Mood.Positive ? 'text-bg-success' : thought.mood === Mood.Neutral ? 'text-bg-primary' : 'text-bg-warning' }`}>{thought.mood}</span><span className="text-secondary small text-nowrap ms-auto">{new Date(thought.created_at).toLocaleDateString()}</span></div><p className="text-dark mb-3">{thought.content}</p><div className="mt-3 d-flex justify-content-between align-items-center small text-secondary"><span>Last watered: {new Date(thought.last_watered_at).toLocaleDateString()}</span><button className="btn btn-sm btn-outline-success d-flex align-items-center" onClick={() => handleWaterPlant(thought.id)} disabled={thought.growth_stage === 3 || wateringStates[thought.id]} title={thought.growth_stage === 3 ? "Fully Grown" : "Water Plant"}>{wateringStates[thought.id] ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><Droplet size={14} className="me-1"/> {thought.growth_stage < 3 ? 'Water' : 'Grown'}</>}</button></div></div>))}</div>)} </div> </div> );
};

// --- Garden Page Component ---
// (Verified - Reverted to the previous working version you provided)
const GardenPage: React.FC<GardenPageProps> = () => {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoadingThoughts, setIsLoadingThoughts] = useState(true);
    const [thoughtsError, setThoughtsError] = useState<string | null>(null);
    const [insights, setInsights] = useState<GrowthInsightsData | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
    const [viewMode, setViewMode] = useState<'garden' | 'insights'>('garden');
    const [wateringStates, setWateringStates] = useState<{ [key: number]: boolean }>({});

    const fetchThoughts = useCallback(async () => {
        setIsLoadingThoughts(true); setThoughtsError(null);
        try { const data = await api.getThoughts(); setThoughts(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); }
        catch (err: any) { setThoughtsError(err.message || "Failed to load garden."); }
        finally { setIsLoadingThoughts(false); }
    }, []);
    const fetchInsights = useCallback(async () => {
        setIsLoadingInsights(true); setInsightsError(null);
        try { const data = await api.getGrowthInsights(); setInsights(data); }
        catch (err: any) { setInsightsError(err.message || "Failed to load insights."); }
        finally { setIsLoadingInsights(false); }
    }, []);
    useEffect(() => { if (viewMode === 'garden') fetchThoughts(); else if (viewMode === 'insights') fetchInsights(); }, [viewMode, fetchThoughts, fetchInsights]);
    const handleWaterPlant = async (thoughtId: number) => {
        setWateringStates(prev => ({ ...prev, [thoughtId]: true })); const originalThoughts = [...thoughts]; const originalSelected = selectedThought ? {...selectedThought} : null;
        const updateState = (thought: Thought | null) => thought ? { ...thought, growth_stage: Math.min(thought.growth_stage + 1, 3), last_watered_at: new Date().toISOString() } : null;
        setThoughts(prevThoughts => prevThoughts.map(t => t.id === thoughtId ? updateState(t)! : t)); if (selectedThought?.id === thoughtId) setSelectedThought(updateState(selectedThought));
        try { await api.waterThought(thoughtId); }
        catch (err: any) { setThoughtsError(err.message || `Failed to water plant ${thoughtId}.`); setThoughts(originalThoughts); if (selectedThought?.id === thoughtId) setSelectedThought(originalSelected); }
        finally { setWateringStates(prev => ({ ...prev, [thoughtId]: false })); }
    };
    const handlePlantClick = (thought: Thought) => setSelectedThought(thought);
    const closeThoughtDetail = () => setSelectedThought(null);
    const getGrowthEmoji = (stage: number) => ['🌱', '🌿', '🌿', '🌸'][stage] || '❓';
    const getGrowthStageName = (stage: number) => ['Seed', 'Sprout', 'Growing', 'Flowering'][stage] || 'Unknown';

    return (
        <div className="mx-auto" style={{maxWidth: "960px"}}>
            <h2 className="fs-2 fw-bold text-primary mb-4">Progress Garden</h2><p className="text-secondary mb-4">Visualize your growth journey. Explore insights into your progress.</p>
            {/* View Mode Toggle */}
            <div className="bg-white rounded shadow p-3 mb-4 d-flex"><button className={`btn flex-grow-1 ${viewMode === 'garden' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`} onClick={() => {setViewMode('garden'); setSelectedThought(null);}} aria-pressed={viewMode === 'garden'}><BarChart2 size={16} className="me-1"/> Garden View</button><button className={`btn flex-grow-1 ${viewMode === 'insights' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`} onClick={() => {setViewMode('insights'); setSelectedThought(null);}} aria-pressed={viewMode === 'insights'}><RefreshCw size={16} className="me-1"/> Growth Insights</button></div>
            {/* Selected Thought Detail View */}
            {selectedThought && viewMode === 'garden' && (<div className="bg-white rounded shadow p-4 mb-4"><div className="d-flex justify-content-between align-items-start mb-3"><h3 className="fs-4 fw-semibold">Thought Detail</h3><button className="btn btn-close" onClick={closeThoughtDetail} aria-label="Close thought detail"></button></div><div className="d-flex align-items-center justify-content-center mb-3"><div className="display-3">{getGrowthEmoji(selectedThought.growth_stage)}</div></div><div className="mt-3"><div className="d-flex justify-content-between align-items-center mb-2"><span className="text-secondary small">Planted: {new Date(selectedThought.created_at).toLocaleDateString()}</span><span className={`small badge ${ selectedThought.mood === Mood.Positive ? 'text-bg-success' : selectedThought.mood === Mood.Negative ? 'text-bg-warning' : 'text-bg-primary' }`}>{selectedThought.mood}</span></div><div className="p-3 bg-light rounded mb-3"><p className="text-dark mb-0">{selectedThought.content}</p></div><div className="d-flex justify-content-between align-items-center"><span className="fw-medium text-secondary">Stage: {getGrowthStageName(selectedThought.growth_stage)}</span><button className="btn btn-sm btn-outline-success d-flex align-items-center" onClick={() => handleWaterPlant(selectedThought.id)} disabled={selectedThought.growth_stage === 3 || wateringStates[selectedThought.id]} title={selectedThought.growth_stage === 3 ? "Fully Grown" : "Water Plant"}>{wateringStates[selectedThought.id] ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <><Droplet size={14} className="me-1"/> {selectedThought.growth_stage < 3 ? 'Water' : 'Grown'}</>}</button></div><div className="text-secondary small mt-1">Last watered: {new Date(selectedThought.last_watered_at).toLocaleDateString()}</div></div></div>)}
            {/* Garden View */}
            {viewMode === 'garden' && !selectedThought && (<div className="bg-white rounded shadow p-4"><div className="d-flex justify-content-between align-items-center mb-3"><h3 className="fs-4 fw-semibold mb-0">Your Garden</h3><button className="btn btn-sm btn-outline-secondary" onClick={fetchThoughts} disabled={isLoadingThoughts} aria-label="Refresh garden view"><RefreshCw size={14} className={isLoadingThoughts ? 'animate-spin' : ''}/></button></div>{isLoadingThoughts && <LoadingSpinner text="Loading your garden..."/>}<ErrorMessage message={thoughtsError} onRetry={fetchThoughts}/>{!isLoadingThoughts && !thoughtsError && thoughts.length === 0 && (<div className="text-center py-4 text-secondary"><BarChart2 size={48} className="mx-auto mb-3 opacity-50" /><p>Your garden is empty. Plant some thoughts!</p></div>)}{!isLoadingThoughts && thoughts.length > 0 && (<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">{thoughts.map(thought => (<div key={thought.id} className="col"><div className="border rounded p-3 text-center hover-border-primary hover-shadow cursor-pointer transition d-flex flex-column h-100" onClick={() => handlePlantClick(thought)} title={thought.content} role="button" tabIndex={0} onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handlePlantClick(thought)}><div className="fs-2 mb-2">{getGrowthEmoji(thought.growth_stage)}</div><div className="text-truncate small fw-medium text-dark mb-1 flex-grow-1">{thought.content}</div><div className="small text-secondary mt-auto">{new Date(thought.created_at).toLocaleDateString()}</div></div></div>))}</div>)}</div>)}
            {/* Insights View */}
            {viewMode === 'insights' && ( <GrowthInsightsView insights={insights} isLoading={isLoadingInsights} error={insightsError} onRefresh={fetchInsights}/> )}
        </div>
    ); // End of GardenPage return
}; // End of GardenPage component

// --- Growth Insights Component ---
// (Verified - Reverted to the previous working version you provided)
const GrowthInsightsView: React.FC<GrowthInsightsProps> = ({ insights, isLoading, error, onRefresh }) => {
    const renderMoodDistribution = () => {
        if (!insights || !insights.mood_distribution || Object.keys(insights.mood_distribution).length === 0) { return <p className="text-secondary small">No mood data available.</p>; }
        const total = Object.values(insights.mood_distribution).reduce((sum, count) => sum + (count || 0), 0);
        if (total === 0) return <p className="text-secondary small">No moods recorded.</p>;
        const moodColors: { [key in Mood]?: string } = { [Mood.Positive]: 'bg-success', [Mood.Neutral]: 'bg-primary', [Mood.Negative]: 'bg-warning' };
        return (
            <>
                <div className="progress" role="progressbar" aria-label="Mood distribution" style={{ height: "24px" }}>
                    {(Object.keys(insights.mood_distribution) as Mood[]).map((moodKey) => { const count = insights.mood_distribution[moodKey] || 0; const percentage = ((count / total) * 100); return (<div key={moodKey} className={`progress-bar ${moodColors[moodKey] || 'bg-secondary'}`} style={{ width: `${percentage}%` }} title={`${moodKey.charAt(0).toUpperCase() + moodKey.slice(1)}: ${count} (${percentage.toFixed(1)}%)`}>{percentage > 15 ? `${moodKey.charAt(0).toUpperCase() + moodKey.slice(1)}` : ''}</div>); })}
                </div>
                <div className="d-flex justify-content-between flex-wrap small text-secondary mt-1">{(Object.keys(insights.mood_distribution) as Mood[]).map((moodKey) => (<span key={moodKey}>{`${moodKey.charAt(0).toUpperCase() + moodKey.slice(1)} (${insights.mood_distribution[moodKey] || 0})`}</span>))}</div>
            </>
        );
    };
    return (
        <div className="bg-white rounded shadow p-4">
            <div className="d-flex justify-content-between align-items-center mb-3"><h3 className="fs-4 fw-semibold mb-0">Growth Insights (Last 30 Days)</h3><button className="btn btn-sm btn-outline-secondary" onClick={onRefresh} disabled={isLoading} aria-label="Refresh insights"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/></button></div>
            {isLoading && <LoadingSpinner text="Calculating insights..."/>} <ErrorMessage message={error} onRetry={onRefresh}/>
            {!isLoading && !error && !insights && (<p className="text-secondary">No insights available.</p>)}
            {!isLoading && !error && insights && ( <> <div className="mb-4 p-3 border rounded bg-light"><h4 className="fs-6 fw-medium text-secondary mb-2">Overall Activity</h4><p className="mb-1"><strong>Total Thoughts Planted:</strong> {insights.total_thoughts}</p><p className="mb-0"><strong>Recent Trend:</strong> <span className="text-capitalize">{insights.recent_growth_trend}</span></p></div> <div className="mb-4"><h4 className="fs-6 fw-medium text-secondary mb-3">Mood Distribution</h4>{renderMoodDistribution()}</div> <div className="alert alert-info small" role="alert">Insights based on the last 30 days.</div> </> )}
        </div>
    ); // End of GrowthInsightsView return
}; // End of GrowthInsightsView component

// --- Journal Page Component ---
// (Verified - Same implementation as previous working versions)
const JournalPage: React.FC<JournalPageProps> = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<JournalSummaryData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const generateSummary = async () => { setIsGenerating(true); setError(null); try { const data = await api.getJournalSummary(); setSummaryData(data); setShowSummary(true); } catch (err: any) { console.error("Error generating summary:", err); setError(err.message || "An unknown error occurred."); setShowSummary(false); } finally { setIsGenerating(false); } };
    const renderSummaryView = (): React.ReactNode => { if (!summaryData) return null; return ( <div className="bg-white rounded shadow p-4 mb-4"><div className="d-flex justify-content-between align-items-center mb-3"><h3 className="fs-4 fw-semibold">Weekly Summary (AI Generated)</h3><button className="btn btn-link text-secondary" onClick={() => { setShowSummary(false); setSummaryData(null); setError(null); }}>Back to Journal</button></div><ErrorMessage message={error} /><div className="mb-4"><h4 className="fs-5 fw-medium text-dark mb-2">Summary</h4><p className="text-secondary">{summaryData.summary}</p></div><div className="alert alert-purple mb-4" role="alert"><h4 className="fs-6 fw-medium mb-1">Pattern Insight</h4><p className="mb-0">{summaryData.insight}</p></div><div className="mb-4"><h4 className="fs-5 fw-medium text-dark mb-2">Recommendation</h4><p className="text-secondary">{summaryData.recommendation}</p></div><div><h4 className="fs-5 fw-medium text-dark mb-3">Highlights Mentioned</h4>{summaryData.highlights && summaryData.highlights.length > 0 ? (<div className="d-flex flex-column gap-3">{summaryData.highlights.map((highlight, index) => (<div key={index} className="border rounded p-3"><div className="d-flex justify-content-between align-items-start mb-2"><span className="small text-secondary">{highlight.date}</span></div><p className="text-dark mb-2 fst-italic">"{highlight.entry}"</p><div className="small text-secondary border-start border-3 border-purple ps-3">{highlight.comment}</div></div>))}</div>) : (<p className="text-secondary">No specific highlights identified.</p>)}</div></div> ); };
    return ( <div className="mx-auto" style={{maxWidth: "960px"}}> <h2 className="fs-2 fw-bold text-purple mb-4">Wellness Journal</h2> {showSummary ? renderSummaryView() : ( <> <p className="text-secondary mb-4">Generate an AI-powered summary...</p> <ErrorMessage message={error && !isGenerating ? error : null} onRetry={generateSummary}/> <div className="bg-white rounded shadow p-4 mb-4 text-center"><h3 className="fs-4 fw-semibold mb-3">Generate Weekly Summary</h3><p className="text-secondary mb-3">Uses entries from the last 7 days.</p><button className="btn btn-purple px-4 py-2 d-inline-flex align-items-center mx-auto" onClick={generateSummary} disabled={isGenerating}>{isGenerating ? <LoadingSpinner text="Generating..." size="sm" /> : <><FileText size={16} className="me-2" />Generate Weekly Summary</>}</button></div> <div className="bg-white rounded shadow p-4"><h3 className="fs-4 fw-semibold mb-3">Previous Summaries</h3><p className="text-secondary">Coming soon!</p>{/* Placeholder */}</div> </> )} </div> );
};

// --- Mindspace Page Component ---
// (Verified - Same implementation as previous working versions)
const MindspacePage: React.FC<MindspacePageProps> = () => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Practice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showActivity, setShowActivity] = useState(false);
    const [activityDetails, setActivityDetails] = useState<Practice | null>(null);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const featuredPractices: Practice[] = [ { id: 'deep_breathing', title: 'Deep Breathing', duration_minutes: 5, description: 'Simple breath awareness to calm your mind and body.' }, { id: 'body_scan', title: 'Body Scan Meditation', duration_minutes: 10, description: 'Gentle attention through your body to release tension.' }, { id: '5_senses', title: '5 Senses Grounding', duration_minutes: 3, description: 'Focus on your senses to anchor yourself in the present.' }, ];
    const handleMoodSelect = async (mood: string) => { setSelectedMood(mood); setError(null); setIsLoading(true); setRecommendations([]); try { const data = await api.getMindspaceRecommendations(mood); setRecommendations(data); } catch (err: any) { setError(err.message || "Failed to load recommendations."); console.error("Mindspace recommendation error:", err); } finally { setIsLoading(false); } };
    const startMeditation = useCallback((practice: Practice) => { setTimer(0); setActivityDetails(practice); setShowActivity(true); setIsTimerRunning(true); if (intervalId) clearInterval(intervalId); const newIntervalId = setInterval(() => { setTimer(prevTimer => prevTimer + 1); }, 1000); setIntervalId(newIntervalId); }, [intervalId]);
    const toggleTimer = () => { if (isTimerRunning) { if (intervalId) clearInterval(intervalId); setIntervalId(null); } else { const newIntervalId = setInterval(() => { setTimer(prevTimer => prevTimer + 1); }, 1000); setIntervalId(newIntervalId); } setIsTimerRunning(!isTimerRunning); };
    const endSession = () => { if (intervalId) clearInterval(intervalId); setIntervalId(null); setShowActivity(false); setIsTimerRunning(false); setTimer(0); setActivityDetails(null); };
    useEffect(() => { return () => { if (intervalId) clearInterval(intervalId); }; }, [intervalId]);
    const formatTime = (totalSeconds: number) => { const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };

    if (showActivity && activityDetails) { return ( <div className="mx-auto" style={{maxWidth: "960px"}}> <h2 className="fs-2 fw-bold text-indigo mb-4">{activityDetails.title}</h2> <div className="bg-white rounded shadow p-4 mb-4 text-center"> <div className="mb-5"><div className="display-4 fw-light mb-2">{formatTime(timer)}</div><div className="fs-4 text-indigo">Breathe deeply and relax</div></div> <div className="position-relative mx-auto mb-5" style={{width: "200px", height: "200px"}}><div className={`position-absolute top-0 start-0 w-100 h-100 rounded-circle border border-4 border-indigo ${isTimerRunning ? 'pulse-animation' : ''}`} aria-hidden="true"></div><div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-indigo"><div className="fs-5">Focus on your breath</div></div></div> <div className="d-flex justify-content-center gap-3"><button onClick={toggleTimer} className="btn btn-indigo px-4 py-2">{isTimerRunning ? 'Pause' : 'Resume'}</button><button onClick={endSession} className="btn btn-outline-indigo px-4 py-2">End Session</button></div> </div> </div> ); }

    return ( <div className="mx-auto" style={{maxWidth: "960px"}}> <h2 className="fs-2 fw-bold text-indigo mb-4">MindSpace</h2><p className="text-secondary mb-4">Your sanctuary for meditation, breathing exercises, and mindfulness practices.</p> {/* Mood Selection / Recommendations Section */} <div className="bg-white rounded shadow p-4 mb-4"> {selectedMood ? ( <> <div className="d-flex justify-content-between align-items-center mb-3"><h3 className="fs-4 fw-semibold mb-0">Recommendations for feeling {selectedMood}</h3><button onClick={() => { setSelectedMood(null); setRecommendations([]); setError(null); }} className="btn btn-link text-secondary p-0">Change mood</button></div> {isLoading && <LoadingSpinner text="Finding recommendations..." />} <ErrorMessage message={error} onRetry={() => handleMoodSelect(selectedMood)} /> {!isLoading && !error && recommendations.length === 0 && (<p className="text-secondary">No recommendations found. Try a featured practice!</p>)} {!isLoading && !error && recommendations.length > 0 && (<div className="d-flex flex-column gap-3">{recommendations.map(practice => (<PracticeCard key={practice.id} practice={practice} onStart={startMeditation} />))}</div>)} </> ) : ( <> <h3 className="fs-4 fw-semibold mb-3">How are you feeling today?</h3><p className="text-secondary mb-3">Select your mood for personalized recommendations:</p><div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">{[{ mood: "anxious", emoji: "😰" }, { mood: "sad", emoji: "😔" }, { mood: "stressed", emoji: "😩" }, { mood: "tired", emoji: "😴" }, { mood: "content", emoji: "😌" }].map(({ mood, emoji }) => (<div key={mood} className="col"><div className="border rounded p-3 text-center hover-border-indigo hover-bg-light cursor-pointer transition h-100 d-flex flex-column justify-content-center" onClick={() => handleMoodSelect(mood)} role="button" tabIndex={0} onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleMoodSelect(mood)} aria-label={`Select mood: ${mood}`}><span className="fs-3 d-block mb-1" aria-hidden="true">{emoji}</span><span className="text-secondary text-capitalize">{mood}</span></div></div>))}</div> </> )} </div> {/* Featured Practices Section */} <div className="bg-white rounded shadow p-4"><h3 className="fs-4 fw-semibold mb-3">Featured Practices</h3><div className="row row-cols-1 row-cols-md-2 g-3">{featuredPractices.map(practice => (<div key={practice.id} className="col d-flex"><PracticeCard practice={practice} onStart={startMeditation} isFeatured={true} /></div>))}</div></div> </div> );
};

// --- Practice Card Component ---
// (Verified - Same implementation as previous working versions)
const PracticeCard: React.FC<PracticeCardProps> = ({ practice, onStart, isFeatured = false }) => (
    <div className={`border rounded p-3 hover-shadow cursor-pointer transition w-100 ${isFeatured ? 'hover-border-success' : 'hover-border-indigo'}`} onClick={() => onStart(practice)} role="button" tabIndex={0} onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onStart(practice)} aria-label={`Start practice: ${practice.title}`}>
        <div className="d-flex justify-content-between align-items-center mb-2"><h4 className="fs-5 fw-medium text-dark mb-0">{practice.title}</h4><span className="text-secondary small">{practice.duration_minutes} min</span></div><p className="text-secondary small mb-0">{practice.description}</p>
    </div>
);

// --- Placeholder Components ---
const ResourcesPage: React.FC<ResourcesPageProps> = () => ( <div className="text-center p-5">Resources Page (Coming Soon)</div> );
const AboutPage: React.FC<AboutPageProps> = () => ( <div className="text-center p-5">About Page (Coming Soon)</div> );

// --- Account Page Component ---
// (Verified - Same implementation as previous working versions)
const AccountPage: React.FC<AccountPageProps> = () => {
    const { user, logout } = useAuth();
    if (!user) return <div className="text-center"><LoadingSpinner text="Loading account..."/></div>;
    return ( <div className="mx-auto" style={{maxWidth: "400px"}}> <h2 className="fs-2 fw-bold text-success mb-4">Your Account</h2> <div className="bg-white rounded shadow overflow-hidden"> <div className="text-center p-4 bg-success-subtle"><div className="d-inline-block p-3 bg-success rounded-circle border border-3 border-light mb-2"><p className="fs-2 fw-bold text-white mb-0">{user.username.charAt(0).toUpperCase()}</p></div><h3 className="fs-4 fw-semibold mt-2">{user.username}</h3></div> <div className="p-4"><div className="border-top pt-3"><h4 className="fs-5 fw-medium text-secondary mb-3">Account Information</h4><p className="small text-secondary mb-1">Member Since</p><p className="fw-medium">{new Date(user.created_at).toLocaleDateString()}</p></div><div className="mt-4"><button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center" onClick={logout}><LogOut size={16} className="me-2"/>Sign Out</button></div></div> </div> </div> );
};

// --- Export the Wrapper ---
export default AppWrapper;