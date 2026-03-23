export interface Episode {
  id: number
  title: string
  guest: string
  role: string
  date: string
  tags: string[]
  desc: string
  url: string
}

export interface Resource {
  title: string
  type: 'book' | 'article' | 'framework' | 'tool'
}

export interface EpisodeInsights {
  episodeId: number
  takeaways: Takeaway[]
  framework: string
  quote: string
  bestFor: string[]
  resources: Resource[]
}

export interface Takeaway {
  format: 'do-this' | 'remember-this' | 'real-example' | 'ask-yourself' | 'avoid-this'
  text: string
}

export interface LearningPath {
  icon: string
  label: string
  sub: string
  tags: string[]
}

export const EPISODES: Episode[] = [
  { id: 1,  title: "How Figma builds product",               guest: "Dylan Field",        role: "CEO, Figma",                     date: "2024-01-15", tags: ["product","design","startups"],          desc: "Dylan Field shares the product philosophy behind Figma's meteoric rise, how they think about community-led growth, and why building for designers first was the right bet.",          url: "https://www.lennyspodcast.com/how-figma-builds-product-dylan-field-ceo-of-figma/" },
  { id: 2,  title: "The science of product-market fit",      guest: "Rahul Vohra",        role: "CEO, Superhuman",                date: "2023-11-08", tags: ["PMF","growth","metrics"],                desc: "Rahul Vohra reveals the exact survey methodology Superhuman used to measure product-market fit and how any startup can apply the same framework.",                                   url: "https://www.lennyspodcast.com/the-science-of-product-market-fit/" },
  { id: 3,  title: "How Notion builds product",              guest: "Ivan Zhao",          role: "CEO, Notion",                    date: "2023-10-23", tags: ["product","design","community"],          desc: "Ivan Zhao discusses Notion's unusual approach — starting from a philosophical foundation, hiring for taste, and why they resisted growth for years.",                               url: "https://www.lennyspodcast.com/how-notion-builds-product/" },
  { id: 4,  title: "The art of storytelling for PMs",        guest: "Wes Kao",            role: "Co-founder, Maven",              date: "2024-02-05", tags: ["communication","leadership","writing"],  desc: "Wes Kao breaks down the exact frameworks she uses to teach thousands of PMs how to communicate with clarity, persuade stakeholders, and write memorably.",                          url: "https://www.lennyspodcast.com/the-art-of-storytelling-for-product-managers-wes-kao/" },
  { id: 5,  title: "Building Stripe from the ground up",     guest: "John Collison",      role: "Co-founder, Stripe",             date: "2023-09-18", tags: ["startups","growth","payments"],          desc: "John Collison shares stories from Stripe's earliest days: how they signed their first customers, what almost killed the company, and the cultural values that compound.",          url: "https://www.lennyspodcast.com/building-stripe-from-the-ground-up-john-collison/" },
  { id: 6,  title: "How Linear builds product",              guest: "Karri Saarinen",     role: "CEO, Linear",                    date: "2023-12-11", tags: ["product","design","tools"],              desc: "Karri Saarinen explains Linear's opinionated approach — why they say no constantly, how they maintain speed at scale, and what great product taste really means.",                  url: "https://www.lennyspodcast.com/how-linear-builds-product-karri-saarinen-ceo-of-linear/" },
  { id: 7,  title: "Rethinking onboarding",                  guest: "Lauryn Motamedi",    role: "Head of Growth, Figma",          date: "2024-03-01", tags: ["onboarding","growth","retention"],       desc: "Lauryn Motamedi walks through Figma's onboarding experiments — what failed spectacularly, what worked, and the counterintuitive lessons about user activation.",                  url: "https://www.lennyspodcast.com/rethinking-onboarding-lauryn-motamedi-figma/" },
  { id: 8,  title: "The psychology of pricing",              guest: "Madhavan Ramanujam", role: "Partner, Simon-Kucher",          date: "2023-08-14", tags: ["pricing","monetization","strategy"],     desc: "Madhavan Ramanujam unpacks why most startups price wrong, how to use willingness-to-pay research, and the 9 pricing mistakes to avoid.",                                           url: "https://www.lennyspodcast.com/the-psychology-of-pricing-madhavan-ramanujam/" },
  { id: 9,  title: "How to build a growth team",             guest: "Elena Verna",        role: "Growth Advisor",                 date: "2023-07-25", tags: ["growth","PLG","metrics"],                desc: "Elena Verna shares her philosophy on growth — sustainable vs. hacked, when to go PLG vs. sales-led, and how to structure a modern growth team.",                                   url: "https://www.lennyspodcast.com/how-to-build-a-growth-team-elena-verna/" },
  { id: 10, title: "Lessons from 0 to IPO at Snowflake",    guest: "Benoit Dageville",   role: "Co-founder, Snowflake",          date: "2024-01-29", tags: ["startups","B2B","strategy"],             desc: "Benoit Dageville traces Snowflake's journey from a three-person idea to one of the largest software IPOs ever.",                                                                   url: "https://www.lennyspodcast.com/lessons-from-0-to-ipo-at-snowflake/" },
  { id: 11, title: "How Airbnb builds culture",              guest: "Brian Chesky",       role: "CEO, Airbnb",                    date: "2023-06-12", tags: ["culture","leadership","remote"],         desc: "Brian Chesky shares how Airbnb rebuilt its culture after COVID — why he went back to infinite detail, and what he'd do differently about remote work.",                            url: "https://www.lennyspodcast.com/how-airbnb-builds-culture-brian-chesky-ceo-of-airbnb/" },
  { id: 12, title: "What it takes to be a great PM",        guest: "Shreyas Doshi",      role: "Former PM, Twitter & Google",    date: "2023-05-01", tags: ["product","leadership","career"],         desc: "Shreyas Doshi introduces his LNO framework and reveals what separates great PMs from merely good ones.",                                                                           url: "https://www.lennyspodcast.com/what-it-takes-to-be-a-great-product-manager-shreyas-doshi/" },
  { id: 13, title: "Inside Duolingo's growth machine",      guest: "Jorge Mazal",        role: "CPO, Duolingo",                  date: "2024-04-08", tags: ["growth","gamification","retention"],     desc: "Jorge Mazal reveals the streak mechanic that reignited Duolingo's growth and the ethics of engagement design.",                                                                   url: "https://www.lennyspodcast.com/inside-duolingos-growth-machine-jorge-mazal-cpo-of-duolingo/" },
  { id: 14, title: "The jobs-to-be-done framework",         guest: "Bob Moesta",         role: "Co-creator, JTBD",               date: "2023-04-17", tags: ["discovery","JTBD","research"],           desc: "Bob Moesta explains how to conduct demand-side interviews and find the real reason people switch products.",                                                                        url: "https://www.lennyspodcast.com/the-jobs-to-be-done-framework-bob-moesta/" },
  { id: 15, title: "User research that actually matters",   guest: "Teresa Torres",      role: "Product Discovery Coach",        date: "2023-03-28", tags: ["research","discovery","product"],        desc: "Teresa Torres breaks down continuous discovery habits and the opportunity-solution tree framework that replaces roadmaps.",                                                          url: "https://www.lennyspodcast.com/how-to-do-user-research-that-actually-matters-teresa-torres/" },
  { id: 16, title: "The power of narrative in product",     guest: "Andy Raskin",        role: "Strategic Narrative Consultant", date: "2024-05-13", tags: ["strategy","communication","leadership"],  desc: "Andy Raskin explains why the best pitches start with a world-changing shift and walks through the five elements of a strategic narrative.",                                         url: "https://www.lennyspodcast.com/the-power-of-narrative-in-product-andy-raskin/" },
  { id: 17, title: "How to run effective product reviews",  guest: "Marty Cagan",        role: "Founder, SVPG",                  date: "2023-02-13", tags: ["product","leadership","process"],        desc: "Marty Cagan argues most companies build product the wrong way and explains the empowered product team model.",                                                                    url: "https://www.lennyspodcast.com/how-to-run-effective-product-reviews-marty-cagan/" },
  { id: 18, title: "How Loom built a viral product",        guest: "Shahed Khan",        role: "Co-founder, Loom",               date: "2023-01-30", tags: ["growth","virality","B2B"],               desc: "Shahed Khan recounts the insight behind Loom and how virality was baked in from day one without a dedicated growth team.",                                                          url: "https://www.lennyspodcast.com/how-loom-built-a-viral-product-shahed-khan-co-founder-of-loom/" },
  { id: 19, title: "The secrets of top product leaders",    guest: "Jackie Bavaro",      role: "Former APM, Asana & Google",     date: "2024-06-02", tags: ["career","product","leadership"],         desc: "Jackie Bavaro shares the mental models she's collected from the best product leaders and patterns in those who level up fastest.",                                                  url: "https://www.lennyspodcast.com/the-secrets-of-top-product-leaders-jackie-bavaro/" },
  { id: 20, title: "How to scale from 0 to 100M users",    guest: "Bangaly Kaba",       role: "Former VP Growth, Instagram",    date: "2023-12-04", tags: ["growth","scale","metrics"],              desc: "Bangaly Kaba shares Instagram's growth playbook: north star metric evolution, finding adjacent users, and building a compounding learning team.",                                   url: "https://www.lennyspodcast.com/how-to-scale-from-0-to-100-million-users-bangaly-kaba/" },
  { id: 21, title: "The craft of great product design",     guest: "Julie Zhuo",         role: "Former VP Design, Facebook",     date: "2023-11-20", tags: ["design","product","leadership"],         desc: "Julie Zhuo on how great design is clear thinking made visual — the habits of design leaders who build taste and ship velocity simultaneously.",                                     url: "https://www.lennyspodcast.com/the-craft-of-great-product-design-julie-zhuo/" },
  { id: 22, title: "Go-to-market strategy from zero",       guest: "Kyle Poyar",         role: "Partner, OpenView",              date: "2024-02-19", tags: ["GTM","PLG","strategy"],                  desc: "Kyle Poyar breaks down when to go product-led vs. sales-led and how to find the right motion for your market and buyer.",                                                           url: "https://www.lennyspodcast.com/go-to-market-strategy-from-zero-kyle-poyar/" },
]

export const LEARNING_PATHS: LearningPath[] = [
  { icon: "🚀", label: "Starting a company",    sub: "Founding, PMF, early days",     tags: ["startups","PMF"] },
  { icon: "📈", label: "Growing fast",           sub: "Growth loops, metrics, scale",  tags: ["growth","metrics","scale","PLG"] },
  { icon: "🎨", label: "Building great product", sub: "Discovery, design, process",    tags: ["product","design","discovery","research"] },
  { icon: "👥", label: "Leading teams",          sub: "Culture, hiring, leadership",   tags: ["leadership","culture","career"] },
  { icon: "💬", label: "Comms & strategy",       sub: "Narrative, storytelling, GTM",  tags: ["communication","strategy","writing","GTM"] },
  { icon: "💰", label: "Monetizing",             sub: "Pricing, B2B, payments",        tags: ["pricing","monetization","B2B","payments"] },
]

export const ALL_TOPICS = [
  "product","growth","startups","leadership","design","strategy",
  "metrics","research","career","culture","pricing","onboarding",
  "PMF","discovery","B2B","GTM","PLG","virality","gamification","communication",
]
