import { ChevronRight } from "lucide-react";
import { useState } from "react";

export type NutritionTopic = { id: string; name: string; sub: string; body: string };
export type NutritionSection = { title: string; intro: string; topics: NutritionTopic[] };

export const nutritionSections: NutritionSection[] = [
  {
    title: "Pregnant mothers",
    intro: "Eating well during pregnancy helps your baby grow and keeps you strong. These are the nutrients and foods that matter most.",
    topics: [
      { id: "folic", name: "Folic acid", sub: "Why: helps prevent serious brain and spine birth defects", body: "Start before pregnancy if possible and continue through the first 3 months. Take 400–600 mcg daily. Good sources: dark green leafy vegetables (malo, dodo), beans, lentils, eggs and fortified cereals." },
      { id: "iron", name: "Iron", sub: "Why: makes extra blood for you and your baby, prevents anaemia", body: "Needs almost double during pregnancy. Eat iron-rich foods with vitamin C (orange, mango, tomato, lemon juice) to absorb them better. Sources: lean red meat, liver, beans, dark greens. Avoid tea or coffee with meals — they block iron absorption." },
      { id: "calcium", name: "Calcium & vitamin D", sub: "Why: builds your baby's bones and teeth", body: "Aim for milk, yoghurt, cheese, small fish eaten with bones (mukene/dagaa), and sesame or groundnut paste. Get some sunshine for vitamin D. If you cannot eat dairy daily, ask your clinic about calcium supplements." },
      { id: "protein", name: "Protein", sub: "Why: builds your baby's body, placenta and tissues", body: "Include a protein food at every meal: eggs, fish, chicken, beans, groundnuts, simsim. Eggs and fish are especially rich in nutrients your baby's brain needs." },
      { id: "iodine", name: "Iodine", sub: "Why: needed for your baby's brain development", body: "Use iodised salt in cooking. Seaweed, fish and dairy also provide iodine. Low iodine in pregnancy is a leading preventable cause of learning difficulties." },
      { id: "foods-avoid", name: "Foods and drinks to avoid", sub: "What can harm your baby during pregnancy", body: "No alcohol at all — it can cause lifelong birth defects. Limit caffeine (max 1–2 cups of coffee a day). Avoid raw or undercooked meat, fish and eggs; unpasteurised milk and soft cheeses; high-mercury fish (shark, swordfish, king mackerel); and liver more than once a week (too much vitamin A)." },
      { id: "morning-sick", name: "Morning sickness tips", sub: "Eating when you feel nauseated", body: "Eat small amounts often instead of large meals. Keep plain crackers by your bed for the morning. Ginger tea or ginger in food can settle the stomach. Drink fluids between meals rather than with them. Tell your clinic if you cannot keep food down for a day or more." },
      { id: "weight", name: "Healthy weight gain", sub: "How much to gain during pregnancy", body: "Most women gain 11–16 kg in total, less if starting overweight. Gain gradually: little in the first 3 months, then about half a kilo per week later on. Eat to hunger — 'eating for two' means doubling nutrients, not portion size. Ask your clinic to track your weight at visits." },
    ],
  },
  {
    title: "Babies",
    intro: "The first two years shape your child's growth and brain for life. Here is what to feed — and what to hold off on — at every stage.",
    topics: [
      { id: "breastfeed", name: "Breast milk: first 6 months", sub: "Breast milk alone gives your baby everything needed", body: "Feed only breast milk from birth to 6 months — no water, juice or porridge yet. Feed whenever your baby is hungry (8–12 times a day). Colostrum, the first thick yellow milk, protects against illness: give it within the first hour. Continue breastfeeding alongside solids until 2 years." },
      { id: "vitamin-d", name: "Vitamin D drops", sub: "Why: breast milk is low in vitamin D", body: "From the first days, give 400 IU (10 mcg) of vitamin D drops daily for breastfed babies. It helps bones grow straight and strong and prevents rickets. Ask your clinic for drops if you don't have them." },
      { id: "solids", name: "Starting solid foods (around 6 months)", sub: "Signs your baby is ready and how to begin", body: "Start when your baby can sit with support, watches you eat and takes food to the mouth. Begin with thick, smooth iron-rich porridge, mashed beans or well-cooked mashed vegetables. Give 2–3 meals a day at 6–8 months, 3–4 meals plus snacks at 9–11 months. Keep breastfeeding as the main milk." },
      { id: "iron-foods", name: "Iron-rich first foods", sub: "Why: a baby's iron stores run out at about 6 months", body: "Iron-poor diets in infancy are the most common cause of anaemia. Offer iron-fortified porridge, pureed meat or liver, mashed beans and lentils, and egg yolk from around 6 months. Pair with fruit or vegetables for better absorption." },
      { id: "allergens", name: "Introducing common allergens", sub: "Eggs, fish, peanut — early is safer than late", body: "Introduce one new food at a time and wait 2–3 days before the next, so you can spot a reaction. Introduce peanut (as smooth paste, never whole nuts), egg and fish early and regularly — delaying them can increase allergy risk. Stop and see a health worker if there is a rash, swelling, vomiting or trouble breathing." },
      { id: "no-honey", name: "Foods to avoid under 1 year", sub: "What is not safe for babies yet", body: "No honey (risk of infant botulism) — not even in porridge. No cow's milk as the main drink before 1 year (small amounts in food are fine). No whole nuts, hard pieces or round foods like whole grapes (choking). No added salt or sugar. No juice or soda." },
      { id: "responsive", name: "Follow your baby's hunger cues", sub: "How to know when to feed and when to stop", body: "Lean in, open the mouth and reach for food means hungry; turning away, closing the mouth or pushing food away means full. Never force-feed — responsive feeding builds healthy appetite habits. If your baby refuses a new food, try again another day; it can take 8–10 tries." },
      { id: "sick", name: "Feeding a sick baby", sub: "What to do when your baby is unwell", body: "Keep breastfeeding — it is the best fluid and comfort during illness. Offer extra small feeds and more fluids after any episode of diarrhoea or vomiting. After illness, offer one extra meal a day until weight is back. See a health worker if your baby refuses all feeds, is very drowsy or has no wet nappies for many hours." },
    ],
  },
  {
    title: "Toddlers (1–5 years)",
    intro: "Growing children need small, frequent, varied meals. Family foods, cut and softened, are the best meals.",
    topics: [
      { id: "toddler-meals", name: "Meals and snacks", sub: "How often a young child should eat", body: "Offer 3 meals and 1–2 healthy snacks every day. Use family foods — matooke, posho, rice, beans, greens, fish, eggs — mashed or cut small. Keep breastfeeding up to 2 years or beyond if you and your child wish." },
      { id: "food-groups", name: "A colourful plate", sub: "Mix food groups at every meal", body: "Aim for a staple (posho, rice, sweet potato), a protein (beans, eggs, fish, meat, groundnut paste), and a fruit or vegetable (pawpaw, mango, dodo, carrots). Different colours mean different vitamins." },
      { id: "vitamin-a", name: "Vitamin A", sub: "Why: protects eyes and fights infection", body: "Orange and yellow foods — orange sweet potato, pumpkin, carrots, pawpaw, mango — and dark greens are rich in vitamin A. Children from 6 months receive vitamin A drops at clinic every 6 months; bring your child for each dose." },
      { id: "drinks", name: "Healthy drinks", sub: "Water and milk, not soda", body: "Give clean, boiled or treated water and milk. Avoid soda, sweetened juice and sugary tea — they spoil teeth and fill the stomach without nutrients." },
      { id: "picky", name: "Fussy eating", sub: "Patience works better than pressure", body: "It is normal for toddlers to refuse foods. Eat together, offer small portions, and keep offering refused foods calmly. Don't reward with sweets. See your clinic if your child is losing weight or growth falls behind." },
    ],
  },
  {
    title: "Everyday family health",
    intro: "Good hygiene and safe food protect the whole family from illness.",
    topics: [
      { id: "anaemia", name: "Preventing anaemia", sub: "Signs and simple food habits", body: "Pale palms or eyelids, tiredness and breathlessness can mean anaemia. Eat iron foods with vitamin C, keep up deworming at clinic, and sleep under a mosquito net to prevent malaria, a major cause of anaemia." },
      { id: "hygiene", name: "Safe food and water", sub: "Stop diarrhoea before it starts", body: "Wash hands with soap before cooking, before feeding a child and after the toilet. Boil drinking water, cover food, and wash fruit and vegetables. Reheat leftovers until steaming and eat cooked food the same day." },
      { id: "ors", name: "Diarrhoea: ORS and zinc", sub: "What to give at home", body: "Give oral rehydration solution (ORS) after each loose stool and zinc tablets for 10–14 days as advised by a health worker. Keep feeding. Go to clinic urgently for blood in stool, sunken eyes, or a child who cannot drink." },
      { id: "growth", name: "Growth monitoring", sub: "Weigh and measure at clinic visits", body: "Ask your clinic to record your child's weight and height at every visit. A flat or falling line on the growth chart is an early warning — act early with your health worker." },
      { id: "breastfeeding-mother", name: "Food for breastfeeding mothers", sub: "Eat and drink more while breastfeeding", body: "Eat an extra small meal each day and drink water whenever thirsty. Continue iodised salt and a variety of foods. Avoid alcohol; limit caffeine." },
    ],
  },
];

export function TopicRow({ t }: { t: NutritionTopic }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <div className="font-bold">{t.name}</div>
          <div className="text-sm text-muted-foreground">{t.sub}</div>
        </div>
        <ChevronRight className={`mt-1 h-4 w-4 flex-none text-primary transition ${open ? "rotate-90" : ""}`} aria-label={open ? "Collapse" : "Expand"} />
      </button>
      {open && <p className="mt-3 border-t pt-3 text-sm leading-relaxed">{t.body}</p>}
    </div>
  );
}

export function NutritionGuide() {
  return (
    <div>
      {nutritionSections.map((s) => (
        <div key={s.title} className="mb-6">
          <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">{s.title.toUpperCase()}</div>
          <p className="mb-3 rounded-2xl bg-primary p-4 text-sm leading-relaxed text-primary-foreground">{s.intro}</p>
          <div className="space-y-2">{s.topics.map((t) => <TopicRow key={t.id} t={t} />)}</div>
        </div>
      ))}
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <div className="font-bold">Not medical advice</div>
        <p className="mt-1 text-sm text-muted-foreground">This is general guidance. For your own situation — anaemia, allergies, twin pregnancy or a special diet — ask your doctor or clinic nurse.</p>
      </div>
    </div>
  );
}
