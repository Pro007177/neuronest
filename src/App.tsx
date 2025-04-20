import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Leaf, Moon, BarChart2, BookOpen, User, FileText, Settings,
  Calendar, ChevronDown, AlertCircle, RefreshCw, Droplet // Added icons
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
// Import types and API service
import { Thought, Mood, ThoughtCreatePayload, JournalSummaryData, GrowthInsightsData } from './types';
import * as api from './services/api';

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

// No specific props needed for these pages currently, beyond what App provides implicitly
interface GrowthPageProps { setActivePage: (page: string) => void; }
interface GardenPageProps {}
interface MindspacePageProps {}
interface JournalPageProps {}
interface ResourcesPageProps {}
interface AboutPageProps {}

interface AccountPageProps {
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

interface GrowthInsightsProps {
    insights: GrowthInsightsData | null;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}


// --- Utility Components ---
const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
    <div className="text-center py-4 text-secondary">
        <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">{text}</span>
        </div>
        {text}
    </div>
);

const ErrorMessage: React.FC<{ message: string | null, onRetry?: () => void }> = ({ message, onRetry }) => {
    if (!message) return null;
    return (
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
            <span><AlertCircle size={16} className="me-2" /> {message}</span>
            {onRetry && (
                <button className="btn btn-sm btn-danger" onClick={onRetry}>
                    <RefreshCw size={14} className="me-1" /> Retry
                </button>
            )}
        </div>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
   const [activePage, setActivePage] = useState('home');
   // Keep demo login for now - replace with real auth later
   const [isLoggedIn, setIsLoggedIn] = useState(true);
   const [username, setUsername] = useState('Demo User');
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

   // Function to handle navigation and close mobile menu
   const handleNav = (page: string) => {
       setActivePage(page);
       setMobileMenuOpen(false);
   };

   // Render page content based on active state
   const renderContent = () => {
     switch(activePage) {
       case 'home':
         return <HomePage setActivePage={handleNav} isLoggedIn={isLoggedIn} username={username} />;
       case 'growth':
         return <GrowthPage setActivePage={handleNav} />;
       case 'mindspace':
         return <MindspacePage />;
       case 'garden':
         return <GardenPage />;
       case 'journal':
         return <JournalPage />;
       case 'resources':
         return <ResourcesPage />;
       case 'about':
         return <AboutPage />;
       case 'account':
         return <AccountPage
                   isLoggedIn={isLoggedIn}
                   username={username}
                   onLogout={() => setIsLoggedIn(false)} // Simplified logout for demo
                 />;
       default:
         // Fallback to home page if activePage is unknown
         return <HomePage setActivePage={handleNav} isLoggedIn={isLoggedIn} username={username} />;
     }
   };

   return (
     <div className="d-flex flex-column min-vh-100 bg-light">
        {/* Header */}
        <header className="bg-success text-white p-3 shadow sticky-top">
            <div className="container d-flex justify-content-between align-items-center">
            <h1 className="fs-3 fw-bold cursor-pointer mb-0" onClick={() => handleNav('home')}>
                NeuroNest
            </h1>
            {/* Desktop Nav */}
            <div className="d-none d-md-flex align-items-center">
                <NavButton icon={<Home size={16} />} label="Home" isActive={activePage === 'home'} onClick={() => handleNav('home')} />
                <NavButton icon={<Leaf size={16} />} label="Growth" isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
                <NavButton icon={<Moon size={16} />} label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
                <NavButton icon={<BarChart2 size={16} />} label="Garden" isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
                <NavButton icon={<FileText size={16} />} label="Journal" isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
                <NavButton icon={<BookOpen size={16} />} label="Resources" isActive={activePage === 'resources'} onClick={() => handleNav('resources')} />
                <NavButton icon={<User size={16} />} label="About" isActive={activePage === 'about'} onClick={() => handleNav('about')} />
                <NavButton
                icon={<Settings size={16} />}
                label={isLoggedIn ? username : "Account"}
                isActive={activePage === 'account'}
                onClick={() => handleNav('account')}
                />
            </div>
            {/* Mobile Nav Toggle */}
            <div className="d-md-none">
                {isLoggedIn && <span className="fs-6 me-3">Hi, {username}</span>}
                <button className="btn btn-success" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
            </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            // Ensure dropdown appears below sticky header
            <div className="d-md-none bg-white shadow position-fixed top-0 end-0 mt-5 me-2 w-50 rounded-bottom z-index-1000" style={{ paddingTop: '60px' }}> {/* Adjust based on header height */}
            <div className="d-flex flex-column py-2">
                <MobileMenuLink label="Home" isActive={activePage === 'home'} onClick={() => handleNav('home')} />
                <MobileMenuLink label="Growth" isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
                <MobileMenuLink label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
                <MobileMenuLink label="Garden" isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
                <MobileMenuLink label="Journal" isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
                <MobileMenuLink label="Resources" isActive={activePage === 'resources'} onClick={() => handleNav('resources')} />
                <MobileMenuLink label="About" isActive={activePage === 'about'} onClick={() => handleNav('about')} />
                <MobileMenuLink label="Account" isActive={activePage === 'account'} onClick={() => handleNav('account')} />
            </div>
            </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="d-md-none fixed-bottom w-100 bg-white border-top d-flex justify-content-around p-2 z-index-100">
            <MobileNavButton icon={<Home size={20} />} isActive={activePage === 'home'} onClick={() => handleNav('home')} />
            <MobileNavButton icon={<Leaf size={20} />} isActive={activePage === 'growth'} onClick={() => handleNav('growth')} />
            <MobileNavButton icon={<Moon size={20} />} isActive={activePage === 'mindspace'} onClick={() => handleNav('mindspace')} />
            <MobileNavButton icon={<BarChart2 size={20} />} isActive={activePage === 'garden'} onClick={() => handleNav('garden')} />
            <MobileNavButton icon={<FileText size={20} />} isActive={activePage === 'journal'} onClick={() => handleNav('journal')} />
            <MobileNavButton icon={<Settings size={20} />} isActive={activePage === 'account'} onClick={() => handleNav('account')} />
        </nav>

        {/* Main Content */}
        {/* Adjust paddingBottom to account for the height of the fixed bottom nav */}
        <main className="flex-grow-1 container py-4" style={{ paddingBottom: '80px' }}>
            {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-success text-white p-3 text-center mt-auto">
            <p className="mb-0">© {new Date().getFullYear()} NeuroNest - Your Mental Wellness Companion</p>
        </footer>
     </div>
   );
};

// --- Navigation Components ---
const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    className={`d-flex align-items-center btn ${isActive ? 'btn-light text-success' : 'btn-success text-white'} rounded me-1 px-3 py-1`}
    onClick={onClick}
  >
    <span className="me-1">{icon}</span>
    <span>{label}</span>
  </button>
);

const MobileNavButton: React.FC<MobileNavButtonProps> = ({ icon, isActive, onClick }) => (
  <button
    className={`btn ${isActive ? 'text-success bg-success-subtle' : 'text-secondary'} rounded-circle p-2`}
    onClick={onClick}
    aria-label={`Navigate to ${isActive ? 'current page' : 'page'}`} // Improve accessibility
  >
    {icon}
  </button>
);

const MobileMenuLink: React.FC<MobileMenuLinkProps> = ({ label, isActive, onClick }) => (
  <button
    className={`w-100 text-start px-4 py-2 border-0 ${isActive ? 'bg-success-subtle text-success fw-medium' : 'text-secondary hover-bg-light'}`}
    onClick={onClick}
  >
    {label}
  </button>
);

// --- Feature Card Component ---
const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, description, onClick }) => (
  <div
    className="bg-white rounded shadow p-4 text-center hover-shadow-lg transition cursor-pointer h-100 d-flex flex-column"
    onClick={onClick}
    role="button" // Improve accessibility
    tabIndex={0} // Make it focusable
    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()} // Allow activation with keyboard
  >
    <div className="d-flex justify-content-center mb-3">
      {icon}
    </div>
    <h3 className="fs-5 fw-semibold text-dark mb-2">{title}</h3>
    <p className="text-secondary flex-grow-1">{description}</p>
  </div>
);

