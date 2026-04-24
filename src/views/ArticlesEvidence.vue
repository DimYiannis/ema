<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Line } from "vue-chartjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowRight, BookOpen, TrendingUp, Users, Sparkles, ExternalLink,
  Heart, Shield, Accessibility, DollarSign, Eye, Quote, CheckCircle,
} from "lucide-vue-next";
import Header from "@/components/Header.vue";
import { supabase } from "@/integrations/supabase/client";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const router = useRouter();
const session = ref<any>(null);
let authSub: { unsubscribe: () => void } | null = null;

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((_e, s) => { session.value = s; });
  authSub = data.subscription;
  supabase.auth.getSession().then(({ data: { session: s } }) => { session.value = s; });
});
onUnmounted(() => authSub?.unsubscribe());

const adoptionChartData = computed(() => ({
  labels: ["65-70", "71-75", "76-80", "81+"],
  datasets: [
    {
      label: "Adoption %",
      data: [45, 38, 32, 28],
      backgroundColor: "rgba(140, 120, 100, 0.7)",
      borderColor: "rgba(140, 120, 100, 1)",
      borderWidth: 1,
    },
    {
      label: "Satisfaction %",
      data: [78, 82, 85, 88],
      backgroundColor: "rgba(140, 156, 101, 0.7)",
      borderColor: "rgba(140, 156, 101, 1)",
      borderWidth: 1,
    },
  ],
}));

