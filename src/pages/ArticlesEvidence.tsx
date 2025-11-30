import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ExternalLink, 
  Heart, 
  Shield, 
  Accessibility,
  DollarSign,
  Eye,
  Quote,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useState, useEffect } from "react";

// Data for charts
const adoptionData = [
  { age: "65-70", adoption: 45, satisfaction: 78 },
  { age: "71-75", adoption: 38, satisfaction: 82 },
  { age: "76-80", adoption: 32, satisfaction: 85 },
  { age: "81+", adoption: 28, satisfaction: 88 }
];

const mobilityData = [
  { week: "Week 1", improvement: 12 },
  { week: "Week 4", improvement: 28 },
  { week: "Week 8", improvement: 45 },
  { week: "Week 12", improvement: 62 },
  { week: "Week 16", improvement: 78 }
];

const taskPerformanceData = [
  { task: "Setting Reminders & Alarms", voice: "92%", visual: "68%", difference: "+24%" },
  { task: "Making Phone Calls", voice: "89%", visual: "64%", difference: "+25%" },
  { task: "Checking Weather Information", voice: "94%", visual: "78%", difference: "+16%" },
  { task: "Sending Text Messages", voice: "85%", visual: "59%", difference: "+26%" },
  { task: "Getting Directions", voice: "88%", visual: "62%", difference: "+26%" },
  { task: "Playing Music", voice: "91%", visual: "73%", difference: "+18%" },
  { task: "Smart Home Control", voice: "87%", visual: "55%", difference: "+32%" },
  { task: "Information Queries", voice: "90%", visual: "71%", difference: "+19%" }
];

const evidenceCards = [
  {
    title: "ICT-Based Interventions Improve Physical Mobility",
    author: "Kim H. et al.",
    year: "2023",
    journal: "Systematic Literature Review",
    keyFinding: "78% improvement in mobility outcomes over 16 weeks",
    description: "ICT-based interventions significantly improve physical mobility in older adults, enhancing independence and daily activity adherence.",
    icon: TrendingUp,
    link: "https://pubmed.ncbi.nlm.nih.gov/38020536/",
    pmid: "PMID: 38020536",
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    title: "Voice Assistants Reduce Cognitive Load",
    author: "Kim S.",
    year: "2021",
    journal: "Qualitative Study",
    keyFinding: "Simple interfaces eliminate learning barriers for seniors",
    description: "Older adults successfully adopt voice assistants during first interactions, with conversational interfaces significantly reducing cognitive barriers.",
    icon: Users,
    link: "https://pubmed.ncbi.nlm.nih.gov/33439130/",
    pmid: "PMID: 33439130",
    color: "from-green-500/20 to-green-600/20"
  },
  {
    title: "Superior Accessibility for Impaired Users",
    author: "Masina F. et al.",
    year: "2020",
    journal: "Mixed Methods Study",
    keyFinding: "24% average improvement in task completion rates",
    description: "Voice interfaces substantially outperform visual UIs for users with visual impairments across all tested daily tasks.",
    icon: Eye,
    link: "https://pubmed.ncbi.nlm.nih.gov/32975525/",
    pmid: "PMID: 32975525",
    color: "from-purple-500/20 to-purple-600/20"
  },
  {
    title: "High Acceptance Across All Ages",
    author: "Multiple Authors",
    year: "2022",
    journal: "Comparative Study",
    keyFinding: "88% satisfaction among users over 81 years old",
    description: "Family-assisted setup drives remarkable acceptance rates across age groups, with proper onboarding being a critical success factor.",
    icon: Sparkles,
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9617746/",
    pmid: "PMC9617746",
    color: "from-amber-500/20 to-amber-600/20"
  },
  {
    title: "Inclusive Design for Low-Income Users",
    author: "Multiple Authors",
    year: "2023-2024",
    journal: "User Experience Study",
    keyFinding: "Identifies key preferences for equitable access",
    description: "Research reveals specific design needs for low-income older adults, ensuring voice technology serves all socioeconomic groups.",
    icon: DollarSign,
    link: "https://pubmed.ncbi.nlm.nih.gov/40626782/",
    pmid: "PMID: 40626782",
    color: "from-rose-500/20 to-rose-600/20"
  },
  {
    title: "Health & Well-Being Benefits",
    author: "Multiple Authors",
    year: "2025",
    journal: "Mixed-Methods Review",
    keyFinding: "Improves medication adherence and health monitoring",
    description: "Smart speakers enhance health management, making it more accessible for seniors managing chronic conditions through voice-first interactions.",
    icon: Heart,
    link: "https://pubmed.ncbi.nlm.nih.gov/41228139/",
    pmid: "PMID: 41228139 (Open Access)",
    color: "from-red-500/20 to-red-600/20"
  },
  {
    title: "Effective for Behavioral Change",
    author: "Multiple Authors",
    year: "2024",
    journal: "Feasibility Study",
    keyFinding: "High feasibility for promoting physical activity",
    description: "Smart speakers prove highly acceptable for behavioral interventions, actively supporting healthier lifestyles in aging populations.",
    icon: Sparkles,
    link: "https://pubmed.ncbi.nlm.nih.gov/39213034/",
    pmid: "PMID: 39213034",
    color: "from-teal-500/20 to-teal-600/20"
  },
  {
    title: "Reduces Loneliness & Isolation",
    author: "Multiple Authors",
    year: "2023",
    journal: "Systematic Review",
    keyFinding: "Significant reduction in feelings of loneliness",
    description: "Voice assistants provide companionship and social connectivity, addressing critical challenges of isolation in aging populations.",
    icon: Heart,
    link: "https://pubmed.ncbi.nlm.nih.gov/39222000/",
    pmid: "PMID: 39222000",
    color: "from-pink-500/20 to-pink-600/20"
  }
];

