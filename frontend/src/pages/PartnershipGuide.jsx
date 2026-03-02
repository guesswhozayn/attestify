import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Lock, 
  Globe,
  Code,
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Button from '../components/shared/Button';
import PoweredBy from '../components/shared/PoweredBy';
import BackgroundEffects from '../components/shared/BackgroundEffects';

const sections = [
  { id: 'mission', label: 'The Mission', icon: Rocket },
  { id: 'roadmap', label: 'Partnership Roadmap', icon: Globe },
  { id: 'benefits', label: 'Pioneer Benefits', icon: Zap },
  { id: 'advantage', label: 'Issuer Advantage', icon: Shield },
  { id: 'apply', label: 'Join Program', icon: ArrowRight },
];

const PartnershipGuide = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('mission');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const SCROLL_OFFSET = 110;
  const sectionRefs = useRef([]);

  useEffect(() => {
    sectionRefs.current = sections.map(s => ({
      id: s.id,
      el: document.getElementById(s.id),
    }));

    const handleScroll = () => {
      setScrollY(window.scrollY);

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      let currentSection = sections[0].id;
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const { id, el } = sectionRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= SCROLL_OFFSET + 20) {
            currentSection = id;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileNavOpen(false);
  };

  const roadmapSteps = [
    {
      title: "Discovery Phase",
      desc: "Initial consultation to align our protocol with your institution's specific requirements and credential types.",
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      tag: "Week 1-2"
    },
    {
      title: "Secure Onboarding",
      desc: "Setup your institution's decentralized identity (DID) and secure issuer profile on Attestify.",
      icon: <Lock className="w-6 h-6 text-purple-400" />,
      tag: "Week 3"
    },
    {
      title: "Technical Integration",
      desc: "Connect your existing database via our API/Webhooks or use our manual issuing interface.",
      icon: <Code className="w-6 h-6 text-emerald-400" />,
      tag: "Week 4-6"
    },
    {
      title: "Genesis Launch",
      desc: "Go live with your first batch of blockchain-secured credentials and issue for free for the first year.",
      icon: <Rocket className="w-6 h-6 text-orange-400" />,
      tag: "Week 8"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      <BackgroundEffects scrollY={scrollY} />
      
      <Navbar onToggleSidebar={() => setMobileNavOpen(!mobileNavOpen)} showSidebarToggle={true} />

      <div className="pt-24 flex max-w-[1440px] mx-auto relative z-10">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 relative top-24 h-[calc(100vh-6rem)] p-8 overflow-y-auto">
          <div className="fixed">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8 ml-4">Partnership Guide</p>
            <div className="space-y-1 relative">
              {sections.map(s => (
                <Button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  variant="ghost"
                  rounded="2xl"
                  noWrapper={true}
                  className={`w-full group justify-between! px-4 py-3 shadow-none! ${
                    activeSection === s.id ? 'text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <s.icon className={`w-4 h-4 mt-0.5 ${activeSection === s.id ? 'text-indigo-400' : 'text-gray-600 group-hover:text-indigo-400'} transition-colors shrink-0`} />
                    <span className="leading-tight normal-case tracking-normal">{s.label}</span>
                  </div>
                  {activeSection === s.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl -z-10 shadow-inner"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-all opacity-0 group-hover:opacity-100 ${activeSection === s.id ? 'opacity-100 translate-x-1 text-indigo-400' : 'translate-x-0'}`} />
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 px-6 sm:px-12 lg:px-20 py-12 pb-48">
          
          {/* High-End Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 sm:mb-24 lg:mb-32"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 shadow-xl hover:bg-indigo-500/20 transition-colors">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Pioneer Program 2026</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Shape the <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-white to-purple-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Future of Trust.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed font-medium">
              Join an elite circle of academic and professional institutions redefining how the world handles human achievement. 
            </p>
          </motion.div>

          <Section id="mission" title="The Mission" icon={Rocket}>
            <SectionCard title="A New Standard for Achievement">
              <p>
                In an era of deepfakes and mass-produced fraud, the validity of human achievement is more vulnerable than ever. Attestify&apos;s mission is to provide institutions with the cryptographic infrastructure needed to issue <Highlight>unforgeable credentials</Highlight> that remain verifiable for a lifetime.
              </p>
              <p className="mt-4">
                By joining our Pioneer Program, you aren&apos;t just adopting a new tool; you are setting the global standard for <Highlight>Decentralized Academic Identity</Highlight>.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                    onClick={() => navigate('/register')}
                    variant="white" 
                    size="lg"
                >
                    Create Issuer Account
                </Button>
                <Button 
                    onClick={() => scrollTo('apply')}
                    variant="secondary" 
                    size="lg"
                    className="border-white/10"
                >
                    Contact Team
                </Button>
              </div>
            </SectionCard>
          </Section>

          <Section id="roadmap" title="Partnership Roadmap" icon={Globe}>
            <SectionCard title="Step-by-Step Integration">
                <p className="mb-8">A clear, structured path to blockchain integration. Our team handles the heavy lifting.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roadmapSteps.map((step, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/2 border border-white/5 group hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    {step.icon}
                                </div>
                                <span className="text-[10px] font-black text-indigo-400/60 group-hover:text-indigo-400 tracking-widest">{step.tag}</span>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>
          </Section>

          <Section id="benefits" title="Pioneer Benefits" icon={Zap}>
            <SectionCard title="Why Partner Now?">
              <div className="space-y-6">
                {[
                  {
                    title: "First-Year Foundation",
                    desc: "Zero platform fees for the first 12 months. Scale your issuing without capital risk.",
                    icon: <Zap className="w-5 h-5 text-yellow-400" />
                  },
                  {
                    title: "Lifetime Platform Equity",
                    desc: "Early partners receive exclusive 'Pioneer' status and voting rights on the DAO roadmap.",
                    icon: <Shield className="w-5 h-5 text-indigo-400" />
                  },
                  {
                    title: "Dedicated Protocol Support",
                    desc: "24/7 access to our engineering team for seamless API integration and onboarding.",
                    icon: <Users className="w-5 h-5 text-purple-400" />
                  }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/2 border border-white/5 group hover:border-indigo-500/30 transition-all">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </Section>

          <Section id="advantage" title="Issuer Advantage" icon={Shield}>
            <div className="grid lg:grid-cols-2 gap-8">
                <SectionCard title="Sovereignty">
                    <p className="text-sm">Graduates maintain sovereignty over their own academic records, but institutions retain the authority to revoke or update them on-chain.</p>
                </SectionCard>
                <div className="relative p-10 rounded-3xl border border-white/10 bg-linear-to-br from-indigo-500/10 via-transparent to-purple-500/10 overflow-hidden flex flex-col justify-center text-center">
                    <div className="absolute inset-0 bg-white/2 bg-size-[24px_24px]"></div>
                    <div className="relative z-10">
                        <div className="text-8xl font-black text-white/5 leading-none mb-6">FREE</div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tighter">100% Free Issuing</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">We are removing all barriers for established institutions to adopt decentralized standards.</p>
                        <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold tracking-widest uppercase text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" /> For Year 1 Foundation Partners
                        </div>
                    </div>
                </div>
            </div>
          </Section>

          <Section id="apply" title="Join Program" icon={ArrowRight}>
             <SectionCard>
                <div className="text-center py-12">
                    <Rocket className="w-16 h-16 text-indigo-400 mx-auto mb-8" />
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Ready to lead?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        Spaces in our 2026 Pioneer Program are limited to 50 select institutions. Secure your place in the decentralized academic future today.
                    </p>
                    <div className="flex justify-center">
                        <Button 
                            onClick={() => window.open('mailto:attestifyteam@gmail.com?subject=Pilot Program Inquiry')}
                            variant="white" 
                            size="lg"
                        >
                            Contact Partnership Team
                        </Button>
                    </div>
                </div>
             </SectionCard>
          </Section>
          
          <PoweredBy className="mt-20" />
        </main>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-60 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-lg" 
              onClick={() => setMobileNavOpen(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-black/95 border-l border-white/10 p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Navigation</span>
                <Button 
                  onClick={() => setMobileNavOpen(false)}
                  variant="secondary"
                  size="sm"
                  rounded="full"
                  className="p-2!"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2">
                {sections.map((s, idx) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Button
                      onClick={() => scrollTo(s.id)}
                      variant={activeSection === s.id ? 'secondary' : 'ghost'}
                      rounded="2xl"
                      className="w-full justify-between! px-5 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <s.icon className={`w-5 h-5 ${activeSection === s.id ? 'text-indigo-400' : 'text-gray-600'}`} />
                        <span className="normal-case tracking-normal">{s.label}</span>
                      </div>
                      {activeSection === s.id && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Section = React.memo(({ id, title, icon: Icon, children }) => (
  <motion.section 
    id={id} 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="mb-32 scroll-mt-28"
  >
    <div className="flex items-center gap-4 mb-10">
      <div className="w-14 h-14 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg">
        <Icon className="w-7 h-7 text-indigo-400" />
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{title}</h2>
    </div>
    <div className="space-y-8">{children}</div>
  </motion.section>
));
Section.displayName = 'Section';

const SectionCard = React.memo(({ title, children }) => (
  <div className="group relative rounded-3xl border border-white/5 bg-gray-900/60 backdrop-blur-lg p-8 sm:p-10 transition-all duration-500 hover:border-indigo-500/30 hover:bg-white/4 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]">
    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/3 to-purple-500/3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      {title && <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        {title}
      </h3>}
      <div className="text-gray-400 leading-relaxed space-y-4 font-medium">{children}</div>
    </div>
  </div>
));
SectionCard.displayName = 'SectionCard';

const Highlight = React.memo(({ children }) => (
  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/10">{children}</span>
));
Highlight.displayName = 'Highlight';

export default PartnershipGuide;