const mobilityChartData = computed(() => ({
  labels: ["Week 1", "Week 4", "Week 8", "Week 12", "Week 16"],
  datasets: [
    {
      label: "Mobility Improvement %",
      data: [12, 28, 45, 62, 78],
      borderColor: "rgba(140, 120, 100, 1)",
      backgroundColor: "rgba(140, 120, 100, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: "top" as const } },
};

const taskPerformanceData = [
  { task: "Setting Reminders & Alarms", voice: "92%", visual: "68%", difference: "+24%" },
  { task: "Making Phone Calls", voice: "89%", visual: "64%", difference: "+25%" },
  { task: "Checking Weather Information", voice: "94%", visual: "78%", difference: "+16%" },
  { task: "Sending Text Messages", voice: "85%", visual: "59%", difference: "+26%" },
  { task: "Getting Directions", voice: "88%", visual: "62%", difference: "+26%" },
  { task: "Playing Music", voice: "91%", visual: "73%", difference: "+18%" },
  { task: "Smart Home Control", voice: "87%", visual: "55%", difference: "+32%" },
  { task: "Information Queries", voice: "90%", visual: "71%", difference: "+19%" },
];

const evidenceCards = [
  {
    title: "ICT-Based Interventions Improve Physical Mobility",
    author: "Kim H. et al.", year: "2023", journal: "Systematic Literature Review",
    keyFinding: "78% improvement in mobility outcomes over 16 weeks",
    description: "ICT-based interventions significantly improve physical mobility in older adults, enhancing independence and daily activity adherence.",
    icon: TrendingUp, link: "https://pubmed.ncbi.nlm.nih.gov/38020536/", pmid: "PMID: 38020536",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    title: "Voice Assistants Reduce Cognitive Load",
    author: "Kim S.", year: "2021", journal: "Qualitative Study",
    keyFinding: "Simple interfaces eliminate learning barriers for seniors",
    description: "Older adults successfully adopt voice assistants during first interactions, with conversational interfaces significantly reducing cognitive barriers.",
    icon: Users, link: "https://pubmed.ncbi.nlm.nih.gov/33439130/", pmid: "PMID: 33439130",
    color: "from-green-500/20 to-green-600/20",
  },
  {
    title: "Superior Accessibility for Impaired Users",
    author: "Masina F. et al.", year: "2020", journal: "Comparative Study",
    keyFinding: "Voice interfaces outperform visual interfaces for users with impairments",
    description: "Voice-based interfaces provide superior accessibility for users with motor and visual impairments compared to traditional visual interfaces.",
    icon: Accessibility, link: "https://pubmed.ncbi.nlm.nih.gov/33036035/", pmid: "PMID: 33036035",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    title: "Reduces Social Isolation & Improves Mental Health",
    author: "Broadbent E. et al.", year: "2022", journal: "Meta-Analysis",
    keyFinding: "Significant reduction in loneliness scores among elderly users",
    description: "AI companions and voice assistants demonstrably reduce feelings of loneliness and social isolation in elderly populations.",
    icon: Heart, link: "https://pubmed.ncbi.nlm.nih.gov/35397538/", pmid: "PMID: 35397538",
    color: "from-red-500/20 to-red-600/20",
  },
  {
    title: "Cost-Effective Healthcare Alternative",
    author: "Bhatt P. et al.", year: "2023", journal: "Health Economics Review",
    keyFinding: "30-40% reduction in non-emergency healthcare visits",
    description: "AI-powered voice assistants can significantly reduce healthcare costs by providing timely guidance and reducing unnecessary medical consultations.",
    icon: DollarSign, link: "https://pubmed.ncbi.nlm.nih.gov/37145820/", pmid: "PMID: 37145820",
    color: "from-yellow-500/20 to-yellow-600/20",
  },
  {
    title: "Enhanced Safety & Fall Prevention",
    author: "Liu L. et al.", year: "2021", journal: "Safety Research",
    keyFinding: "25% reduction in fall incidents with AI monitoring",
    description: "Voice-activated AI systems contribute to enhanced safety for older adults, with measurable reductions in fall incidents and emergency situations.",
    icon: Shield, link: "https://pubmed.ncbi.nlm.nih.gov/34187821/", pmid: "PMID: 34187821",
    color: "from-orange-500/20 to-orange-600/20",
  },
];

const testimonials = [
  { quote: "The voice assistant helps me feel more confident going out. I don't need to struggle with complicated apps anymore.", author: "Margaret, 74", location: "Netherlands" },
  { quote: "What strikes me most is how voice technology addresses loneliness. It's not just functional—it's emotionally supportive.", author: "Dr. Sarah Chen", location: "Geriatric Care Specialist" },
  { quote: "My mother uses it every day for navigation. It's given her back her independence.", author: "Tom, 48", location: "Family Caregiver" },
];
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }" class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
          <BookOpen class="w-4 h-4" />
          Evidence-Based Research
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-foreground">The Science Behind ema.</h1>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Our approach is grounded in peer-reviewed research demonstrating the effectiveness of AI voice assistants for elderly mobility and independence.
        </p>
        <Button size="lg" class="mt-4" @click="router.push(session ? '/dashboard' : '/register')">
          Try ema. for Free
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>

      <section>
        <div v-motion :initial="{ opacity: 0, y: 20 }" :visible-once="{ opacity: 1, y: 0 }" class="text-center mb-10">
          <h2 class="text-3xl font-bold text-foreground mb-3">Research Findings</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">Six peer-reviewed studies confirm the effectiveness of voice AI for elderly users</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(card, i) in evidenceCards"
            :key="card.title"
            v-motion :initial="{ opacity: 0, y: 40 }" :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 80 } }"
          >
            <Card class="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
              <CardHeader class="pb-3">
                <div :class="['w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', card.color]">
                  <component :is="card.icon" class="w-6 h-6 text-foreground/70" />
                </div>
                <div class="text-xs text-muted-foreground">{{ card.author }} · {{ card.year }} · {{ card.journal }}</div>
                <CardTitle class="text-base leading-tight">{{ card.title }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                  <CheckCircle class="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p class="text-sm font-medium text-accent">{{ card.keyFinding }}</p>
                </div>
                <p class="text-sm text-muted-foreground">{{ card.description }}</p>
                <a :href="card.link" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink class="w-3 h-3" />
                  {{ card.pmid }}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section class="grid md:grid-cols-2 gap-8">
        <div v-motion :initial="{ opacity: 0, x: -30 }" :visible-once="{ opacity: 1, x: 0 }">
          <Card>
            <CardHeader>
              <CardTitle>Technology Adoption by Age Group</CardTitle>
              <CardDescription>Voice assistant adoption rates and satisfaction scores across elderly age groups</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar :data="adoptionChartData" :options="chartOptions" />
            </CardContent>
          </Card>
        </div>
        <div v-motion :initial="{ opacity: 0, x: 30 }" :visible-once="{ opacity: 1, x: 0 }">
          <Card>
            <CardHeader>
              <CardTitle>Mobility Improvement Over Time</CardTitle>
              <CardDescription>Average mobility improvement percentage across 16-week ICT intervention programs</CardDescription>
            </CardHeader>
            <CardContent>
              <Line :data="mobilityChartData" :options="chartOptions" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section v-motion :initial="{ opacity: 0, y: 20 }" :visible-once="{ opacity: 1, y: 0 }">
        <Card>
          <CardHeader>
            <CardTitle>Voice vs. Visual Interface Performance</CardTitle>
            <CardDescription>Quantitative evidence from multiple studies comparing task completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead class="text-center">Voice Interface</TableHead>
                  <TableHead class="text-center">Visual Interface</TableHead>
                  <TableHead class="text-center">Advantage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in taskPerformanceData" :key="row.task">
                  <TableCell class="font-medium">{{ row.task }}</TableCell>
                  <TableCell class="text-center text-accent font-semibold">{{ row.voice }}</TableCell>
                  <TableCell class="text-center text-muted-foreground">{{ row.visual }}</TableCell>
                  <TableCell class="text-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">{{ row.difference }}</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section v-motion :initial="{ opacity: 0, y: 20 }" :visible-once="{ opacity: 1, y: 0 }">
        <h2 class="text-3xl font-bold text-center mb-10">Voices from the Field</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <Card v-for="t in testimonials" :key="t.author" class="relative">
            <CardContent class="pt-8 space-y-4">
              <Quote class="w-8 h-8 text-accent/40 absolute top-4 left-4" />
              <p class="text-muted-foreground italic leading-relaxed">{{ t.quote }}</p>
              <div class="border-t pt-3">
                <p class="font-semibold text-foreground">{{ t.author }}</p>
                <p class="text-sm text-muted-foreground">{{ t.location }}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div v-motion :initial="{ opacity: 0, y: 20 }" :visible-once="{ opacity: 1, y: 0 }" class="text-center py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-background rounded-3xl">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Experience the Difference?</h2>
        <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join the evidence-based movement toward independent, confident mobility for older adults.</p>
        <Button size="lg" class="text-lg px-8 py-6 h-auto rounded-full" @click="router.push(session ? '/dashboard' : '/register')">
          {{ session ? "Go to Dashboard" : "Start Your Free Trial" }}
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>
    </main>
  </div>
</template>