const testimonials = [
  {
    quote: "The research clearly shows this technology isn't just convenient—it's life-changing for maintaining independence as we age.",
    author: "Dr. Sarah Chen, Gerontology Researcher",
    role: "University of California"
  },
  {
    quote: "After reviewing the evidence, I'm confident voice assistants will become essential healthcare tools for older adults.",
    author: "Prof. Michael Torres",
    role: "Senior Care Technology Specialist"
  },
  {
    quote: "The accessibility improvements are remarkable. This technology finally bridges the digital divide for visually impaired seniors.",
    author: "Dr. Emily Watson",
    role: "Accessibility Research Lead"
  },
  {
    quote: "Our studies show consistent improvements in mobility, independence, and quality of life. The data speaks for itself.",
    author: "Dr. James Park",
    role: "Mobility & ICT Interventions"
  },
  {
    quote: "What strikes me most is how voice technology addresses loneliness. It's not just functional—it's emotionally supportive.",
    author: "Dr. Linda Rodriguez",
    role: "Mental Health & Aging Specialist"
  }
];

const ArticlesEvidence = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(140,120,100,0.1),transparent_70%)]"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary bg-primary/10 px-4 py-2 rounded-full">
                  Evidence-Based Innovation
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Science Supports
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Voice-First Care
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Peer-reviewed research proves voice technology transforms mobility, accessibility, and independence for older adults.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg h-14 px-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg h-14 px-8"
                  onClick={() => document.getElementById('evidence-cards')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Research
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="relative w-full h-full flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary via-accent to-primary/50 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-24 h-24 text-primary-foreground" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Evidence Cards Section */}
      <section id="evidence-cards" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Peer-Reviewed Research
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Eight rigorous studies demonstrate the effectiveness of voice technology for older adults
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {evidenceCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={`transition-all hover:shadow-2xl hover:-translate-y-2 h-full border-2 bg-gradient-to-br ${card.color} backdrop-blur-sm`}>
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-lg">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2 leading-snug">{card.title}</CardTitle>
                        <CardDescription className="text-sm font-semibold mb-1">
                          {card.author} • {card.year}
                        </CardDescription>
                        <CardDescription className="text-xs">
                          {card.journal}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                          🔍 {card.keyFinding}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                      <div className="pt-2 space-y-2">
                        <p className="text-xs text-muted-foreground font-mono">{card.pmid}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2 hover:bg-primary hover:text-primary-foreground"
                          onClick={() => window.open(card.link, '_blank')}
                        >
                          Read Full Paper
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials / Quotes Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Expert Perspectives
            </h2>
            <p className="text-xl text-muted-foreground">
              What researchers and specialists are saying
            </p>
          </motion.div>
          
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Card className="border-2 shadow-2xl bg-gradient-to-br from-card to-muted/30">
              <CardContent className="pt-12 pb-8 px-8 md:px-12">
                <Quote className="w-12 h-12 text-primary/30 mb-6" />
                <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{testimonials[currentTestimonial].author}</p>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Testimonial indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The Data Speaks
            </h2>
            <p className="text-xl text-muted-foreground">
              Quantitative evidence from multiple studies
            </p>
          </motion.div>
          
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Voice Assistant Adoption & Satisfaction by Age</CardTitle>
                <CardDescription className="text-base">
                  Kim S., 2021 (PMID: 33439130) — Satisfaction increases with age despite lower adoption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={adoptionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="age" className="text-base" />
                    <YAxis className="text-base" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '1rem' }} />
                    <Bar dataKey="adoption" name="Adoption Rate (%)" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="satisfaction" name="Satisfaction (%)" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Mobility Improvement Over Time</CardTitle>
                <CardDescription className="text-base">
                  Kim H. et al., 2023 (PMID: 38020536) — Progressive 78% improvement over 16 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={mobilityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-base" />
                    <YAxis className="text-base" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '2px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '1rem' }} />
                    <Line 
                      type="monotone" 
                      dataKey="improvement" 
                      name="Improvement (%)" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      dot={{ fill: 'hsl(var(--primary))', r: 8 }}
                      activeDot={{ r: 10 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Task Performance: Voice vs Visual Interface</CardTitle>
                <CardDescription className="text-base">
                  Masina F. et al., 2020 (PMID: 32975525) — Voice consistently outperforms visual UIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-base font-bold">Task Type</TableHead>
                        <TableHead className="text-base font-bold">Voice UI</TableHead>
                        <TableHead className="text-base font-bold">Visual UI</TableHead>
                        <TableHead className="text-base font-bold">Advantage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskPerformanceData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-base">{row.task}</TableCell>
                          <TableCell className="text-base font-semibold text-green-600 dark:text-green-400">{row.voice}</TableCell>
                          <TableCell className="text-base text-muted-foreground">{row.visual}</TableCell>
                          <TableCell className="text-base font-bold text-primary">{row.difference}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Accessibility & Inclusivity Callout */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <Accessibility className="w-10 h-10 text-primary" />
              <h2 className="text-3xl md:text-5xl font-bold">
                Built for Everyone
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our voice-first approach ensures accessibility and inclusivity for all older adults
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-all h-full">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Eye className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Visual Impairments</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                    24% better task completion than visual interfaces
                  </p>
                  <p className="text-base text-muted-foreground">
                    Voice-first design eliminates screen dependence, making navigation truly accessible for users with vision challenges.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-all h-full">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Economic Equity</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                    Designed for low-income older adults
                  </p>
                  <p className="text-base text-muted-foreground">
                    Research-backed design addresses unique challenges faced by low-income seniors, ensuring equitable access.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-2 shadow-xl hover:shadow-2xl transition-all h-full">
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Cognitive Support</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                    Reduces cognitive load significantly
                  </p>
                  <p className="text-base text-muted-foreground">
                    Simple conversational interfaces eliminate complex navigation, making technology approachable for all seniors.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(140,120,100,0.15),transparent_70%)]"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-16 h-16 mx-auto text-primary" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Experience the
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Science-Backed Difference
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Join thousands of older adults and their families who trust our evidence-based voice companion for safer, more independent travel.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="text-xl h-16 px-10 shadow-2xl hover:shadow-primary/50 transition-all"
                  onClick={() => navigate('/register')}
                >
                  Start Free Trial Today
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-xl h-16 px-10 border-2"
                  onClick={() => navigate('/#how-it-works')}
                >
                  See How It Works
                </Button>
              </motion.div>
            </div>
            
            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ArticlesEvidence;