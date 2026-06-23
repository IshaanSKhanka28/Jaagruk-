export type ComplaintStatus = "submitted" | "in-progress" | "resolved" | "rejected";

export type ComplaintCategory =
  | "pothole"
  | "water-leakage"
  | "streetlight"
  | "garbage"
  | "electrical"
  | "drainage"
  | "other";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  upvotes: number;
  reportedBy: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  stage: string;
  status: "completed" | "active" | "pending";
  description: string;
  timestamp: string;
  agent?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  reportsSubmitted: number;
  reportsResolved: number;
  impactScore: number;
  city: string;
}

export interface DashboardStats {
  totalReports: number;
  resolved: number;
  inProgress: number;
  avgResolutionHours: number;
  citiesActive: number;
  citizensEngaged: number;
}

// --- Category Metadata ---
export const CATEGORY_META: Record<ComplaintCategory, { label: string; icon: string; color: string }> = {
  pothole: { label: "Pothole", icon: "🕳️", color: "var(--color-error)" },
  "water-leakage": { label: "Water Leakage", icon: "💧", color: "var(--color-info)" },
  streetlight: { label: "Broken Streetlight", icon: "💡", color: "var(--color-warning)" },
  garbage: { label: "Garbage", icon: "🗑️", color: "var(--color-success)" },
  electrical: { label: "Electrical", icon: "⚡", color: "var(--color-accent)" },
  drainage: { label: "Drainage", icon: "🌊", color: "var(--color-status-submitted)" },
  other: { label: "Other", icon: "📋", color: "var(--color-muted)" },
};

// --- Status Metadata ---
export const STATUS_META: Record<ComplaintStatus, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-status-submitted text-white" },
  "in-progress": { label: "In Progress", className: "bg-status-in-progress text-white" },
  resolved: { label: "Resolved", className: "bg-status-resolved text-white" },
  rejected: { label: "Rejected", className: "bg-muted/50 text-foreground" },
};

