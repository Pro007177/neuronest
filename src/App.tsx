import React, { useState, useEffect } from 'react';
import { 
  Home, Leaf, Moon, BarChart2, BookOpen, User, FileText, Settings,
  Calendar, ChevronDown, AlertCircle
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // You'll need to create this file for custom styles

// Define interfaces for component props
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

interface GrowthPageProps {
  isLoggedIn?: boolean;
  setActivePage: (page: string) => void;
}

interface AccountPageProps {
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

interface MindspacePageProps {}
interface GardenPageProps {}
interface JournalPageProps {}
interface ResourcesPageProps {}
interface AboutPageProps {}

// Main App Component
const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');
  // For hackathon: auto-logged in as "Demo User"
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [username, setUsername] = useState('Demo User');
  
  // Function to handle mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Render page content based on active state
  const renderContent = () => {
    switch(activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} username={username} />;
      case 'growth':
        return <GrowthPage isLoggedIn={isLoggedIn} setActivePage={setActivePage} />;
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
                  onLogout={() => {
                    // Just for demo - toggle login state
                    setIsLoggedIn(!isLoggedIn);
                  }}
                />;
      default:
        return <HomePage setActivePage={setActivePage} isLoggedIn={false} username="" />;
    }
  };
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-success text-white p-3 shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 
            className="fs-3 fw-bold cursor-pointer" 
            onClick={() => setActivePage('home')}
          >
            NeuroNest
          </h1>
          <div className="d-none d-md-flex">
            <NavButton icon={<Home size={16} />} label="Home" isActive={activePage === 'home'} onClick={() => setActivePage('home')} />
            <NavButton icon={<Leaf size={16} />} label="Growth" isActive={activePage === 'growth'} onClick={() => setActivePage('growth')} />
            <NavButton icon={<Moon size={16} />} label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => setActivePage('mindspace')} />
            <NavButton icon={<BarChart2 size={16} />} label="Garden" isActive={activePage === 'garden'} onClick={() => setActivePage('garden')} />
            <NavButton icon={<FileText size={16} />} label="Journal" isActive={activePage === 'journal'} onClick={() => setActivePage('journal')} />
            <NavButton icon={<BookOpen size={16} />} label="Resources" isActive={activePage === 'resources'} onClick={() => setActivePage('resources')} />
            <NavButton icon={<User size={16} />} label="About" isActive={activePage === 'about'} onClick={() => setActivePage('about')} />
            <NavButton 
              icon={<Settings size={16} />} 
              label={isLoggedIn ? username : "Account"} 
              isActive={activePage === 'account'} 
              onClick={() => setActivePage('account')} 
            />
          </div>
          <div className="d-md-none">
            {isLoggedIn ? (
              <span className="fs-6 me-3">Hi, {username}</span>
            ) : null}
            <button className="btn btn-success" onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="d-md-none bg-white shadow position-absolute top-0 end-0 mt-5 w-50 rounded-bottom z-index-1000">
          <div className="d-flex flex-column py-2">
            <MobileMenuLink label="Home" isActive={activePage === 'home'} onClick={() => {setActivePage('home'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="Growth" isActive={activePage === 'growth'} onClick={() => {setActivePage('growth'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="MindSpace" isActive={activePage === 'mindspace'} onClick={() => {setActivePage('mindspace'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="Garden" isActive={activePage === 'garden'} onClick={() => {setActivePage('garden'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="Journal" isActive={activePage === 'journal'} onClick={() => {setActivePage('journal'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="Resources" isActive={activePage === 'resources'} onClick={() => {setActivePage('resources'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="About" isActive={activePage === 'about'} onClick={() => {setActivePage('about'); setMobileMenuOpen(false);}} />
            <MobileMenuLink label="Account" isActive={activePage === 'account'} onClick={() => {setActivePage('account'); setMobileMenuOpen(false);}} />
          </div>
        </div>
      )}
      
      {/* Mobile Navigation */}
      <div className="d-md-none fixed-bottom w-100 bg-white border-top d-flex justify-content-around p-2 z-index-100">
        <MobileNavButton icon={<Home size={20} />} isActive={activePage === 'home'} onClick={() => setActivePage('home')} />
        <MobileNavButton icon={<Leaf size={20} />} isActive={activePage === 'growth'} onClick={() => setActivePage('growth')} />
        <MobileNavButton icon={<Moon size={20} />} isActive={activePage === 'mindspace'} onClick={() => setActivePage('mindspace')} />
        <MobileNavButton icon={<BarChart2 size={20} />} isActive={activePage === 'garden'} onClick={() => setActivePage('garden')} />
        <MobileNavButton icon={<FileText size={20} />} isActive={activePage === 'journal'} onClick={() => setActivePage('journal')} />
        <MobileNavButton icon={<Settings size={20} />} isActive={activePage === 'account'} onClick={() => setActivePage('account')} />
      </div>
      
      {/* Main Content */}
      <main className="flex-grow-1 container py-4 pb-5 pb-md-4">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-success text-white p-3 text-center text-white">
        <p className="mb-0">© {new Date().getFullYear()} NeuroNest - Your Mental Wellness Companion</p>
      </footer>
    </div>
  );
};

// Mobile Menu Link Component
const MobileMenuLink: React.FC<MobileMenuLinkProps> = ({ label, isActive, onClick }) => (
  <button 
    className={`w-100 text-start px-4 py-2 border-0 ${isActive ? 'bg-success-subtle text-success' : 'text-secondary hover-bg-light'}`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Navigation Components
const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button 
    className={`d-flex align-items-center btn ${isActive ? 'btn-success' : 'btn-success text-white'} rounded me-1 px-3 py-1`}
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
  >
    {icon}
  </button>
);

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, description, onClick }) => (
  <div 
    className="bg-white rounded shadow p-4 text-center hover-shadow-lg transition cursor-pointer"
    onClick={onClick}
  >
    <div className="d-flex justify-content-center mb-3">
      {icon}
    </div>
    <h3 className="fs-5 fw-semibold text-dark mb-2">{title}</h3>
    <p className="text-secondary">{description}</p>
  </div>
);

// Home Page Component
const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, username }) => {
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      {isLoggedIn && (
        <div className="alert alert-primary mb-4">
          <p className="fw-medium mb-1">Welcome back, {username}!</p>
          <p className="small mb-0">Continue your wellness journey by adding new thoughts or exploring mindfulness practices.</p>
        </div>
      )}
      
      <div className="bg-white rounded shadow p-4 my-4 text-center">
        <h2 className="fs-2 fw-bold text-success mb-4">Welcome to NeuroNest</h2>
        
        {/* Tree emoji instead of images */}
        <div className="mb-4 display-4">
          🌳
        </div>
        
        <p className="text-secondary fs-5 mb-4">
          Your sanctuary for mental wellness and personal growth. 
          At NeuroNest, we believe in nurturing your mind like a garden - 
          with patience, care, and consistent attention.
        </p>
        <p className="text-secondary mb-4">
          Plant the seeds of positive change, watch them grow, and cultivate a healthier mindset day by day.
        </p>
        
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button 
            className="btn btn-success px-4 py-2"
            onClick={() => setActivePage('growth')}
          >
            Start Your Journey
          </button>
          <button 
            className="btn btn-outline-success px-4 py-2"
            onClick={() => setActivePage('about')}
          >
            Learn More
          </button>
        </div>
      </div>
      
      <div className="row row-cols-1 row-cols-md-3 g-4 my-4">
        <div className="col">
          <FeatureCard 
            title="Plant a Thought" 
            icon={<Leaf className="text-success" size={48} />}
            description="Transform your thoughts and goals into growing visualizations."
            onClick={() => setActivePage('growth')}
          />
        </div>
        <div className="col">
          <FeatureCard 
            title="Find Your Peace" 
            icon={<Moon className="text-indigo" size={48} />}
            description="Access meditation and breathing exercises tailored to your needs."
            onClick={() => setActivePage('mindspace')}
          />
        </div>
        <div className="col">
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

// Growth Page Component - Now always accessible since user is auto-logged in
const GrowthPage: React.FC<GrowthPageProps> = ({ isLoggedIn, setActivePage }) => {
  const [thoughts, setThoughts] = useState([
    // Example thought for demo
    {
      id: 1,
      content: "I'm feeling hopeful about my presentation tomorrow. A bit nervous but excited!",
      date: new Date().toISOString(),
      mood: 'positive',
      growthStage: 1,
      lastWatered: new Date().toISOString(),
      reflections: [
        {
          content: "It's natural to feel nervous before a presentation. Focus on your preparation and remember to breathe deeply.",
          date: new Date().toISOString()
        }
      ]
    }
  ]);
  const [newThought, setNewThought] = useState('');
  const [mood, setMood] = useState('neutral');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newThought.trim()) {
      alert("Please enter a thought before planting a seed.");
      return;
    }
    
    // Create new thought
    const thought = {
      id: Date.now(),
      content: newThought,
      date: new Date().toISOString(),
      mood: mood,
      growthStage: 0,
      lastWatered: new Date().toISOString(),
      reflections: []
    };
    
    // Add to thoughts array (insert at beginning)
    setThoughts([thought, ...thoughts]);
    
    // Reset form and show confirmation
    setNewThought('');
    alert("Seed planted successfully!");
  };
  
  // Function to water a plant (increase growth stage)
  const waterPlant = (thoughtId: number) => {
    setThoughts(thoughts.map(thought => 
      thought.id === thoughtId 
        ? {
            ...thought,
            growthStage: Math.min(thought.growthStage + 1, 3),
            lastWatered: new Date().toISOString()
          }
        : thought
    ));
    alert("Plant watered! It has grown a bit.");
  };
  
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-success mb-4">Growth Space</h2>
      <p className="text-secondary mb-4">
        Plant seeds of thoughts, intentions, or goals and nurture them daily. 
        Watch as they grow into flourishing plants, representing your journey of personal growth.
      </p>
      
      <div className="bg-white rounded shadow p-4 mb-4">
        <h3 className="fs-4 fw-semibold mb-3">Plant a New Seed</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary" htmlFor="thought">
              What's on your mind today? Share a thought, goal, or intention:
            </label>
            <textarea 
              id="thought"
              className="form-control"
              placeholder="I'm feeling..."
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label text-secondary">
              How are you feeling about this?
            </label>
            <div className="d-flex flex-wrap gap-2">
              <button 
                type="button" 
                onClick={() => setMood('positive')}
                className={`btn ${mood === 'positive' ? 'btn-success-subtle text-success border border-success' : 'btn-light text-secondary border'}`}
              >
                Positive
              </button>
              <button 
                type="button" 
                onClick={() => setMood('neutral')}
                className={`btn ${mood === 'neutral' ? 'btn-primary-subtle text-primary border border-primary' : 'btn-light text-secondary border'}`}
              >
                Neutral
              </button>
              <button 
                type="button" 
                onClick={() => setMood('negative')}
                className={`btn ${mood === 'negative' ? 'btn-warning-subtle text-warning border border-warning' : 'btn-light text-secondary border'}`}
              >
                Challenging
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-success px-4 py-2"
          >
            Plant Seed
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded shadow p-4">
        <h3 className="fs-4 fw-semibold mb-3">Your Growing Seeds</h3>
        {thoughts.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            <Leaf size={48} className="mx-auto mb-3 opacity-50" />
            <p>You haven't planted any seeds yet. Share your first thought above!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {thoughts.map(thought => (
              <div key={thought.id} className="border rounded p-3 hover-border-success transition">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="fs-3">{['🌱', '🌿', '🌿', '🌸'][thought.growthStage]}</span>
                  <span className="text-secondary small">
                    {new Date(thought.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-dark mb-3">{thought.content}</p>
                {thought.reflections && thought.reflections.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <p className="small text-secondary fst-italic">
                      <strong>Reflection:</strong> {thought.reflections[0].content}
                    </p>
                  </div>
                )}
                <div className="mt-3 d-flex justify-content-between align-items-center small">
                  <span className="text-secondary">
                    Growth stage: {['Seed', 'Sprout', 'Growing', 'Flowering'][thought.growthStage]}
                  </span>
                  <button 
                    className="btn btn-link text-success p-0"
                    onClick={() => waterPlant(thought.id)}
                    disabled={thought.growthStage === 3}
                  >
                    {thought.growthStage < 3 ? 'Water Plant' : 'Fully Grown'}
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

// Garden Page Component
const GardenPage: React.FC<GardenPageProps> = () => {
  // Demo thoughts for the garden
  const [thoughts, setThoughts] = useState([
    {
      id: 1,
      content: "I'm feeling hopeful about my presentation tomorrow. A bit nervous but excited!",
      date: new Date().toISOString(),
      mood: 'positive',
      growthStage: 1
    },
    {
      id: 2,
      content: "Taking time for myself today to recharge.",
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      mood: 'neutral',
      growthStage: 2
    },
    {
      id: 3,
      content: "Successfully completed my project ahead of schedule!",
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      mood: 'positive',
      growthStage: 3
    },
    {
      id: 4,
      content: "Feeling a bit overwhelmed with all the tasks for this week.",
      date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      mood: 'negative',
      growthStage: 0
    }
  ]);
  
  const [selectedThought, setSelectedThought] = useState<any>(null);
  const [viewMode, setViewMode] = useState('garden'); // 'garden' or 'insights'
  
  // Function to handle clicking on a plant in the garden
  const handlePlantClick = (thought: any) => {
    setSelectedThought(thought);
  };
  
  // Function to close thought detail view
  const closeThoughtDetail = () => {
    setSelectedThought(null);
  };
  
  // Function to water a plant (increase growth stage)
  const waterPlant = (thoughtId: number) => {
    // In a real app, this would update the database
    alert("Plant watered! It has grown a bit.");
  };
  
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-primary mb-4">Progress Garden</h2>
      <p className="text-secondary mb-4">
        Visualize your growth journey through your personal garden of progress.
        Each plant represents a seed of thought or intention you've been nurturing.
      </p>
      
      <div className="bg-white rounded shadow p-3 mb-4 d-flex">
        <button 
          className={`btn flex-grow-1 ${viewMode === 'garden' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`}
          onClick={() => {setViewMode('garden'); setSelectedThought(null);}}
        >
          Garden View
        </button>
        <button 
          className={`btn flex-grow-1 ${viewMode === 'insights' ? 'btn-primary-subtle text-primary' : 'text-secondary hover-bg-light'}`}
          onClick={() => {setViewMode('insights'); setSelectedThought(null);}}
        >
          Growth Insights
        </button>
      </div>
      
      {/* Selected Thought Detail View */}
      {selectedThought && (
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h3 className="fs-4 fw-semibold">Thought Detail</h3>
            <button 
              className="btn btn-close"
              onClick={closeThoughtDetail}
            >
            </button>
          </div>
          
          <div className="d-flex align-items-center justify-content-center mb-3">
            <div className="display-3">
              {['🌱', '🌿', '🌿', '🌸'][selectedThought.growthStage]}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small">
                {new Date(selectedThought.date).toLocaleDateString()}
              </span>
              <span className={`small badge ${
                selectedThought.mood === 'positive' ? 'text-bg-success' : 
                selectedThought.mood === 'negative' ? 'text-bg-warning' : 'text-bg-primary'
              }`}>
                {selectedThought.mood.charAt(0).toUpperCase() + selectedThought.mood.slice(1)}
              </span>
            </div>
            
            <div className="p-3 bg-light rounded mb-3">
              <p className="text-dark">{selectedThought.content}</p>
            </div>
            
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-medium text-secondary">
                Growth Stage: {['Seed', 'Sprout', 'Growing', 'Flowering'][selectedThought.growthStage]}
              </span>
              <button 
                className="btn btn-outline-success"
                onClick={() => waterPlant(selectedThought.id)}
                disabled={selectedThought.growthStage === 3}
              >
                {selectedThought.growthStage < 3 ? 'Water Plant' : 'Fully Grown'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Garden View */}
      {!selectedThought && viewMode === 'garden' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="fs-4 fw-semibold mb-3">Your Garden</h3>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {thoughts.map(thought => (
              <div 
                key={thought.id} 
                className="col"
              >
                <div 
                  className="border rounded p-3 text-center hover-border-primary hover-shadow cursor-pointer transition"
                  onClick={() => handlePlantClick(thought)}
                >
                  <div className="fs-2 mb-2">
                    {['🌱', '🌿', '🌿', '🌸'][thought.growthStage]}
                  </div>
                  <div className="text-truncate small fw-medium text-dark mb-1">
                    {thought.content.substring(0, 25)}...
                  </div>
                  <div className="small text-secondary">
                    {new Date(thought.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Insights View */}
      {!selectedThought && viewMode === 'insights' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="fs-4 fw-semibold mb-3">Growth Insights</h3>
          
          <div className="alert alert-primary mb-4">
            <h4 className="fs-6 fw-medium text-primary mb-2">Growth Pattern Recognition</h4>
            <p className="text-primary mb-0">
              You've been consistently adding new thoughts. Keep up the good work! 
              Your recent entries show more positive emotions than previous ones.
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="fs-6 fw-medium text-secondary mb-3">Mood Distribution</h4>
            <div className="progress" role="progressbar" aria-label="Mood distribution" style={{height: "24px"}}>
              <div className="progress-bar bg-success" style={{width: "50%"}}>Positive</div>
              <div className="progress-bar bg-primary" style={{width: "25%"}}>Neutral</div>
              <div className="progress-bar bg-warning" style={{width: "25%"}}>Challenging</div>
            </div>
            <div className="d-flex justify-content-between small text-secondary mt-1">
              <span>Positive (50%)</span>
              <span>Neutral (25%)</span>
              <span>Challenging (25%)</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="fs-6 fw-medium text-secondary mb-3">Recommendations</h4>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-2">
                <span className="text-primary me-2">→</span>
                <span className="text-secondary">Try the Present Moment Awareness meditation to enhance your wellbeing</span>
              </li>
              <li className="d-flex align-items-start">
                <span className="text-primary me-2">→</span>
                <span className="text-secondary">Consider journaling about small positive moments each day</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// MindSpace Page Component
const MindspacePage: React.FC<MindspacePageProps> = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Start a basic meditation timer
  const startMeditation = () => {
    setShowActivity(true);
    setIsTimerRunning(true);
    
    // Start a 1-second interval timer
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    
    // Clean up the interval when component unmounts or timer stops
    return () => clearInterval(interval);
  };
  
  // Format seconds into MM:SS format
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // If showing an activity
  if (showActivity) {
    return (
      <div className="mx-auto" style={{maxWidth: "960px"}}>
        <h2 className="fs-2 fw-bold text-indigo mb-4">Deep Breathing</h2>
        
        <div className="bg-white rounded shadow p-4 mb-4 text-center">
          <div className="mb-5">
            <div className="display-4 fw-light mb-2">
              {formatTime(timer)}
            </div>
            <div className="fs-4 text-indigo">
              Breathe deeply and relax
            </div>
          </div>
          
          {/* Breathing visualization */}
          <div className="position-relative mx-auto mb-5" style={{width: "200px", height: "200px"}}>
            <div className={`position-absolute top-0 start-0 w-100 h-100 rounded-circle border border-4 border-indigo ${isTimerRunning ? 'pulse-animation' : ''}`}></div>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-indigo">
              <div className="fs-5">Focus on your breath</div>
            </div>
          </div>
          
          <div className="d-flex justify-content-center gap-3">
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="btn btn-indigo px-4 py-2"
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </button>
            <button 
              onClick={() => setShowActivity(false)}
              className="btn btn-outline-indigo px-4 py-2"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-indigo mb-4">MindSpace</h2>
      <p className="text-secondary mb-4">
        Your sanctuary for meditation, breathing exercises, and mindfulness practices.
        Take a moment to pause, reflect, and nurture your mental wellbeing.
      </p>
      
      {selectedMood ? (
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-4 fw-semibold">
              Recommendations for You
            </h3>
            <button 
              onClick={() => setSelectedMood(null)} 
              className="btn btn-link text-secondary"
            >
              Change mood
            </button>
          </div>
          <p className="text-secondary mb-3">
            Based on your {selectedMood} mood, here are some practices that might help:
          </p>
          <div className="d-flex flex-column gap-3">
            <div 
              className="border rounded p-3 hover-border-indigo hover-shadow cursor-pointer transition"
              onClick={startMeditation}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="fs-5 fw-medium text-dark">Deep Breathing</h4>
                <span className="text-secondary small">5 min</span>
              </div>
              <p className="text-secondary small mb-0">Simple breath awareness to calm your mind and body</p>
            </div>
            <div 
              className="border rounded p-3 hover-border-indigo hover-shadow cursor-pointer transition"
              onClick={startMeditation}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="fs-5 fw-medium text-dark">Body Scan Meditation</h4>
                <span className="text-secondary small">10 min</span>
              </div>
              <p className="text-secondary small mb-0">Gentle attention through your body to release tension</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4 mb-4">
          <h3 className="fs-4 fw-semibold mb-3">How are you feeling today?</h3>
          <p className="text-secondary mb-3">
            Select your current mood to receive personalized recommendations:
          </p>
          <div className="row row-cols-2 row-cols-md-5 g-3">
            {["anxious", "sad", "stressed", "tired", "content"].map(mood => (
              <div 
                key={mood}
                className="col"
              >
                <div
                  className="border rounded p-3 text-center hover-border-indigo hover-bg-light cursor-pointer transition"
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="fs-3 d-block mb-1">
                    {{"anxious": "😰", "sad": "😔", "stressed": "😩", "tired": "😴", "content": "😌"}[mood]}
                  </span>
                  <span className="text-secondary">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded shadow p-4">
        <h3 className="fs-4 fw-semibold mb-3">Featured Practices</h3>
        <div className="row row-cols-1 row-cols-md-2 g-3">
          <div className="col">
            <div 
              className="border rounded p-3 hover-border-indigo hover-shadow cursor-pointer transition h-100"
              onClick={startMeditation}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="fs-5 fw-medium text-dark">Deep Breathing</h4>
                <span className="text-secondary small">5 min</span>
              </div>
              <p className="text-secondary small mb-0">Simple breath awareness to calm your mind and body</p>
            </div>
          </div>
          <div className="col">
            <div 
              className="border rounded p-3 hover-border-indigo hover-shadow cursor-pointer transition h-100"
              onClick={startMeditation}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="fs-5 fw-medium text-dark">Body Scan Meditation</h4>
                <span className="text-secondary small">10 min</span>
              </div>
              <p className="text-secondary small mb-0">Gentle attention through your body to release tension</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Journal Page Component
const JournalPage: React.FC<JournalPageProps> = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const generateSummary = () => {
    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowSummary(true);
    }, 2000);
  };
  
  if (showSummary) {
    return (
      <div className="mx-auto" style={{maxWidth: "960px"}}>
        <h2 className="fs-2 fw-bold text-purple mb-4">Wellness Journal</h2>
        
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-4 fw-semibold">
              Weekly Summary: Apr 12 - Apr 19, 2025
            </h3>
            <button 
              className="btn btn-link text-secondary"
              onClick={() => setShowSummary(false)}
            >
              Back to Journal
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="fs-5 fw-medium text-dark mb-2">Weekly Summary</h4>
            <p className="text-secondary">
              You've had a generally positive week! Your entries show a trend of optimism and appreciation,
              with some moments of challenge that you've navigated well.
            </p>
          </div>
          
          <div className="alert alert-purple mb-4">
            <h4 className="fs-6 fw-medium mb-1">
              Pattern Insight
            </h4>
            <p className="mb-0">
              You seem to thrive when acknowledging your accomplishments, however small they may be.
              Your entries after completing tasks show significantly more positive sentiment.
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="fs-5 fw-medium text-dark mb-2">Recommendation</h4>
            <p className="text-secondary">
              Continue building on this positive momentum by setting small, achievable goals for the coming week
              and celebrating each success, no matter how minor it may seem.
            </p>
          </div>
          
          <div>
            <h4 className="fs-5 fw-medium text-dark mb-3">Weekly Highlights</h4>
            <div className="d-flex flex-column gap-3">
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small text-secondary">
                    Apr 16
                  </span>
                </div>
                <p className="text-dark mb-2">Successfully completed my project ahead of schedule!</p>
                <div className="small text-secondary fst-italic border-start border-3 border-purple ps-3">
                  "This shows your ability to manage your time effectively. What strategies worked well that you can apply to future projects?"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-purple mb-4">Wellness Journal</h2>
      <p className="text-secondary mb-4">
        Your personal journey, summarized weekly to help you track patterns, 
        celebrate progress, and gain insights into your mental wellness.
      </p>
      
      <div className="bg-white rounded shadow p-4 mb-4 text-center">
        <h3 className="fs-4 fw-semibold mb-3">Weekly Wellness Summary</h3>
        <p className="text-secondary mb-3">
          Generate an AI-powered summary of your mental wellness journey for the past week.
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
      </div>
      
      <div className="bg-white rounded shadow p-4">
        <h3 className="fs-4 fw-semibold mb-3">Previous Summaries</h3>
        <div className="border rounded overflow-hidden">
          <div className="p-3 bg-light d-flex justify-content-between align-items-center cursor-pointer hover-bg-light-hover transition">
            <div>
              <div className="fw-medium text-dark d-flex align-items-center">
                <Calendar size={16} className="me-2 text-purple" />
                Apr 5 - Apr 12, 2025
              </div>
              <div className="small text-secondary mt-1">
                8 entries • <span className="text-success">Mostly positive</span>
              </div>
            </div>
            <div>
              <ChevronDown size={20} className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resources Page Component
const ResourcesPage: React.FC<ResourcesPageProps> = () => {
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-success mb-4">Resources</h2>
      <p className="text-secondary mb-4">
        Helpful articles, tools, and support information for your mental wellness journey.
        Find resources tailored to your needs, from educational content to immediate support options.
      </p>
      
      <div className="alert alert-warning mb-4">
        <h3 className="fs-6 fw-medium text-warning-emphasis">
          In a crisis? Get immediate help
        </h3>
        <div className="mt-2 small text-warning-emphasis">
          <p>
            If you're experiencing a mental health emergency, please contact your local crisis line immediately.
            <br />
            <strong>National Suicide Prevention Lifeline:</strong> 1-800-273-8255
            <br />
            <strong>Crisis Text Line:</strong> Text HOME to 741741
          </p>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-6">
          <div className="bg-white rounded shadow p-4 h-100">
            <h3 className="fs-4 fw-semibold mb-3">Articles & Guides</h3>
            <ul className="list-unstyled mb-0">
              <li className="border-bottom pb-2 mb-2">
                <a href="#" className="text-success text-decoration-none hover-text-decoration-underline">Understanding Anxiety and How to Manage It</a>
              </li>
              <li className="border-bottom pb-2 mb-2">
                <a href="#" className="text-success text-decoration-none hover-text-decoration-underline">5 Simple Daily Practices for Mental Wellness</a>
              </li>
              <li className="border-bottom pb-2 mb-2">
                <a href="#" className="text-success text-decoration-none hover-text-decoration-underline">The Science Behind Meditation and Its Benefits</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="bg-white rounded shadow p-4 h-100">
            <h3 className="fs-4 fw-semibold mb-3">Support Resources</h3>
            <div className="alert alert-warning mb-3">
              <p className="text-warning-emphasis mb-0">
                <strong>Remember:</strong> If you're experiencing a mental health emergency, please contact your local crisis line immediately.
              </p>
            </div>
            <ul className="list-unstyled mb-0">
              <li className="d-flex align-items-center mb-2">
                <span className="fw-medium me-2">Crisis Text Line:</span> Text HOME to 741741
              </li>
              <li className="d-flex align-items-center">
                <span className="fw-medium me-2">National Suicide Prevention Lifeline:</span> 1-800-273-8255
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// About Page Component
const AboutPage: React.FC<AboutPageProps> = () => {
  return (
    <div className="mx-auto" style={{maxWidth: "960px"}}>
      <h2 className="fs-2 fw-bold text-success mb-4">About NeuroNest</h2>
      
      <div className="bg-white rounded shadow p-4 mb-4">
        <h3 className="fs-4 fw-semibold mb-3">Our Mission</h3>
        <p className="text-secondary mb-3">
          NeuroNest was created with a simple but powerful mission: to provide a digital sanctuary 
          where people can nurture their mental wellbeing through mindfulness, reflection, and growth tracking.
        </p>
        <p className="text-secondary mb-3">
          We believe that mental wellness should be accessible to everyone, and that small, 
          consistent steps can lead to powerful transformations in how we think and feel.
        </p>
        <p className="text-secondary">
          Just as a gardener tends to their plants with patience and care, we believe in the power 
          of nurturing our thoughts and emotions regularly to cultivate a healthier mind.
        </p>
      </div>
      
      <div className="bg-white rounded shadow p-4">
        <h3 className="fs-4 fw-semibold mb-3">Contact Us</h3>
        <p className="text-secondary mb-4">
          We'd love to hear from you! Whether you have questions, feedback, or just want to share your experience with NeuroNest.
        </p>
        
        <form className="row g-3">
          <div className="col-12">
            <label className="form-label text-secondary" htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name"
              className="form-control"
              placeholder="Your name"
            />
          </div>
          
          <div className="col-12">
            <label className="form-label text-secondary" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              className="form-control"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="col-12">
            <label className="form-label text-secondary" htmlFor="message">Message</label>
            <textarea 
              id="message"
              rows={4}
              className="form-control"
              placeholder="Your message..."
            ></textarea>
          </div>
          
          <div className="col-12">
            <button 
              type="button" // Changed from submit to button for demo
              className="btn btn-success px-4 py-2"
              onClick={() => alert('Message sent! (Demo only)')}
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Account Page Component - Simplified
const AccountPage: React.FC<AccountPageProps> = ({ isLoggedIn, username, onLogout }) => {
  return (
    <div className="mx-auto" style={{maxWidth: "400px"}}>
      <h2 className="fs-2 fw-bold text-success mb-4">Your Account</h2>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="text-center p-4 bg-success-subtle">
          <div className="d-inline-block p-3 bg-success-subtle rounded-circle border border-3 border-success mb-2">
            <p className="fs-2 fw-bold text-success mb-0">
              {username.charAt(0).toUpperCase()}
            </p>
          </div>
          <h3 className="fs-4 fw-semibold mt-2">{username}</h3>
          <p className="text-secondary small">demo@neuronest.com</p>
        </div>
        
        <div className="p-4">
          <div className="border-top pt-3">
            <h4 className="fs-5 fw-medium text-secondary mb-3">Account Information</h4>
            <div className="row">
              <div className="col-6">
                <p className="small text-secondary">Account Type</p>
                <p className="fw-medium">Free Plan</p>
              </div>
              <div className="col-6">
                <p className="small text-secondary">Member Since</p>
                <p className="fw-medium">April 2025</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              className="btn btn-outline-danger w-100"
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;