// --- Home Page Component ---
const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, username }) => {
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      {isLoggedIn && (
        <div className="alert alert-primary mb-4" role="alert">
          <p className="fw-medium mb-1">Welcome back, {username}!</p>
          <p className="small mb-0">Continue your wellness journey by adding new thoughts or exploring mindfulness practices.</p>
        </div>
      )}

      <div className="bg-white rounded shadow p-4 my-4 text-center">
        <h2 className="fs-2 fw-bold text-success mb-4">Welcome to NeuroNest</h2>
        <div className="mb-4 display-4" aria-hidden="true">🌳</div> {/* Decorative emoji */}
        <p className="text-secondary fs-5 mb-4">
          Your sanctuary for mental wellness and personal growth.
          Nurture your mind like a garden - with patience, care, and consistent attention.
        </p>
        <p className="text-secondary mb-4">
          Plant the seeds of positive change, watch them grow, and cultivate a healthier mindset day by day.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button className="btn btn-success px-4 py-2" onClick={() => setActivePage('growth')}>
            Start Your Journey
          </button>
          <button className="btn btn-outline-success px-4 py-2" onClick={() => setActivePage('about')}>
            Learn More
          </button>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4 my-4">
        <div className="col d-flex"> {/* Added d-flex for consistent card height */}
          <FeatureCard
            title="Plant a Thought"
            icon={<Leaf className="text-success" size={48} />}
            description="Transform your thoughts and goals into growing visualizations."
            onClick={() => setActivePage('growth')}
          />
        </div>
        <div className="col d-flex">
          <FeatureCard
            title="Find Your Peace"
            icon={<Moon className="text-indigo" size={48} />}
            description="Access meditation and breathing exercises tailored to your needs."
            onClick={() => setActivePage('mindspace')}
          />
        </div>
        <div className="col d-flex">
          <FeatureCard
            title="Track Your Growth"
            icon={<BarChart2 className="text-primary" size={48} />}
            description="Visualize your progress and celebrate every milestone."
            onClick={() => setActivePage('garden')}
          />
        </div>
      </div>
    </div>
  );
};