// --- Mock Complaints ---
export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "JGK-2024-001",
    title: "Massive pothole on MG Road near Metro Station",
    description: "A dangerous pothole has formed on the main carriageway of MG Road, approximately 50 meters from the Metro station exit. Multiple two-wheelers have skidded here. The hole is roughly 2 feet wide and 1 foot deep.",
    category: "pothole",
    status: "in-progress",
    location: { address: "MG Road, near Metro Station Exit 2", city: "Bangalore", lat: 12.9716, lng: 77.5946 },
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    upvotes: 47,
    reportedBy: { name: "Priya Sharma", avatar: "PS" },
    createdAt: "2024-12-15T08:30:00Z",
    updatedAt: "2024-12-16T14:20:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: road damage detected with 94% confidence", timestamp: "2024-12-15T08:30:15Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Pothole — Severity: High — Priority: Urgent", timestamp: "2024-12-15T08:30:22Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "completed", description: "Routed to BBMP Roads Division, Ward 86", timestamp: "2024-12-15T08:30:30Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "active", description: "Formal complaint drafted and submitted to BBMP portal", timestamp: "2024-12-15T08:31:00Z", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Awaiting acknowledgment from BBMP", timestamp: "", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-002",
    title: "Water pipeline burst flooding entire street",
    description: "Major water pipeline burst on 5th Cross, Jayanagar. Water has been flowing for 3 hours continuously. Road is submerged and vehicles cannot pass. Nearby shops are getting flooded.",
    category: "water-leakage",
    status: "submitted",
    location: { address: "5th Cross, Jayanagar 4th Block", city: "Bangalore", lat: 12.9250, lng: 77.5938 },
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&h=300&fit=crop",
    upvotes: 89,
    reportedBy: { name: "Rajesh Kumar", avatar: "RK" },
    createdAt: "2024-12-18T11:15:00Z",
    updatedAt: "2024-12-18T11:15:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: water flooding detected with 97% confidence", timestamp: "2024-12-18T11:15:10Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Water Leakage — Severity: Critical — Priority: Emergency", timestamp: "2024-12-18T11:15:18Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "active", description: "Routing to BWSSB Emergency Division", timestamp: "2024-12-18T11:15:25Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "pending", description: "Pending authority routing", timestamp: "", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Awaiting complaint generation", timestamp: "", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-003",
    title: "Streetlight not working for 2 weeks",
    description: "The streetlight at the corner of Park Street and Lane 3 has been non-functional for over 2 weeks. The area becomes pitch dark after 6 PM, making it unsafe for pedestrians especially women and children.",
    category: "streetlight",
    status: "resolved",
    location: { address: "Park Street & Lane 3 Junction", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    upvotes: 34,
    reportedBy: { name: "Anita Desai", avatar: "AD" },
    createdAt: "2024-12-10T19:45:00Z",
    updatedAt: "2024-12-14T10:30:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: non-functional streetlight identified", timestamp: "2024-12-10T19:45:12Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Streetlight — Severity: Medium — Priority: Standard", timestamp: "2024-12-10T19:45:20Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "completed", description: "Routed to BMC Electrical Division, Ward 42", timestamp: "2024-12-10T19:45:28Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "completed", description: "Formal complaint #BMC-E-89234 submitted", timestamp: "2024-12-10T19:46:00Z", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "completed", description: "Streetlight repaired and verified by field team", timestamp: "2024-12-14T10:30:00Z", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-004",
    title: "Overflowing garbage dump near school",
    description: "Garbage dump near St. Mary's School in Koramangala has been overflowing for a week. The stench is unbearable and children are falling sick. Stray dogs and rats are a constant problem.",
    category: "garbage",
    status: "in-progress",
    location: { address: "Near St. Mary's School, Koramangala", city: "Bangalore", lat: 12.9352, lng: 77.6245 },
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop",
    upvotes: 123,
    reportedBy: { name: "Vikram Patel", avatar: "VP" },
    createdAt: "2024-12-12T07:00:00Z",
    updatedAt: "2024-12-17T09:15:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: garbage overflow detected with 99% confidence", timestamp: "2024-12-12T07:00:08Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Garbage — Severity: High — Priority: Urgent (near school)", timestamp: "2024-12-12T07:00:15Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "completed", description: "Routed to BBMP Solid Waste Division + Health Inspector", timestamp: "2024-12-12T07:00:22Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "completed", description: "Dual complaint filed: sanitation + public health", timestamp: "2024-12-12T07:01:00Z", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "active", description: "Cleanup crew dispatched, ETA 2 hours", timestamp: "2024-12-17T09:15:00Z", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-005",
    title: "Exposed electrical wires dangling from pole",
    description: "Live electrical wires hanging from a broken pole on 12th Main Road. Extremely dangerous, especially during rain. Two pedestrians have already received minor shocks.",
    category: "electrical",
    status: "submitted",
    location: { address: "12th Main Road, Indiranagar", city: "Bangalore", lat: 12.9784, lng: 77.6408 },
    imageUrl: "https://images.unsplash.com/photo-1509390144018-eeaf65052242?w=400&h=300&fit=crop",
    upvotes: 156,
    reportedBy: { name: "Mohammed Irfan", avatar: "MI" },
    createdAt: "2024-12-19T16:30:00Z",
    updatedAt: "2024-12-19T16:30:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: exposed electrical hazard — EMERGENCY flagged", timestamp: "2024-12-19T16:30:05Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "active", description: "Category: Electrical — Severity: Critical — Priority: EMERGENCY", timestamp: "2024-12-19T16:30:10Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "pending", description: "Pending classification", timestamp: "", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "pending", description: "Pending routing", timestamp: "", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Pending complaint generation", timestamp: "", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-006",
    title: "Clogged drainage causing street flooding",
    description: "Storm drain at the intersection of Hill Road and Carter Road is completely clogged. Even light rain causes knee-deep water logging. Traffic comes to a standstill.",
    category: "drainage",
    status: "resolved",
    location: { address: "Hill Road & Carter Road Junction", city: "Mumbai", lat: 19.0596, lng: 72.8295 },
    imageUrl: "https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=400&h=300&fit=crop",
    upvotes: 67,
    reportedBy: { name: "Sneha Reddy", avatar: "SR" },
    createdAt: "2024-12-05T14:20:00Z",
    updatedAt: "2024-12-09T16:45:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: waterlogging/drainage blockage", timestamp: "2024-12-05T14:20:10Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Drainage — Severity: High", timestamp: "2024-12-05T14:20:18Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "completed", description: "Routed to BMC Storm Water Division", timestamp: "2024-12-05T14:20:25Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "completed", description: "Complaint #BMC-SW-45123 filed", timestamp: "2024-12-05T14:21:00Z", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "completed", description: "Drain cleared, tested with water flow", timestamp: "2024-12-09T16:45:00Z", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-007",
    title: "Deep pothole on NH-48 service road",
    description: "A massive crater-like pothole has developed on the service road of NH-48 near Electronic City. Several vehicles have been damaged. The pothole is filled with water making it nearly invisible.",
    category: "pothole",
    status: "submitted",
    location: { address: "NH-48 Service Road, Electronic City", city: "Bangalore", lat: 12.8440, lng: 77.6631 },
    imageUrl: "https://images.unsplash.com/photo-1584463699037-bd75a2ee19e9?w=400&h=300&fit=crop",
    upvotes: 201,
    reportedBy: { name: "Arjun Nair", avatar: "AN" },
    createdAt: "2024-12-20T06:45:00Z",
    updatedAt: "2024-12-20T06:45:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: severe road damage detected", timestamp: "2024-12-20T06:45:08Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "active", description: "Processing classification...", timestamp: "2024-12-20T06:45:15Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "pending", description: "Pending classification", timestamp: "", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "pending", description: "Pending routing", timestamp: "", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Pending complaint generation", timestamp: "", agent: "Tracking Agent" },
    ],
  },
  {
    id: "JGK-2024-008",
    title: "Broken water main flooding basement of apartment",
    description: "A water main has cracked under the road in front of Prestige Lakeside Habitat. Water is seeping into the basement parking of the building. Cars are getting submerged.",
    category: "water-leakage",
    status: "in-progress",
    location: { address: "Prestige Lakeside Habitat, Whitefield", city: "Bangalore", lat: 12.9698, lng: 77.7500 },
    imageUrl: "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=300&fit=crop",
    upvotes: 78,
    reportedBy: { name: "Kavitha Menon", avatar: "KM" },
    createdAt: "2024-12-17T22:10:00Z",
    updatedAt: "2024-12-18T08:00:00Z",
    timeline: [
      { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: water damage / flooding", timestamp: "2024-12-17T22:10:12Z", agent: "Vision Agent" },
      { id: "t2", stage: "Issue Classified", status: "completed", description: "Category: Water Leakage — Severity: Critical", timestamp: "2024-12-17T22:10:20Z", agent: "Classification Agent" },
      { id: "t3", stage: "Authority Routed", status: "completed", description: "Routed to BWSSB Emergency + BBMP Flooding Cell", timestamp: "2024-12-17T22:10:28Z", agent: "Routing Agent" },
      { id: "t4", stage: "Complaint Generated", status: "active", description: "Emergency complaint being drafted", timestamp: "2024-12-17T22:11:00Z", agent: "Complaint Agent" },
      { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Awaiting complaint submission", timestamp: "", agent: "Tracking Agent" },
    ],
  },
];

// --- Mock Leaderboard ---
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Vikram Patel", avatar: "VP", reportsSubmitted: 87, reportsResolved: 71, impactScore: 9450, city: "Bangalore" },
  { rank: 2, name: "Sneha Reddy", avatar: "SR", reportsSubmitted: 64, reportsResolved: 58, impactScore: 7820, city: "Mumbai" },
  { rank: 3, name: "Arjun Nair", avatar: "AN", reportsSubmitted: 53, reportsResolved: 45, impactScore: 6340, city: "Bangalore" },
  { rank: 4, name: "Priya Sharma", avatar: "PS", reportsSubmitted: 48, reportsResolved: 39, impactScore: 5670, city: "Bangalore" },
  { rank: 5, name: "Mohammed Irfan", avatar: "MI", reportsSubmitted: 42, reportsResolved: 35, impactScore: 4980, city: "Bangalore" },
  { rank: 6, name: "Anita Desai", avatar: "AD", reportsSubmitted: 38, reportsResolved: 33, impactScore: 4520, city: "Mumbai" },
  { rank: 7, name: "Rajesh Kumar", avatar: "RK", reportsSubmitted: 35, reportsResolved: 28, impactScore: 3890, city: "Bangalore" },
  { rank: 8, name: "Kavitha Menon", avatar: "KM", reportsSubmitted: 31, reportsResolved: 26, impactScore: 3450, city: "Bangalore" },
  { rank: 9, name: "Deepak Verma", avatar: "DV", reportsSubmitted: 27, reportsResolved: 22, impactScore: 2980, city: "Delhi" },
  { rank: 10, name: "Fatima Khan", avatar: "FK", reportsSubmitted: 24, reportsResolved: 20, impactScore: 2650, city: "Mumbai" },
];

