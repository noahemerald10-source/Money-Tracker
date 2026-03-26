export interface TransactionTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
  subcategory?: string;
  description?: string;
  type: "income" | "expense";
  necessityLabel: "need" | "want" | "waste";
  financeMode: "personal" | "business";
  isRecurring: boolean;
  frequency: "weekly" | "fortnightly" | "monthly" | "quarterly" | "yearly" | null;
  amountHint: string;
}

export interface TemplateGroup {
  id: string;
  label: string;
  templates: TransactionTemplate[];
}

export const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    id: "housing",
    label: "🏠 Housing",
    templates: [
      { id: "rent",          name: "Rent / Mortgage",   emoji: "🏠", category: "Housing",  subcategory: "Rent",           type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$800–$3,000/mo" },
      { id: "electricity",   name: "Electricity & Gas",  emoji: "⚡", category: "Utilities", subcategory: "Electricity",    type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$80–$200/mo" },
      { id: "water",         name: "Water Bill",          emoji: "💧", category: "Utilities", subcategory: "Water",          type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "quarterly", amountHint: "$50–$150/qtr" },
      { id: "internet",      name: "Internet",            emoji: "📡", category: "Utilities", subcategory: "Internet",       type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$60–$120/mo" },
      { id: "home-insurance",name: "Home Insurance",      emoji: "🛡️", category: "Housing",  subcategory: "Insurance",      type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$80–$200/mo" },
      { id: "council-rates", name: "Council Rates",       emoji: "🏛️", category: "Housing",  subcategory: "Council Rates",  type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "quarterly", amountHint: "$300–$600/qtr" },
    ],
  },
  {
    id: "transport",
    label: "🚗 Transport",
    templates: [
      { id: "car-registration", name: "Car Registration",  emoji: "📋", category: "Transport", subcategory: "Registration", type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "yearly",    amountHint: "$200–$800/yr" },
      { id: "car-insurance",    name: "Car Insurance",     emoji: "🛡️", category: "Transport", subcategory: "Insurance",    type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$80–$200/mo" },
      { id: "petrol",           name: "Petrol / Fuel",     emoji: "⛽", category: "Transport", subcategory: "Fuel",         type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$40–$120/fill" },
      { id: "rideshare",        name: "Uber / Rideshare",  emoji: "🚕", category: "Transport", subcategory: "Rideshare",    type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$10–$40/trip" },
      { id: "public-transport", name: "Public Transport",  emoji: "🚌", category: "Transport", subcategory: "Transit",      type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "weekly",    amountHint: "$30–$60/wk" },
    ],
  },
  {
    id: "food",
    label: "🛒 Food",
    templates: [
      { id: "groceries",     name: "Groceries",            emoji: "🛒", category: "Groceries", subcategory: "Groceries",    type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "weekly",    amountHint: "$80–$200/wk" },
      { id: "dining-out",    name: "Dining Out",           emoji: "🍽️", category: "Dining",    subcategory: "Restaurant",   type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$20–$80/visit" },
      { id: "coffee",        name: "Coffee",               emoji: "☕", category: "Dining",    subcategory: "Coffee",       type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$4–$8/cup" },
      { id: "meal-delivery", name: "Meal Delivery",        emoji: "📦", category: "Dining",    subcategory: "Delivery",     type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$15–$50/order" },
    ],
  },
  {
    id: "health",
    label: "💊 Health",
    templates: [
      { id: "gym",              name: "Gym Membership",    emoji: "🏋️", category: "Health",        subcategory: "Gym",           type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$30–$100/mo" },
      { id: "health-insurance", name: "Health Insurance",  emoji: "🏥", category: "Health",        subcategory: "Insurance",     type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",   amountHint: "$100–$400/mo" },
      { id: "pharmacy",         name: "Pharmacy",          emoji: "💊", category: "Health",        subcategory: "Pharmacy",      type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$10–$60/visit" },
      { id: "doctor",           name: "Doctor Visit",      emoji: "🩺", category: "Health",        subcategory: "Medical",       type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,        amountHint: "$20–$100/visit" },
    ],
  },
  {
    id: "subscriptions",
    label: "📱 Subscriptions",
    templates: [
      { id: "netflix",     name: "Netflix",          emoji: "🎬", category: "Subscriptions", subcategory: "Streaming",    type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$10–$23/mo" },
      { id: "spotify",     name: "Spotify",          emoji: "🎵", category: "Subscriptions", subcategory: "Music",        type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$10–$17/mo" },
      { id: "disney-plus", name: "Disney+",          emoji: "✨", category: "Subscriptions", subcategory: "Streaming",    type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$8–$14/mo" },
      { id: "apple-tv",    name: "Apple TV+",        emoji: "🍎", category: "Subscriptions", subcategory: "Streaming",    type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$9/mo" },
      { id: "youtube",     name: "YouTube Premium",  emoji: "▶️", category: "Subscriptions", subcategory: "Streaming",    type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$14–$23/mo" },
      { id: "claude-pro",  name: "Claude Pro",       emoji: "🤖", category: "Subscriptions", subcategory: "AI",           type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$20/mo" },
      { id: "adobe",       name: "Adobe Creative",   emoji: "🎨", category: "Subscriptions", subcategory: "Software",     type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: true, frequency: "monthly", amountHint: "$55–$90/mo" },
      { id: "microsoft365",name: "Microsoft 365",    emoji: "💼", category: "Subscriptions", subcategory: "Software",     type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true, frequency: "yearly",  amountHint: "$100–$150/yr" },
    ],
  },
  {
    id: "income",
    label: "💰 Income",
    templates: [
      { id: "salary",      name: "Salary / Wages",       emoji: "💼", category: "Salary",      subcategory: "Wages",         type: "income", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "fortnightly", amountHint: "Your pay cycle amount" },
      { id: "freelance",   name: "Freelance Payment",    emoji: "💻", category: "Freelance",   subcategory: "Project",       type: "income", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,          amountHint: "Varies per project" },
      { id: "govt-payment",name: "Government Payment",   emoji: "🏛️", category: "Other Income", subcategory: "Government",   type: "income", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "fortnightly", amountHint: "Varies" },
      { id: "rental",      name: "Rental Income",        emoji: "🏠", category: "Other Income", subcategory: "Rental",       type: "income", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly",     amountHint: "$500–$2,000/mo" },
      { id: "side-income", name: "Side Income",          emoji: "💡", category: "Other Income", subcategory: "Side Hustle",  type: "income", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,          amountHint: "Varies" },
    ],
  },
  {
    id: "savings",
    label: "🏦 Savings",
    templates: [
      { id: "savings-transfer", name: "Savings Transfer",         emoji: "🏦", category: "Other", subcategory: "Savings",       type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly", amountHint: "$50–$500/mo",  description: "Transfer to savings account" },
      { id: "investment",       name: "Investment Contribution",  emoji: "📈", category: "Other", subcategory: "Investments",   type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly", amountHint: "$50–$500/mo",  description: "ETF / shares / crypto" },
      { id: "emergency-fund",   name: "Emergency Fund",           emoji: "🛡️", category: "Other", subcategory: "Emergency",     type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly", amountHint: "$50–$300/mo",  description: "Building emergency fund" },
    ],
  },
  {
    id: "other",
    label: "✨ Other",
    templates: [
      { id: "phone-plan",    name: "Phone Plan",       emoji: "📱", category: "Utilities",    subcategory: "Phone",         type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: true,  frequency: "monthly", amountHint: "$20–$60/mo" },
      { id: "pet-expenses",  name: "Pet Expenses",     emoji: "🐾", category: "Other",        subcategory: "Pets",          type: "expense", necessityLabel: "need", financeMode: "personal", isRecurring: false, frequency: null,      amountHint: "$30–$200/visit" },
      { id: "clothing",      name: "Clothing",         emoji: "👕", category: "Shopping",     subcategory: "Clothing",      type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,      amountHint: "$20–$200/item" },
      { id: "personal-care", name: "Personal Care",    emoji: "💆", category: "Shopping",     subcategory: "Personal Care", type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,      amountHint: "$15–$80/visit" },
      { id: "entertainment", name: "Entertainment",    emoji: "🎭", category: "Entertainment", subcategory: "Events",       type: "expense", necessityLabel: "want", financeMode: "personal", isRecurring: false, frequency: null,      amountHint: "$20–$100/outing" },
    ],
  },
];

export const ALL_TEMPLATES: TransactionTemplate[] = TEMPLATE_GROUPS.flatMap((g) => g.templates);

export const NECESSITY_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  need:  { label: "Essential",    color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  want:  { label: "Nice to Have", color: "#9CA3AF", bg: "rgba(156,163,175,0.1)" },
  waste: { label: "Wasteful",     color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};