// --- Growth Page Component (Uses API) ---
const GrowthPage: React.FC<GrowthPageProps> = ({ setActivePage }) => {
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newThoughtContent, setNewThoughtContent] = useState('');
    const [newThoughtMood, setNewThoughtMood] = useState<Mood>(Mood.Neutral);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wateringStates, setWateringStates] = useState<{ [key: number]: boolean }>({}); // Track watering loading per plant

    const fetchThoughts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.getThoughts();
            setThoughts(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (err: any) {
            setError(err.message || "Failed to load thoughts.");
            console.error("Fetch thoughts error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThoughts();
    }, [fetchThoughts]);

    const handleCreateThought = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThoughtContent.trim()) {
            alert("Please enter a thought.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const payload: ThoughtCreatePayload = { content: newThoughtContent, mood: newThoughtMood };
            await api.createThought(payload);
            setNewThoughtContent('');
            setNewThoughtMood(Mood.Neutral);
            await fetchThoughts(); // Refresh list
            // Optionally show a success toast instead of alert
            // toast.success("Seed planted successfully!");
            alert("Seed planted successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to plant seed.");
            console.error("Create thought error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWaterPlant = async (thoughtId: number) => {
        setWateringStates(prev => ({ ...prev, [thoughtId]: true })); // Start loading for this plant
        const originalThoughts = [...thoughts];
        // Optimistic UI update
        setThoughts(prevThoughts =>
            prevThoughts.map(t =>
                t.id === thoughtId
                    ? { ...t, growth_stage: Math.min(t.growth_stage + 1, 3), last_watered_at: new Date().toISOString() }
                    : t
            )
        );
        try {
            await api.waterThought(thoughtId);
            // Refresh might not be needed if optimistic update is sufficient
            // await fetchThoughts();
            // toast.success("Plant watered!");
             alert("Plant watered!");
        } catch (err: any) {
            setError(err.message || `Failed to water plant ${thoughtId}.`);
            console.error(`Water plant ${thoughtId} error:`, err);
            setThoughts(originalThoughts); // Revert on error
        } finally {
            setWateringStates(prev => ({ ...prev, [thoughtId]: false })); // Stop loading for this plant
        }
    };

    const getGrowthEmoji = (stage: number) => ['🌱', '🌿', '🌿', '🌸'][stage] || '❓';
    const getGrowthStageName = (stage: number) => ['Seed', 'Sprout', 'Growing', 'Flowering'][stage] || 'Unknown';

    return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
        <h2 className="fs-2 fw-bold text-success mb-4">Growth Space</h2>
        <p className="text-secondary mb-4">
            Plant seeds of thoughts, intentions, or goals. Nurture them by watering daily and watch them grow.
        </p>

        {/* Plant New Seed Form */}
        <div className="bg-white rounded shadow p-4 mb-4">
            <h3 className="fs-4 fw-semibold mb-3">Plant a New Seed</h3>
            <form onSubmit={handleCreateThought}>
                <ErrorMessage message={error && isSubmitting ? error : null} />
                <div className="mb-3">
                    <label className="form-label text-secondary" htmlFor="thoughtContent">
                    What's on your mind today?
                    </label>
                    <textarea
                        id="thoughtContent"
                        className="form-control"
                        placeholder="Share a thought, goal, or feeling..."
                        value={newThoughtContent}
                        onChange={(e) => setNewThoughtContent(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label text-secondary">How are you feeling about this?</label>
                    <div className="d-flex flex-wrap gap-2">
                    {(Object.values(Mood)).map((moodValue) => (
                        <button
                            key={moodValue}
                            type="button"
                            onClick={() => setNewThoughtMood(moodValue)}
                            className={`btn btn-sm ${newThoughtMood === moodValue
                                ? moodValue === Mood.Positive ? 'btn-success' : moodValue === Mood.Neutral ? 'btn-primary' : 'btn-warning'
                                : 'btn-outline-secondary'}`}
                            disabled={isSubmitting}
                            aria-pressed={newThoughtMood === moodValue}
                        >
                            {moodValue.charAt(0).toUpperCase() + moodValue.slice(1)}
                        </button>
                    ))}
                    </div>
                </div>
                <button type="submit" className="btn btn-success px-4 py-2" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Planting...</>
                    ) : (
                        <><Leaf size={16} className="me-1" /> Plant Seed</>
                    )}
                </button>
            </form>
        </div>

        {/* Your Growing Seeds */}
        <div className="bg-white rounded shadow p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-4 fw-semibold mb-0">Your Growing Seeds</h3>
                <button className="btn btn-sm btn-outline-secondary" onClick={fetchThoughts} disabled={isLoading} aria-label="Refresh thoughts list">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/>
                </button>
            </div>
            {isLoading && <LoadingSpinner text="Loading your seeds..."/>}
            <ErrorMessage message={error && !isSubmitting ? error : null} onRetry={fetchThoughts}/>
            {!isLoading && !error && thoughts.length === 0 && (
                <div className="text-center py-4 text-secondary">
                    <Leaf size={48} className="mx-auto mb-3 opacity-50" />
                    <p>You haven't planted any seeds yet. Share your first thought above!</p>
                </div>
            )}
            {!isLoading && thoughts.length > 0 && (
            <div className="d-flex flex-column gap-3">
                {thoughts.map(thought => (
                <div key={thought.id} className="border rounded p-3 hover-border-success transition">
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2"> {/* Added gap */}
                        <span className="fs-3" title={`Growth Stage: ${getGrowthStageName(thought.growth_stage)}`}>
                            {getGrowthEmoji(thought.growth_stage)}
                        </span>
                        <span className={`badge ms-2 ${
                            thought.mood === Mood.Positive ? 'text-bg-success' :
                            thought.mood === Mood.Neutral ? 'text-bg-primary' :
                            thought.mood === Mood.Negative ? 'text-bg-warning' : 'text-bg-secondary'
                            }`}>
                            {thought.mood}
                        </span>
                        <span className="text-secondary small text-nowrap ms-auto"> {/* Added text-nowrap */}
                            {new Date(thought.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-dark mb-3">{thought.content}</p>
                    <div className="mt-3 d-flex justify-content-between align-items-center small text-secondary">
                    <span>
                        Last watered: {new Date(thought.last_watered_at).toLocaleDateString()}
                    </span>
                    <button
                        className="btn btn-sm btn-outline-success d-flex align-items-center"
                        onClick={() => handleWaterPlant(thought.id)}
                        disabled={thought.growth_stage === 3 || wateringStates[thought.id]} // Disable if fully grown or currently watering
                        title={thought.growth_stage === 3 ? "Fully Grown" : "Water Plant"}
                    >
                        {wateringStates[thought.id] ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <><Droplet size={14} className="me-1"/> {thought.growth_stage < 3 ? 'Water' : 'Grown'}</>
                        )}
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
    </div>
    );
};

// --- Garden Page Component (Uses API) ---
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
        setIsLoadingThoughts(true);
        setThoughtsError(null);
        try {
            const data = await api.getThoughts();
            setThoughts(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (err: any) {
            setThoughtsError(err.message || "Failed to load garden.");
            console.error("Fetch thoughts for garden error:", err);
        } finally {
            setIsLoadingThoughts(false);
        }
    }, []);

    const fetchInsights = useCallback(async () => {
        setIsLoadingInsights(true);
        setInsightsError(null);
        try {
            const data = await api.getGrowthInsights();
            setInsights(data);
        } catch (err: any) {
            setInsightsError(err.message || "Failed to load insights.");
            console.error("Fetch insights error:", err);
        } finally {
            setIsLoadingInsights(false);
        }
    }, []);

    useEffect(() => {
        if (viewMode === 'garden') {
            fetchThoughts();
        } else if (viewMode === 'insights') {
            fetchInsights();
        }
    }, [viewMode, fetchThoughts, fetchInsights]);

    const handleWaterPlant = async (thoughtId: number) => {
        setWateringStates(prev => ({ ...prev, [thoughtId]: true }));
        const originalThoughts = [...thoughts];
        const originalSelected = selectedThought ? {...selectedThought} : null;

        const updateState = (thought: Thought | null) => {
             if (!thought) return null;
             return {
                 ...thought,
                 growth_stage: Math.min(thought.growth_stage + 1, 3),
                 last_watered_at: new Date().toISOString()
             };
        };

        setThoughts(prevThoughts => prevThoughts.map(t => t.id === thoughtId ? updateState(t)! : t));
        if (selectedThought?.id === thoughtId) {
            setSelectedThought(updateState(selectedThought));
        }

        try {
            await api.waterThought(thoughtId);
            // alert("Plant watered!"); // Consider using toasts
        } catch (err: any) {
            setThoughtsError(err.message || `Failed to water plant ${thoughtId}.`);
            console.error(`Water plant ${thoughtId} error:`, err);
            setThoughts(originalThoughts);
            if (selectedThought?.id === thoughtId) {
                setSelectedThought(originalSelected);
            }
        } finally {
             setWateringStates(prev => ({ ...prev, [thoughtId]: false }));
        }
    };

    const handlePlantClick = (thought: Thought) => setSelectedThought(thought);
    const closeThoughtDetail = () => setSelectedThought(null);
    const getGrowthEmoji = (stage: number) => ['🌱', '🌿', '🌿', '🌸'][stage] || '❓';
    const getGrowthStageName = (stage: number) => ['Seed', 'Sprout', 'Growing', 'Flowering'][stage] || 'Unknown';

    return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
        <h2 className="fs-2 fw-bold text-primary mb-4">Progress Garden</h2>
        <p className="text-secondary mb-4">
            Visualize your growth journey. Each plant represents a nurtured thought. Explore insights into your progress.
        </p>

        {/* View Mode Toggle */}
        <div className="bg-white rounded shadow p-3 mb-4 d-flex">
            <button
                className={`btn flex-grow-1 ${viewMode === 'garden' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`}
                onClick={() => {setViewMode('garden'); setSelectedThought(null);}}
                aria-pressed={viewMode === 'garden'}
            >
                <BarChart2 size={16} className="me-1"/> Garden View
            </button>
            <button
                className={`btn flex-grow-1 ${viewMode === 'insights' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`}
                onClick={() => {setViewMode('insights'); setSelectedThought(null);}}
                 aria-pressed={viewMode === 'insights'}
            >
                <RefreshCw size={16} className="me-1"/> Growth Insights
            </button>
        </div>

        {/* Selected Thought Detail View */}
        {selectedThought && viewMode === 'garden' && (
            <div className="bg-white rounded shadow p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="fs-4 fw-semibold">Thought Detail</h3>
                    <button className="btn btn-close" onClick={closeThoughtDetail} aria-label="Close thought detail"></button>
                </div>
                <div className="d-flex align-items-center justify-content-center mb-3">
                    <div className="display-3">{getGrowthEmoji(selectedThought.growth_stage)}</div>
                </div>
                <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary small">
                            Planted: {new Date(selectedThought.created_at).toLocaleDateString()}
                        </span>
                        <span className={`small badge ${
                            selectedThought.mood === Mood.Positive ? 'text-bg-success' :
                            selectedThought.mood === Mood.Negative ? 'text-bg-warning' : 'text-bg-primary'
                        }`}>
                            {selectedThought.mood}
                        </span>
                    </div>
                    <div className="p-3 bg-light rounded mb-3">
                        <p className="text-dark mb-0">{selectedThought.content}</p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-medium text-secondary">
                            Stage: {getGrowthStageName(selectedThought.growth_stage)}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center"
                            onClick={() => handleWaterPlant(selectedThought.id)}
                            disabled={selectedThought.growth_stage === 3 || wateringStates[selectedThought.id]}
                            title={selectedThought.growth_stage === 3 ? "Fully Grown" : "Water Plant"}
                        >
                           {wateringStates[selectedThought.id] ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <><Droplet size={14} className="me-1"/> {selectedThought.growth_stage < 3 ? 'Water' : 'Grown'}</>
                            )}
                        </button>
                    </div>
                    <div className="text-secondary small mt-1">
                        Last watered: {new Date(selectedThought.last_watered_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        )}

        {/* Garden View */}
        {viewMode === 'garden' && !selectedThought && (
            <div className="bg-white rounded shadow p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fs-4 fw-semibold mb-0">Your Garden</h3>
                    <button className="btn btn-sm btn-outline-secondary" onClick={fetchThoughts} disabled={isLoadingThoughts} aria-label="Refresh garden view">
                        <RefreshCw size={14} className={isLoadingThoughts ? 'animate-spin' : ''}/>
                    </button>
                </div>
                {isLoadingThoughts && <LoadingSpinner text="Loading your garden..."/>}
                <ErrorMessage message={thoughtsError} onRetry={fetchThoughts}/>
                {!isLoadingThoughts && !thoughtsError && thoughts.length === 0 && (
                    <div className="text-center py-4 text-secondary">
                        <BarChart2 size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Your garden is empty. Plant some thoughts in the Growth Space first!</p>
                    </div>
                )}
                {!isLoadingThoughts && thoughts.length > 0 && (
                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
                        {thoughts.map(thought => (
                            <div key={thought.id} className="col">
                                <div
                                    className="border rounded p-3 text-center hover-border-primary hover-shadow cursor-pointer transition d-flex flex-column h-100"
                                    onClick={() => handlePlantClick(thought)}
                                    title={thought.content}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handlePlantClick(thought)}
                                >
                                    <div className="fs-2 mb-2">{getGrowthEmoji(thought.growth_stage)}</div>
                                    <div className="text-truncate small fw-medium text-dark mb-1 flex-grow-1">
                                        {thought.content}
                                    </div>
                                    <div className="small text-secondary mt-auto">
                                        {new Date(thought.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Insights View */}
        {viewMode === 'insights' && (
             <GrowthInsightsView
                insights={insights}
                isLoading={isLoadingInsights}
                error={insightsError}
                onRefresh={fetchInsights}
             />
        )}
    </div>
    );
};

// --- Growth Insights Component (Displays calculated insights) ---
const GrowthInsightsView: React.FC<GrowthInsightsProps> = ({ insights, isLoading, error, onRefresh }) => {

    const renderMoodDistribution = () => {
        if (!insights || !insights.mood_distribution || Object.keys(insights.mood_distribution).length === 0) {
            return <p className="text-secondary small">No mood data available for this period.</p>;
        }

        const total = Object.values(insights.mood_distribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return <p className="text-secondary small">No moods recorded.</p>;

        const moodColors: { [key in Mood]?: string } = {
            [Mood.Positive]: 'bg-success',
            [Mood.Neutral]: 'bg-primary',
            [Mood.Negative]: 'bg-warning',
        };

        return (
            <>
                <div className="progress" role="progressbar" aria-label="Mood distribution" style={{ height: "24px" }}>
                    {Object.entries(insights.mood_distribution).map(([mood, count]) => {
                        const percentage = ((count / total) * 100);
                        const moodKey = mood as Mood;
                        return (
                            <div
                                key={mood}
                                className={`progress-bar ${moodColors[moodKey] || 'bg-secondary'}`}
                                style={{ width: `${percentage}%` }}
                                title={`${mood.charAt(0).toUpperCase() + mood.slice(1)}: ${count} (${percentage.toFixed(1)}%)`}
                            >
                                {/* Conditionally show text inside bar */}
                                {percentage > 15 ? `${mood.charAt(0).toUpperCase() + mood.slice(1)}` : ''}
                            </div>
                        );
                    })}
                </div>
                 <div className="d-flex justify-content-between flex-wrap small text-secondary mt-1">
                    {Object.entries(insights.mood_distribution).map(([mood, count]) => (
                         <span key={mood}>{`${mood.charAt(0).toUpperCase() + mood.slice(1)} (${count})`}</span>
                    ))}
                </div>
            </>
        );
    };


    return (
        <div className="bg-white rounded shadow p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-4 fw-semibold mb-0">Growth Insights (Last 30 Days)</h3>
                <button className="btn btn-sm btn-outline-secondary" onClick={onRefresh} disabled={isLoading} aria-label="Refresh insights">
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/>
                </button>
            </div>

            {isLoading && <LoadingSpinner text="Calculating insights..."/>}
            <ErrorMessage message={error} onRetry={onRefresh}/>

            {!isLoading && !error && !insights && (
                 <p className="text-secondary">No insights could be generated. Try planting some thoughts!</p>
            )}

            {!isLoading && !error && insights && (
                <>
                    <div className="mb-4 p-3 border rounded bg-light">
                         <h4 className="fs-6 fw-medium text-secondary mb-2">Overall Activity</h4>
                         <p className="mb-1"><strong>Total Thoughts Planted:</strong> {insights.total_thoughts}</p>
                         <p className="mb-0"><strong>Recent Trend:</strong> <span className="text-capitalize">{insights.recent_growth_trend}</span></p>
                    </div>

                    <div className="mb-4">
                        <h4 className="fs-6 fw-medium text-secondary mb-3">Mood Distribution</h4>
                        {renderMoodDistribution()}
                    </div>

                    <div className="alert alert-info small" role="alert">
                        These insights are based on your entries from the last 30 days. Keep journaling to see how your garden grows! AI-powered text summaries coming soon.
                    </div>
                </>
            )}
        </div>
    );
};

// --- Journal Page Component (Uses API) ---
const JournalPage: React.FC<JournalPageProps> = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<JournalSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    // Don't clear previous summary immediately, only on success or explicit back
    // setSummaryData(null);
    // setShowSummary(false);

    try {
      const data = await api.getJournalSummary();
      setSummaryData(data);
      setShowSummary(true); // Show the view only after successful fetch
    } catch (err: any) {
      console.error("Error generating summary:", err);
      setError(err.message || "An unknown error occurred while generating the summary.");
      setShowSummary(false); // Ensure summary view is hidden on error
    } finally {
      setIsGenerating(false);
    }
  };

  // Render the summary view
  const renderSummaryView = () => {
      if (!summaryData) return null;

      return (
        <div className="mx-auto" style={{maxWidth: "960px"}}>
            {/* Keep H2 outside the conditional rendering */}
            {/* <h2 className="fs-2 fw-bold text-purple mb-4">Wellness Journal</h2> */}
            <div className="bg-white rounded shadow p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fs-4 fw-semibold">Weekly Summary (AI Generated)</h3>
                <button
                className="btn btn-link text-secondary"
                onClick={() => { setShowSummary(false); setSummaryData(null); setError(null); }}
                >
                Back to Journal
                </button>
            </div>

            {/* Display error if generation failed but we are in summary view */}
            <ErrorMessage message={error} />

            <div className="mb-4">
                <h4 className="fs-5 fw-medium text-dark mb-2">Summary</h4>
                <p className="text-secondary">{summaryData.summary}</p>
            </div>
            <div className="alert alert-purple mb-4" role="alert">
                <h4 className="fs-6 fw-medium mb-1">Pattern Insight</h4>
                <p className="mb-0">{summaryData.insight}</p>
            </div>
            <div className="mb-4">
                <h4 className="fs-5 fw-medium text-dark mb-2">Recommendation</h4>
                <p className="text-secondary">{summaryData.recommendation}</p>
            </div>
            <div>
                <h4 className="fs-5 fw-medium text-dark mb-3">Highlights Mentioned</h4>
                {summaryData.highlights && summaryData.highlights.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                    {summaryData.highlights.map((highlight, index) => (
                    <div key={index} className="border rounded p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="small text-secondary">{highlight.date}</span>
                        </div>
                        <p className="text-dark mb-2 fst-italic">"{highlight.entry}"</p>
                        <div className="small text-secondary border-start border-3 border-purple ps-3">
                        {highlight.comment}
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-secondary">No specific highlights identified by the AI for this period.</p>
                )}
            </div>
            </div>
        </div>
      );
  };

  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-purple mb-4">Wellness Journal</h2>

      {/* Show summary view if generated */}
      {showSummary ? renderSummaryView() : (
          <>
            <p className="text-secondary mb-4">
                Generate an AI-powered summary of your thoughts from the past week to track patterns and gain insights.
            </p>

            {/* Display Error if generation failed */}
            <ErrorMessage message={error && !isGenerating ? error : null} onRetry={generateSummary}/>

            {/* Generation Button Area */}
            <div className="bg-white rounded shadow p-4 mb-4 text-center">
                <h3 className="fs-4 fw-semibold mb-3">Generate Weekly Summary</h3>
                <p className="text-secondary mb-3">
                    Uses your journal entries from the last 7 days.
                </p>
                <button
                    className="btn btn-purple px-4 py-2 d-inline-flex align-items-center mx-auto"
                    onClick={generateSummary}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        Generating Summary...
                        </>
                    ) : (
                        <>
                        <FileText size={16} className="me-2" />
                        Generate Weekly Summary
                        </>
                    )}
                </button>
                {isGenerating && <LoadingSpinner text="Generating your summary..."/>}
            </div>

            {/* Previous Summaries section (placeholder) */}
            <div className="bg-white rounded shadow p-4">
                <h3 className="fs-4 fw-semibold mb-3">Previous Summaries</h3>
                <p className="text-secondary">Functionality to view past summaries coming soon!</p>
                <div className="border rounded overflow-hidden opacity-50">
                <div className="p-3 bg-light d-flex justify-content-between align-items-center">
                    <div>
                    <div className="fw-medium text-dark d-flex align-items-center">
                        <Calendar size={16} className="me-2 text-purple" />
                        Apr 5 - Apr 12, 2025 (Example)
                    </div>
                    <div className="small text-secondary mt-1">
                        Summary data would appear here...
                    </div>
                    </div>
                    <div><ChevronDown size={20} className="text-secondary" /></div>
                </div>
                </div>
            </div>
          </>
      )}
    </div>
  );
};


// --- Placeholder Components (Implement later) ---
const MindspacePage: React.FC<MindspacePageProps> = () => {
    // TODO: Implement Mindspace features (meditation, breathing)
    return (
        <div className="mx-auto" style={{maxWidth: "960px"}}>
             <h2 className="fs-2 fw-bold text-indigo mb-4">MindSpace</h2>
             <p className="text-secondary mb-4">
                Your sanctuary for meditation, breathing exercises, and mindfulness practices. (Coming Soon)
            </p>
             <div className="bg-white rounded shadow p-4 text-center">
                <Moon size={48} className="mx-auto mb-3 text-indigo opacity-50" />
                <p>Meditation and breathing exercises will be available here.</p>
            </div>
        </div>
    );
};

const ResourcesPage: React.FC<ResourcesPageProps> = () => {
     // TODO: Implement Resources page content
    return (
         <div className="mx-auto" style={{maxWidth: "960px"}}>
             <h2 className="fs-2 fw-bold text-success mb-4">Resources</h2>
             <p className="text-secondary mb-4">
                Helpful articles, tools, and support information for your mental wellness journey. (Coming Soon)
            </p>
             <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                <AlertCircle className="me-2 flex-shrink-0" size={24}/>
                <div>
                <h3 className="fs-6 fw-medium text-warning-emphasis mb-1">
                    In a crisis? Get immediate help
                </h3>
                <div className="small text-warning-emphasis">
                    If you're experiencing a mental health emergency, please contact your local crisis line immediately. USA: Call or text 988. Crisis Text Line (USA): Text HOME to 741741.
                </div>
                </div>
            </div>
             <div className="bg-white rounded shadow p-4 text-center">
                 <BookOpen size={48} className="mx-auto mb-3 text-success opacity-50" />
                <p>Helpful articles and links will be curated here.</p>
            </div>
        </div>
    );
};

const AboutPage: React.FC<AboutPageProps> = () => {
    // TODO: Implement About page content and contact form logic
    return (
         <div className="mx-auto" style={{maxWidth: "960px"}}>
             <h2 className="fs-2 fw-bold text-success mb-4">About NeuroNest</h2>
             <div className="bg-white rounded shadow p-4 mb-4">
                <h3 className="fs-4 fw-semibold mb-3">Our Mission</h3>
                <p className="text-secondary">
                To provide a digital sanctuary where people can nurture their mental wellbeing through mindfulness, reflection, and growth tracking. We believe small, consistent steps lead to powerful transformations.
                </p>
            </div>
             <div className="bg-white rounded shadow p-4 text-center">
                 <User size={48} className="mx-auto mb-3 text-success opacity-50" />
                <p>More information about the app and a contact form will be here.</p>
            </div>
        </div>
    );
};

const AccountPage: React.FC<AccountPageProps> = ({ isLoggedIn, username, onLogout }) => {
    // TODO: Implement real account details and actions
     if (!isLoggedIn) {
        return (
            <div className="mx-auto text-center" style={{maxWidth: "400px"}}>
                 <h2 className="fs-2 fw-bold text-success mb-4">Account</h2>
                 <p>Please log in to view your account details.</p>
                 {/* Add Login component/button here later */}
            </div>
        );
     }

    return (
        <div className="mx-auto" style={{maxWidth: "400px"}}>
          <h2 className="fs-2 fw-bold text-success mb-4">Your Account</h2>
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="text-center p-4 bg-success-subtle">
              <div className="d-inline-block p-3 bg-success rounded-circle border border-3 border-light mb-2">
                <p className="fs-2 fw-bold text-white mb-0">{username.charAt(0).toUpperCase()}</p>
              </div>
              <h3 className="fs-4 fw-semibold mt-2">{username}</h3>
              <p className="text-secondary small">demo@neuronest.com (Placeholder)</p>
            </div>
            <div className="p-4">
              <div className="border-top pt-3">
                <h4 className="fs-5 fw-medium text-secondary mb-3">Account Information</h4>
                <div className="row">
                  <div className="col-6"><p className="small text-secondary mb-1">Account Type</p><p className="fw-medium">Free Plan</p></div>
                  <div className="col-6"><p className="small text-secondary mb-1">Member Since</p><p className="fw-medium">April 2025</p></div>
                </div>
              </div>
              <div className="mt-4">
                <button className="btn btn-outline-danger w-100" onClick={onLogout}>Sign Out</button>
              </div>
            </div>
          </div>
        </div>
    );
};


export default App;