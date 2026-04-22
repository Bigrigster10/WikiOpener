import { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, Cookie, Mail, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Legal() {
  const [activeTab, setActiveTab] = useState('privacy');
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace('#', '');
      if (['privacy', 'terms', 'disclaimer', 'cookies', 'contact'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location]);

  const tabs = [
    { id: 'privacy', name: 'Privacy Policy', icon: Shield },
    { id: 'terms', name: 'Terms of Service', icon: FileText },
    { id: 'disclaimer', name: 'Disclaimer', icon: AlertTriangle },
    { id: 'cookies', name: 'Cookie Policy', icon: Cookie },
    { id: 'contact', name: 'Contact', icon: Mail },
  ];

  return (
    <div className="flex-1 glass flex flex-col md:flex-row h-full overflow-hidden">
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 flex flex-col overflow-y-auto bg-black/20">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            Legal Info
          </h2>
        </div>
        <div className="p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === tab.id ? 'bg-accent/20 text-accent font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-black/40">
        <div className="max-w-3xl prose prose-invert prose-emerald">
          {activeTab === 'privacy' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-white border-b border-white/10 pb-4">Privacy Policy</h1>
              <p>Last updated: April 22, 2026</p>
              
              <h3>1. Information We Collect</h3>
              <p>This site collects minimal user data for game progress, primarily storing your authentication state, virtual coin balance, and virtual inventory. This data is securely stored on Firebase (Google Cloud). We do not request or process intrusive personally identifiable information beyond the email and display name provided by your Google login.</p>
              
              <h3>2. Data Storage</h3>
              <p>Local configuration such as sound settings and UI theme choices are stored in your device's <code>localStorage</code>.</p>
              
              <h3>3. Third-Party Advertising</h3>
              <p>We use Google AdSense to serve advertisements on the site. Google AdSense uses cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your browsing history.</p>
              
              <h3>4. Third-Party Analytics</h3>
              <p>We may use third-party analytics integrations (like Firebase Analytics) to track performance and errors. This data is aggregated and does not personally identify you.</p>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-white border-b border-white/10 pb-4">Terms of Service</h1>
              
              <h3>1. The Service</h3>
              <p>WikiOpener is a free-to-play web-based game. The site is provided "as is" with no guarantees of uptime or data persistence.</p>
              
              <h3>2. Virtual Items & Currency</h3>
              <p>All in-game currency ("CR" or "$"), items, virtual objects, and cases inside the game have <strong>no real-world monetary value</strong>. Virtual items cannot be traded, withdrawn, exchanged, or cashed out for real currency under any circumstances.</p>
              
              <h3>3. Code of Conduct</h3>
              <p>By playing, you agree not to engage in hacking, botting, or exploiting the game mechanics. Automating Case Opens, intercepting API requests, or using multi-accounting to manipulate the leaderboard will result in account suspension and wiping of virtual stats.</p>
              
              <h3>4. Limitation of Liability</h3>
              <p>The owner(s) of WikiOpener is not liable for any data loss, including server wipes, account resets, or loss of virtual goods.</p>
            </>
          )}

          {activeTab === 'disclaimer' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-white border-b border-white/10 pb-4">Loot Box & Gambling Disclaimer</h1>
              
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                <p className="font-bold text-red-400 m-0">THIS IS A SIMULATOR, NOT A GAMBLING SITE.</p>
              </div>

              <h3>1. Not A Gambling Service</h3>
              <p>WikiOpener is strictly an entertainment simulator. It does NOT meet the definition of a gambling site. You cannot deposit real money to purchase currency, and you cannot withdraw real money or cryptocurrency from the platform.</p>
              
              <h3>2. Real-World Value</h3>
              <p>Virtual items acquired on this site hold <strong>zero real-world cash value</strong>.</p>
              
              <h3>3. Age Requirement</h3>
              <p>Users must be 18 years of age or older to engage with simulated loot-box mechanics, out of an abundance of caution and ad-compliance.</p>
            </>
          )}

          {activeTab === 'cookies' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-white border-b border-white/10 pb-4">Cookie Policy</h1>

              <h3>What Are Cookies?</h3>
              <p>Cookies are small text files stored on your device that allow websites to remember information about you, your preferences, and your device.</p>
              
              <h3>How We Use Cookies</h3>
              <p><strong>Functional Cookies:</strong> We utilize <code>localStorage</code> (which acts similarly to cookies) to save your configuration options, such as fast-open preferences and color themes, to keep your experience seamless across sessions.</p>
              <p><strong>Advertising Cookies:</strong> We utilize Google AdSense to serve ads. Ad providers use cookies to track user interests and behaviors in order to show personalized advertisements. You may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" className="text-accent underline">Google's Ad Settings</a>.</p>
            </>
          )}

          {activeTab === 'contact' && (
            <>
              <h1 className="text-3xl font-bold mb-6 text-white border-b border-white/10 pb-4">Contact Us</h1>

              <p>If you have any questions about these policies, need account support, or have AdSense-related inquiries, please reach out to us at:</p>

              <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Email Support</h4>
                  <a href="mailto:Bigrigster10@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                    Bigrigster10@gmail.com
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