// --- Mock Dashboard Stats ---
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalReports: 12847,
  resolved: 9234,
  inProgress: 2156,
  avgResolutionHours: 72,
  citiesActive: 14,
  citizensEngaged: 45230,
};

// --- Mock Category Distribution ---
export const MOCK_CATEGORY_DISTRIBUTION = [
  { category: "Potholes", count: 4210, percentage: 33 },
  { category: "Water Leakage", count: 2570, percentage: 20 },
  { category: "Garbage", count: 2184, percentage: 17 },
  { category: "Streetlights", count: 1670, percentage: 13 },
  { category: "Drainage", count: 1285, percentage: 10 },
  { category: "Electrical", count: 642, percentage: 5 },
  { category: "Other", count: 286, percentage: 2 },
];

// --- Mock Status Distribution ---
export const MOCK_STATUS_DISTRIBUTION = [
  { status: "Resolved", count: 9234, percentage: 72, color: "var(--color-status-resolved)" },
  { status: "In Progress", count: 2156, percentage: 17, color: "var(--color-status-in-progress)" },
  { status: "Submitted", count: 1089, percentage: 8, color: "var(--color-status-submitted)" },
  { status: "Rejected", count: 368, percentage: 3, color: "var(--color-status-rejected)" },
];

// --- Mock City Stats ---
export const MOCK_CITY_STATS = [
  { city: "Bangalore", reports: 4521, resolved: 3380, resolutionRate: 75 },
  { city: "Mumbai", reports: 3890, resolved: 2950, resolutionRate: 76 },
  { city: "Delhi", reports: 2134, resolved: 1420, resolutionRate: 67 },
  { city: "Chennai", reports: 1156, resolved: 892, resolutionRate: 77 },
  { city: "Hyderabad", reports: 1146, resolved: 592, resolutionRate: 52 },
];

// --- Helper ---
export function getComplaintById(id: string): Complaint | undefined {
  return MOCK_COMPLAINTS.find((c) => c.id === id);
}

export function getTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
