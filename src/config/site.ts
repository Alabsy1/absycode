import type { Localized } from "@/i18n";

/* =====================================================================
   AbsyCode — single source of truth.
   Edit ALL site copy, contact info, projects, services and prices here.
   README.md explains exactly where each thing lives in this file.
   ===================================================================== */

export type Locale = "en" | "ar";

export type Project = {
  slug: string;
  name: string;
  url: string;
  displayUrl: string;
  category: string;
  categoryLabel: Localized;
  description: Localized;
  problem: Localized;
  solution: Localized;
  stack: string[];
  result: Localized;
  featured: boolean;
  /** Optional Supabase storage URL; defaults to a /public/projects/*.svg placeholder. */
  image?: string;
};

export const site = {
  brand: "AbsyCode",
  tagline: {
    en: "We build the websites and systems your business runs on.",
    ar: "نبني المواقع والأنظمة التي يقوم عليها عملك.",
  } satisfies Localized,
  heroSupport: {
    en: "A small, senior team for websites, business systems, stores and automation — designed calmly, built fast, supported properly.",
    ar: "فريق صغير وخبير للمواقع وأنظمة الأعمال والمتاجر والأتمتة — تصميم هادئ، تنفيذ سريع، ودعم حقيقي.",
  } satisfies Localized,
  location: { en: "Egypt", ar: "مصر" } satisfies Localized,

  contact: {
    phoneDisplay: "01121224328",
    phoneIntl: "+201121224328",
    whatsapp: "https://wa.me/201121224328",
    email: "alabsyabdelrhman@gmail.com",
    instagram: "https://instagram.com/absycode",
    instagramHandle: "@absycode",
    facebookUrl: "", // TODO: add page URL
    mapsUrl: "", // TODO: add link
    bookingUrl: "", // TODO: optionally add a Calendly (or similar) booking URL; hidden while empty
  },

  socials: [
    { key: "instagram", label: { en: "Instagram", ar: "إنستغرام" } },
    { key: "facebook", label: { en: "Facebook", ar: "فيسبوك" } },
    { key: "maps", label: { en: "Google Maps", ar: "خرائط جوجل" } },
  ] as { key: string; label: Localized }[],

  nav: [
    { key: "work", href: "#work", label: { en: "Work", ar: "أعمالنا" } },
    { key: "services", href: "#services", label: { en: "Services", ar: "خدماتنا" } },
    { key: "about", href: "#about", label: { en: "About", ar: "من نحن" } },
    { key: "process", href: "#process", label: { en: "Process", ar: "منهجية العمل" } },
    { key: "contact", href: "#contact", label: { en: "Contact", ar: "تواصل" } },
  ] as { key: string; href: string; label: Localized }[],

  stats: [
    { value: "XX+", label: { en: "Years of experience", ar: "سنوات خبرة" } }, // TODO: verify years of experience
    { value: "XX+", label: { en: "Projects delivered", ar: "مشروع تم تسليمه" } }, // TODO: verify projects delivered
    { value: "XX+", label: { en: "Happy clients", ar: "عميل سعيد" } }, // TODO: verify happy clients
    { value: "XXh", label: { en: "Response time", ar: "زمن الاستجابة" } }, // TODO: verify response time
  ] as { value: string; label: Localized }[],

  founder: {
    quote: {
      en: "Good software feels quiet. It just works — every day, for everyone on your team.",
      ar: "البرمجيات الجيدة هادئة. تعمل ببساطة — كل يوم، لكل فرد في فريقك.",
    } satisfies Localized,
    role: {
      en: "Founder, AbsyCode — one point of contact, one clear process.",
      ar: "المؤسس، AbsyCode — جهة تواصل واحدة، ومنهجية واضحة.",
    } satisfies Localized,
  },

  process: [
    {
      n: "01",
      title: { en: "Understand", ar: "نفهم" },
      body: {
        en: "A short call and a few sharp questions. We map what your business actually needs — nothing more.",
        ar: "مكالمة قصيرة وبضعة أسئلة دقيقة. نحدد ما يحتاجه عملك فعلاً — لا أكثر.",
      } satisfies Localized,
    },
    {
      n: "02",
      title: { en: "Plan", ar: "نخطط" },
      body: {
        en: "Clear scope, fixed price range and a timeline you can hold us to. No surprises later.",
        ar: "نطاق واضح ونطاق سعري ثابت وجدول زمني يمكنك محاسبتنا عليه. بلا مفاجآت.",
      } satisfies Localized,
    },
    {
      n: "03",
      title: { en: "Design & Build", ar: "نصمم ونبني" },
      body: {
        en: "Calm, fast pages and solid systems. You see progress weekly and give feedback early.",
        ar: "صفحات هادئة وسريعة وأنظمة متينة. ترى التقدم أسبوعياً وتشارك بملاحظاتك مبكراً.",
      } satisfies Localized,
    },
    {
      n: "04",
      title: { en: "Launch & Support", ar: "نطلق وندعم" },
      body: {
        en: "We launch, watch closely, and stay around. Small fixes and guidance after go-live.",
        ar: "نطلق ونتابع عن قرب ونبقى بجانبك. إصلاحات صغيرة وإرشاد بعد الإطلاق.",
      } satisfies Localized,
    },
  ] as { n: string; title: Localized; body: Localized }[],

  services: [
    {
      key: "websites",
      icon: "globe",
      title: { en: "Website Development", ar: "تطوير المواقع" },
      body: {
        en: "Fast, secure websites designed around how your business actually works.",
        ar: "مواقع سريعة وآمنة مصممة حول طريقة عمل شركتك فعلاً.",
      } satisfies Localized,
      tags: { en: "Websites · Platforms", ar: "مواقع · منصات" } satisfies Localized,
    },
    {
      key: "systems",
      icon: "layers",
      title: { en: "System Development", ar: "تطوير الأنظمة" },
      body: {
        en: "Custom ERP, CRM, booking, inventory and invoicing systems that bring daily operations into one clear place.",
        ar: "أنظمة ERP وCRM والحجوزات والمخزون والفواتير في مكان واحد واضح لعملياتك اليومية.",
      } satisfies Localized,
      tags: { en: "Full-stack · Operations", ar: "متكامل · عمليات" } satisfies Localized,
    },
    {
      key: "ecommerce",
      icon: "bag",
      title: { en: "E-commerce Solutions", ar: "حلول المتاجر الإلكترونية" },
      body: {
        en: "Online stores with secure payments, product and order management built to sell.",
        ar: "متاجر إلكترونية بمدفوعات آمنة وإدارة للمنتجات والطلبات مصممة للبيع.",
      } satisfies Localized,
      tags: { en: "Stores · Payments", ar: "متاجر · مدفوعات" } satisfies Localized,
    },
    {
      key: "ai",
      icon: "spark",
      title: { en: "AI Agents & Automation", ar: "وكلاء الذكاء الاصطناعي والأتمتة" },
      body: {
        en: "Automate repetitive work with chatbots, smart workflows and tool integrations.",
        ar: "أتمتة الأعمال المتكررة عبر روبوتات المحادثة وسير العمل الذكي وربط الأدوات.",
      } satisfies Localized,
      tags: { en: "AI · Workflows", ar: "ذكاء اصطناعي · سير عمل" } satisfies Localized,
    },
    {
      key: "portals",
      icon: "grid",
      title: { en: "Client Portals & Dashboards", ar: "بوابات العملاء ولوحات التحكم" },
      body: {
        en: "Secure portals and dashboards where clients follow projects, invoices and reports in real time.",
        ar: "بوابات ولوحات تحكم آمنة يتابع فيها العملاء المشاريع والفواتير والتقارير لحظة بلحظة.",
      } satisfies Localized,
      tags: { en: "Portals · Analytics", ar: "بوابات · تحليلات" } satisfies Localized,
    },
    {
      key: "seo",
      icon: "chart",
      title: { en: "SEO & Digital Growth", ar: "تحسين محركات البحث والنمو" },
      body: {
        en: "Better visibility on Google, faster pages and measurable results.",
        ar: "ظهور أفضل على جوجل وصفحات أسرع ونتائج قابلة للقياس.",
      } satisfies Localized,
      tags: { en: "SEO · Performance", ar: "سيو · أداء" } satisfies Localized,
    },
  ] as { key: string; icon: string; title: Localized; body: Localized; tags: Localized }[],

  categories: [
    { key: "all", label: { en: "All", ar: "الكل" } },
    { key: "websites", label: { en: "Websites", ar: "مواقع" } },
    { key: "systems", label: { en: "Systems", ar: "أنظمة" } },
    { key: "ecommerce", label: { en: "E-commerce", ar: "متاجر" } },
    { key: "ai", label: { en: "AI", ar: "ذكاء اصطناعي" } },
    { key: "portfolio", label: { en: "Portfolio", ar: "أعمال" } },
  ] as { key: string; label: Localized }[],

  projects: [
    {
      slug: "mannai-tours",
      name: "Mannai Tours",
      url: "https://mannaitours.com",
      displayUrl: "mannaitours.com",
      category: "websites",
      categoryLabel: { en: "Tourism / Website", ar: "سياحة / موقع" } satisfies Localized,
      // TODO: verify copy
      description: {
        en: "A travel and tours website presenting trips and destinations with an easy way to enquire and book.",
        ar: "موقع للسفر والرحلات يعرض الرحلات والوجهات مع طريقة سهلة للاستفسار والحجز.",
      } satisfies Localized,
      problem: {
        en: "Mannai Tours needed a clear online home for trips and destinations, with enquiries scattered across calls and messages.",
        ar: "احتاجت Mannai Tours إلى موقع واضح للرحلات والوجهات، وكانت الاستفسارات موزعة بين المكالمات والرسائل.",
      } satisfies Localized,
      solution: {
        en: "We built a calm, fast browsing experience with clear trip pages and a single enquiry path that routes straight to their team.",
        ar: "بنينا تجربة تصفح هادئة وسريعة مع صفحات واضحة للرحلات ومسار استفسار واحد يصل مباشرة إلى فريقهم.",
      } satisfies Localized,
      stack: ["Next.js", "Tailwind", "WhatsApp booking"],
      result: {
        en: "One clear place for every trip, faster enquiries, and a site the team can extend trip by trip.",
        ar: "مكان واحد واضح لكل رحلة، واستفسارات أسرع، وموقع يمكن للفريق توسيعه رحلة بعد رحلة.",
      } satisfies Localized,
      featured: true,
    },
    {
      slug: "anubis-kite",
      name: "Anubis Kite",
      url: "https://anubiskite.com",
      displayUrl: "anubiskite.com",
      category: "websites",
      categoryLabel: { en: "Sports / Website", ar: "رياضة / موقع" } satisfies Localized,
      // TODO: verify copy
      description: {
        en: "A specialised kitesurfing site showcasing courses and services with direct contact.",
        ar: "موقع متخصص في الكايت سيرف يعرض الدورات والخدمات مع تواصل مباشر.",
      } satisfies Localized,
      problem: {
        en: "A kitesurfing school with great courses but no clear site to explain them and convert visitors into bookings.",
        ar: "مدرسة كايت سيرف بدورات مميزة لكن بلا موقع واضح يشرحها ويحوّل الزوار إلى حجوزات.",
      } satisfies Localized,
      solution: {
        en: "A focused one-pager style site: courses, gallery, reviews and a direct contact path — fast on mobile, where riders browse.",
        ar: "موقع مركّز: الدورات والمعرض والتقييمات ومسار تواصل مباشر — سريع على الجوال حيث يتصفح اللاعبون.",
      } satisfies Localized,
      stack: ["Next.js", "Tailwind", "SEO"],
      result: {
        en: "Clear course pages, direct contact, and a mobile experience that matches the sport's energy.",
        ar: "صفحات واضحة للدورات وتواصل مباشر وتجربة جوال تليق بروح الرياضة.",
      } satisfies Localized,
      featured: true,
    },
    {
      slug: "same-n-sterk",
      name: "Same N Sterk",
      url: "https://same-n-sterk.nl",
      displayUrl: "same-n-sterk.nl",
      category: "websites",
      categoryLabel: { en: "Business / Website", ar: "أعمال / موقع" } satisfies Localized,
      // TODO: verify copy
      description: {
        en: "A clean, clear business website for a Dutch company.",
        ar: "موقع أعمال نظيف وواضح لشركة هولندية.",
      } satisfies Localized,
      problem: {
        en: "The company needed a trustworthy, easy-to-read web presence for Dutch-speaking customers.",
        ar: "احتاجت الشركة إلى حضور موثوق وسهل القراءة للعملاء الناطقين بالهولندية.",
      } satisfies Localized,
      solution: {
        en: "A minimal, bilingual-ready layout with clear services, contact paths and fast load times.",
        ar: "تصميم بسيط جاهز للغتين مع خدمات واضحة ومسارات تواصل وتحميل سريع.",
      } satisfies Localized,
      stack: ["Next.js", "Tailwind", "i18n"],
      result: {
        en: "A credible front door for the business that loads instantly and reads effortlessly.",
        ar: "واجهة موثوقة للشركة تُحمّل فوراً وتُقرأ بسهولة.",
      } satisfies Localized,
      featured: true,
    },
    {
      slug: "wavora",
      name: "Wavora",
      url: "https://wavora-psi.vercel.app",
      displayUrl: "wavora-psi.vercel.app",
      category: "websites",
      categoryLabel: { en: "Brand / Website", ar: "علامة / موقع" } satisfies Localized,
      // TODO: verify copy
      description: {
        en: "A modern brand website with a smooth browsing experience.",
        ar: "موقع علامة عصري مع تجربة تصفح سلسة.",
      } satisfies Localized,
      problem: { en: "A new brand needed a polished web presence quickly.", ar: "علامة جديدة احتاجت إلى حضور ويب أنيق بسرعة." } satisfies Localized,
      solution: {
        en: "A modern marketing layout with smooth motion and clear calls to action.",
        ar: "تصميم تسويقي عصري مع حركة سلسة ودعوات واضحة لاتخاذ إجراء.",
      } satisfies Localized,
      stack: ["Next.js", "Framer Motion"],
      result: {
        en: "A smooth, memorable brand site shipped fast.",
        ar: "موقع علامة سلس لا يُنسى تم إطلاقه بسرعة.",
      } satisfies Localized,
      featured: false,
    },
    {
      slug: "absy-3d-portfolio",
      name: "Absy 3D Portfolio",
      url: "https://absy-3d-portfolio.vercel.app",
      displayUrl: "absy-3d-portfolio.vercel.app",
      category: "portfolio",
      categoryLabel: { en: "Portfolio / 3D", ar: "أعمال / ثلاثي الأبعاد" } satisfies Localized,
      // TODO: verify copy
      description: {
        en: "An interactive portfolio with 3D elements.",
        ar: "معرض أعمال تفاعلي بعناصر ثلاثية الأبعاد.",
      } satisfies Localized,
      problem: { en: "Stand out with an interactive, spatial portfolio.", ar: "التميز عبر معرض أعمال تفاعلي." } satisfies Localized,
      solution: {
        en: "A WebGL portfolio mixing 3D scenes with clean content sections.",
        ar: "معرض WebGL يمزج مشاهد ثلاثية الأبعاد مع أقسام محتوى نظيفة.",
      } satisfies Localized,
      stack: ["React Three Fiber", "Next.js"],
      result: {
        en: "A playful, immersive portfolio piece.",
        ar: "قطعة أعمال غامرة وممتعة.",
      } satisfies Localized,
      featured: false,
    },
  ] as Project[],

  testimonials: [
    {
      quote: { en: "Working with AbsyCode felt calm and clear from day one.", ar: "التعامل مع AbsyCode كان هادئاً وواضحاً من اليوم الأول." },
      name: { en: "Client name", ar: "اسم العميل" },
      role: { en: "Owner, example business", ar: "مالك، نشاط تجاري" },
    },
  ] as { quote: Localized; name: Localized; role: Localized }[],
  showTestimonials: false,

  estimator: {
    // TODO: set real prices — all numbers below are placeholders in USD
    currency: "USD",
    baseByType: [
      { key: "website", priceMin: 600, priceMax: 1200, weeksMin: 2, weeksMax: 4, label: { en: "Website", ar: "موقع" } },
      { key: "store", priceMin: 1200, priceMax: 2500, weeksMin: 3, weeksMax: 6, label: { en: "Online store", ar: "متجر إلكتروني" } },
      { key: "system", priceMin: 2000, priceMax: 5000, weeksMin: 4, weeksMax: 10, label: { en: "Business system", ar: "نظام أعمال" } },
      { key: "ai", priceMin: 800, priceMax: 2000, weeksMin: 2, weeksMax: 5, label: { en: "AI / Automation", ar: "ذكاء اصطناعي / أتمتة" } },
    ] as { key: string; priceMin: number; priceMax: number; weeksMin: number; weeksMax: number; label: Localized }[],
    features: [
      { key: "cms", addMin: 150, addMax: 300, label: { en: "Easy editing (CMS)", ar: "تحرير سهل" } },
      { key: "payments", addMin: 250, addMax: 500, label: { en: "Online payments", ar: "مدفوعات إلكترونية" } },
      { key: "booking", addMin: 200, addMax: 450, label: { en: "Booking system", ar: "نظام حجوزات" } },
      { key: "dashboard", addMin: 300, addMax: 700, label: { en: "Dashboard / portal", ar: "لوحة تحكم / بوابة" } },
      { key: "arabic", addMin: 100, addMax: 250, label: { en: "Arabic + English", ar: "عربي + إنجليزي" } },
      { key: "seo", addMin: 100, addMax: 250, label: { en: "SEO setup", ar: "تهيئة السيو" } },
    ] as { key: string; addMin: number; addMax: number; label: Localized }[],
    timeline: [
      { key: "relaxed", mult: 0.9, weeksDelta: 2, label: { en: "Relaxed", ar: "مريح" } },
      { key: "standard", mult: 1, weeksDelta: 0, label: { en: "Standard", ar: "عادي" } },
      { key: "urgent", mult: 1.25, weeksDelta: -1, label: { en: "Urgent", ar: "مستعجل" } },
    ] as { key: string; mult: number; weeksDelta: number; label: Localized }[],
  },

  ui: {
    startProject: { en: "Start a project", ar: "ابدأ مشروعك" },
    viewWork: { en: "View Our Work", ar: "شاهد أعمالنا" },
    discuss: { en: "Discuss Your Project", ar: "ناقش مشروعك" },
    bookCall: { en: "Book a call", ar: "احجز مكالمة" },
    whatsapp: { en: "WhatsApp", ar: "واتساب" },
    emailUs: { en: "Email us", ar: "راسلنا" },
    callUs: { en: "Call us", ar: "اتصل بنا" },
    sendMessage: { en: "Send message", ar: "أرسل الرسالة" },
    finalCta: { en: "Have a project in mind?", ar: "عندك مشروع في بالك؟" },
    finalCtaBody: {
      en: "Tell us where your business is going — we'll reply within 48 hours with honest next steps.",
      ar: "أخبرنا إلى أين يتجه عملك — سنرد خلال ٤٨ ساعة بخطوات صادقة وواضحة.",
    },
    footerTag: {
      en: "Websites and systems your business runs on.",
      ar: "مواقع وأنظمة يقوم عليها عملك.",
    },
    login: { en: "Log in", ar: "تسجيل الدخول" },
    dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  },
};

export type SiteConfig = typeof site;
