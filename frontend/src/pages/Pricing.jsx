import { Check, X, Shield, Zap, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import Button from '../components/shared/Button';
import BackgroundEffects from '../components/shared/BackgroundEffects';
import BackButton from '../components/shared/BackButton';
import { useNotification } from '../context/NotificationContext';

const Pricing = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleUpgrade = async (planName) => {
    if (planName === 'Pro') {
      try {
        const checkoutRes = await paymentAPI.createCheckoutSession();
        if (checkoutRes.data && checkoutRes.data.url) {
          window.location.assign(checkoutRes.data.url);
        }
      } catch (err) {
        console.error('Failed to initiate checkout', err);
        showNotification('Failed to start checkout process.', 'error');
      }
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for developers, testing, and small-scale credentialing.',
      icon: Shield,
      features: [
        { text: 'Up to 5 credentials issued', included: true },
        { text: 'Standard email verification', included: true },
        { text: 'Basic dashboard analytics', included: true },
        { text: 'Community support', included: true },
        { text: 'Custom smart contracts', included: false },
        { text: 'Bulk issuance via CSV', included: false },
      ],
      cta: 'Get Started',
      href: '/register?role=ISSUER&plan=STARTER',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$149',
      interval: '/month',
      description: 'Ideal for growing organizations and academic institutions.',
      icon: Zap,
      features: [
        { text: 'Up to 500 credentials issued', included: true },
        { text: 'Priority network processing', included: true },
        { text: 'Advanced analytics & export', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Bulk issuance via CSV', included: true },
        { text: 'Custom smart contracts', included: false },
      ],
      cta: 'Start Pro Plan',
      href: '/register?role=ISSUER&plan=PRO',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large enterprises requiring infinite scale and control.',
      icon: Building2,
      features: [
        { text: 'Unlimited credentials issued', included: true },
        { text: 'Custom smart contract deployment', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 SLA support', included: true },
        { text: 'White-labeled dashboard', included: true },
        { text: 'API integration access', included: true },
      ],
      cta: 'Contact Sales',
      href: '/register?role=ISSUER&plan=ENTERPRISE',
      highlight: false,
    }
  ];

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-black text-white selection:bg-indigo-500/30 font-sans relative scroll-smooth scrollbar-hide">
      <BackgroundEffects />
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <BackButton className="fixed top-8 left-8 z-50 text-white" />

      {/* Hero Section */}
      <section className="relative snap-start min-h-screen lg:h-screen flex flex-col justify-center items-center px-4 overflow-hidden py-20 lg:py-0">
        {/* Hero Glow Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 shadow-xl hover:bg-indigo-500/20 transition-colors">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[0.9]">
            Scale <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-white to-purple-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Securely.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Choose the tier that matches your issuance volume. No hidden fees, ever.
          </p>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-indigo-500 to-transparent" />
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative snap-start min-h-screen lg:h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 overflow-y-auto lg:overflow-hidden py-20 lg:py-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              
              return (
                <div
                  key={plan.name}
                  className={`group relative rounded-3xl border bg-gray-900/40 backdrop-blur-xl p-6 sm:p-10 transition-all duration-500 flex flex-col ${
                    plan.highlight
                      ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)] transform lg:-translate-y-4 hover:border-indigo-400'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Inner Glow Hover Overlay */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${
                     plan.highlight ? 'bg-indigo-600/10' : 'bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.03]'
                  }`} />

                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex flex-shrink-0 items-center justify-center border shadow-lg ${
                       plan.highlight 
                        ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border-indigo-500/40 text-indigo-300' 
                        : 'bg-white/5 border-white/10 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-black">{plan.name}</h3>
                  </div>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    {plan.interval && <span className="text-gray-400 text-lg font-medium">{plan.interval}</span>}
                  </div>

                  <p className="text-gray-400 mb-10 min-h-[48px] font-medium leading-relaxed">{plan.description}</p>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        {feature.included ? (
                          <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="mt-1 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-gray-500" />
                          </div>
                        )}
                        <span className={`text-[15px] leading-relaxed font-medium ${feature.included ? 'text-gray-200' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {user ? (
                      <Button
                        onClick={() => {
                            if (plan.name === 'Pro') handleUpgrade('Pro');
                            else showNotification(`You are already actively using the platform. Contact sales for Enterprise.`, 'info');
                        }}
                        variant={plan.highlight ? 'white' : 'secondary'}
                        className={`w-full justify-center ${
                            plan.highlight ? 'shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''
                        }`}
                      >
                        Upgrade Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => window.location.assign(plan.href)}
                        variant={plan.highlight ? 'white' : 'secondary'}
                        className={`w-full justify-center ${
                            plan.highlight ? 'shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Final Pilot / Contact Footer Block Section */}
      <section className="relative snap-start min-h-screen lg:h-screen flex flex-col justify-center px-4 overflow-hidden py-20 lg:py-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="rounded-3xl border border-white/10 bg-linear-to-br from-gray-900/60 to-black/60 backdrop-blur-xl p-8 sm:p-16 text-center overflow-hidden">
              {/* Inner Background Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 tracking-tight relative z-10">
                  Need a custom implementation?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 font-medium relative z-10">
                  We partner with select institutions for on-premise deployments, custom smart contract logic, and legacy system integrations via the Attestify Pilot Program.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                  <Button 
                      onClick={() => window.location.assign('/partnership-guide')} 
                      variant="white"
                      className="w-full sm:w-auto px-8! py-3! shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                      View Partnership Guide
                  </Button>
                  <Button 
                      onClick={() => window.open('mailto:attestifyteam@gmail.com?subject=Enterprise Inquiry')} 
                      variant="ghost"
                      className="w-full sm:w-auto px-8! py-3!"
                  >
                      Contact Enterprise Team
                  </Button>
              </div>
          </div>
        </div>
      </section>
    </div>

  );
};

export default Pricing;
