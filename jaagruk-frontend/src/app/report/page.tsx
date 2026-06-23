"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/hooks/useAccessibility";
import {
  MapPin,
  Camera,
  FolderOpen,
  FileText,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Loader2,
  Trash2,
  AlertCircle,
  Eye,
  Zap,
  Building2,
  Clock,
} from "lucide-react";
import { CATEGORY_META, ComplaintCategory } from "@/lib/mock-data";

const STEPS = [
  { id: "location", title: "Location", icon: MapPin },
  { id: "category", title: "Category", icon: FolderOpen },
  { id: "photo", title: "Photo", icon: Camera },
  { id: "details", title: "Details", icon: FileText },
];

export default function ReportPage() {
  const router = useRouter();
  const { screenReader, reducedMotion } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [pinCoords, setPinCoords] = useState({ x: 50, y: 50 }); // percentages on map
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Submission & AI pipeline simulation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // Auto-fill coordinates & address mock simulation
  useEffect(() => {
    if (address === "") {
      setAddress("12th Main Road, Hal 2nd Stage, Indiranagar");
    }
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPinCoords({ x, y });
    setAddress(`Plot ${Math.floor(x * 5)}, ${city === "Bangalore" ? "Indiranagar" : "Juhu"}, ${city}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoName("");
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !address || !title || !description) return;

    setIsSubmitting(true);
    setPipelineStep(0);

    // Simulate AI pipeline progression
    const intervals = [1200, 1500, 1500, 1200];
    for (let i = 0; i < intervals.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervals[i]));
      setPipelineStep((prev) => prev + 1);
    }

    const randomIdNum = Math.floor(100 + Math.random() * 900);
    const newId = `JGK-2026-${randomIdNum}`;
    
    const customComplaint = {
      id: newId,
      title,
      description,
      category,
      status: "submitted",
      location: { address, city, lat: 12.9716, lng: 77.5946 },
      imageUrl: photo || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
      upvotes: 1,
      reportedBy: { name: "You (Citizen)", avatar: "U" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { id: "t1", stage: "Image Validated", status: "completed", description: "AI confirmed: issue detected with high confidence", timestamp: new Date().toISOString(), agent: "Vision Agent" },
        { id: "t2", stage: "Issue Classified", status: "completed", description: `Category: ${category} — Priority: High`, timestamp: new Date().toISOString(), agent: "Classification Agent" },
        { id: "t3", stage: "Authority Routed", status: "active", description: "Routing to the designated Ward Officer", timestamp: new Date().toISOString(), agent: "Routing Agent" },
        { id: "t4", stage: "Complaint Generated", status: "pending", description: "Pending routing", timestamp: "", agent: "Complaint Agent" },
        { id: "t5", stage: "Resolution Tracking", status: "pending", description: "Pending complaint filing", timestamp: "", agent: "Tracking Agent" },
      ],
    };
    
    sessionStorage.setItem(newId, JSON.stringify(customComplaint));
    router.push(`/report/${newId}`);
  };

  const isStepValid = () => {
    if (currentStep === 0) return address.trim() !== "";
    if (currentStep === 1) return category !== "";
    if (currentStep === 2) return photo !== null;
    if (currentStep === 3) return title.trim() !== "" && description.trim() !== "";
    return false;
  };

  const transitionVars = reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12">
      <AnimatePresence mode="wait">
        {!isSubmitting ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={transitionVars}
            className="bg-surface border border-border rounded-lg p-6 md:p-8 shadow-sm"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Title */}
            <h1 className="text-2xl font-bold mb-2 text-foreground tracking-tight">Report a Civic Issue</h1>
            <p className="text-sm text-muted mb-8 leading-relaxed">
              Complete the steps below. The AI pipeline will validate and file it instantly.
            </p>

            {/* Segmented Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {STEPS[currentStep].title}
                </span>
              </div>
              <div className="flex gap-2 h-1.5 w-full bg-border rounded-full overflow-hidden">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`h-full flex-1 rounded-full transition-all duration-normal ${
                      idx <= currentStep ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Steps */}
            <div className="min-h-[280px] mb-8">
              {/* STEP 1: LOCATION */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transitionVars}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Select City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-12 px-3 rounded-sm border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus:outline-none text-foreground transition-all cursor-pointer"
                      aria-label={screenReader ? "Select active city for the issue report" : "Select city"}
                      role="combobox"
                    >
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Drop Pin on Map</label>
                    <p className="text-xs text-muted mb-2">Click anywhere on the grid below to simulate location mapping.</p>
                    <div
                      onClick={handleMapClick}
                      className="w-full h-44 border border-border bg-background/50 rounded-sm relative overflow-hidden cursor-crosshair group flex items-center justify-center"
                      style={{
                        backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                      role="application"
                      aria-label="Simulation grid map coordinate planner"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/10 to-transparent pointer-events-none" />
                      
                      {/* Simple mock streets */}
                      <div className="absolute left-[30%] top-0 w-4 h-full bg-border/20" />
                      <div className="absolute left-[70%] top-0 w-4 h-full bg-border/20" />
                      <div className="absolute left-0 top-[40%] w-full h-4 bg-border/20" />
                      
                      <div className="absolute text-[10px] text-muted bottom-2 right-2 font-mono select-none">
                        LAT: {(12.9 + pinCoords.y / 1000).toFixed(4)}, LNG: {(77.5 + pinCoords.x / 1000).toFixed(4)}
                      </div>

                      {/* Drop Pin */}
                      <motion.div
                        animate={reducedMotion ? {} : { y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute text-accent"
                        style={{ left: `${pinCoords.x}%`, top: `${pinCoords.y}%`, transform: "translate(-50%, -100%)", willChange: "transform" }}
                      >
                        <MapPin className="w-8 h-8 fill-accent/20" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Detected Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 12th Main Road, Indiranagar"
                      className="w-full h-12 px-3 rounded-sm border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus:outline-none text-foreground transition-all"
                      aria-label={screenReader ? "Confirm or write the detected address location details" : "Street address"}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CATEGORY */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transitionVars}
                  className="space-y-4"
                >
                  <label className="text-sm font-semibold text-foreground">Select Issue Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Anomaly category selection">
                    {Object.entries(CATEGORY_META).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key as ComplaintCategory)}
                        className={`flex items-center gap-4 p-4 rounded-sm border text-left transition-all duration-fast min-h-[56px] select-none ${
                          category === key
                            ? "border-primary bg-primary-subtle text-foreground shadow-sm font-bold"
                            : "border-border bg-background hover:bg-surface-raised"
                        }`}
                        role="radio"
                        aria-checked={category === key}
                        aria-label={screenReader ? `Select issue category ${value.label}` : value.label}
                      >
                        <span className="text-2xl select-none">{value.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{value.label}</div>
                          <div className="text-xs text-muted">Civic issue category</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PHOTO */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transitionVars}
                  className="space-y-6"
                >
                  <label className="text-sm font-semibold text-foreground">Attach Photograph</label>
                  <p className="text-xs text-muted mb-4 leading-normal">
                    Take or upload a high-quality photo. AI will scan this photo to validate the report.
                  </p>

                  {!photo ? (
                    <div className="border-2 border-dashed border-border rounded-sm bg-background p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors relative min-h-[160px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        aria-label={screenReader ? "Select and upload a civic issue photograph from your device" : "Upload photo"}
                      />
                      <Upload className="w-10 h-10 text-muted mb-4 pointer-events-none" />
                      <p className="font-semibold text-sm mb-1 text-foreground pointer-events-none">Click to upload photo</p>
                      <p className="text-xs text-muted pointer-events-none">Supports JPG, PNG up to 5MB</p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-sm bg-background p-4 relative flex flex-col items-center">
                      <img
                        src={photo}
                        alt="Uploaded preview"
                        className="w-full max-h-56 object-cover rounded-sm border border-border mb-4 select-none"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono text-muted truncate max-w-[80%]">
                          {photoName || "image_upload.png"}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="w-10 h-10 flex items-center justify-center text-error hover:bg-error/10 rounded-sm transition-colors"
                          aria-label={screenReader ? "Delete current attached image and upload a new one" : "Remove photo"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Preset Photos (For ease of mock testing) */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-xs text-muted font-bold block mb-1">Or use a sample image:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&fit=crop");
                          setPhotoName("pothole_sample.jpg");
                        }}
                        className="text-xs font-semibold border border-border px-4 py-2.5 rounded-full hover:bg-surface-raised transition-colors min-h-[40px]"
                        aria-label="Load mock pothole sample photograph"
                      >
                        🕳️ Pothole Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&fit=crop");
                          setPhotoName("garbage_sample.jpg");
                        }}
                        className="text-xs font-semibold border border-border px-4 py-2.5 rounded-full hover:bg-surface-raised transition-colors min-h-[40px]"
                        aria-label="Load mock garbage overflow sample photograph"
                      >
                        🗑️ Garbage Sample
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: DETAILS */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transitionVars}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Short Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Water leak leaking on street"
                      className="w-full h-12 px-3 rounded-sm border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus:outline-none text-foreground transition-all"
                      aria-label={screenReader ? "Specify a short title summarizing the reported issue" : "Report Title"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Detailed Description</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Give details about size, hazards, safety risks, duration..."
                      className="w-full p-3 rounded-sm border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus:outline-none resize-none text-foreground transition-all h-32"
                      aria-label={screenReader ? "Add a comprehensive description detailing safety risks and duration" : "Report Description"}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-12 px-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors rounded hover:bg-border/10 select-none"
                aria-label={screenReader ? "Go back to the previous report setup step" : "Back"}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {currentStep === STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="h-12 px-6 inline-flex items-center gap-1.5 rounded-md font-bold bg-accent text-accent-foreground hover:bg-accent-hover disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm select-none"
                  aria-label={screenReader ? "Submit report to the AI agent validation pipeline" : "Submit Report"}
                >
                  Submit Report <Check className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="h-12 px-6 inline-flex items-center gap-1.5 rounded-md font-bold bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none transition-all select-none"
                  aria-label={screenReader ? "Continue to the next report step" : "Continue"}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Live AI Pipeline Simulation */
          <motion.div
            key="submitting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitionVars}
            className="bg-surface border border-border rounded-lg p-8 shadow-md text-center max-w-[500px] mx-auto space-y-8"
            style={{ willChange: "transform, opacity" }}
          >
            <div>
              <h2 className="text-xl font-bold mb-2 text-foreground tracking-tight">Deploying AI Pipeline</h2>
              <p className="text-sm text-muted">
                Executing multi-agent verification and civic routing...
              </p>
            </div>

            {/* Animation Core */}
            <div className="flex justify-center py-6 select-none pointer-events-none">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-24 h-24 text-primary animate-spin" style={{ strokeWidth: 1 }} />
                <div className="absolute text-2xl animate-pulse">🤖</div>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 text-left max-w-sm mx-auto border-t border-border/50 pt-6">
              {/* Agent Step 1 */}
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {pipelineStep > 0 ? (
                    <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold select-none pointer-events-none">
                      ✓
                    </div>
                  ) : (
                    <Eye className="w-5 h-5 text-primary animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Vision Agent Validation</div>
                  <div className="text-xs text-muted">
                    {pipelineStep > 0 ? "Validated: Street damage confirmed" : "Scanning photo for civic anomalies..."}
                  </div>
                </div>
              </div>

              {/* Agent Step 2 */}
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {pipelineStep > 1 ? (
                    <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold select-none pointer-events-none">
                      ✓
                    </div>
                  ) : pipelineStep === 1 ? (
                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-border" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Classification & Severity Assessment</div>
                  <div className="text-xs text-muted">
                    {pipelineStep > 1
                      ? `Classified: ${category ? category.toUpperCase() : "GENERAL"} - Severity Assigned`
                      : pipelineStep === 1
                      ? "Analyzing metadata and evaluating safety priority..."
                      : "Pending queue..."}
                  </div>
                </div>
              </div>

              {/* Agent Step 3 */}
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {pipelineStep > 2 ? (
                    <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold select-none pointer-events-none">
                      ✓
                    </div>
                  ) : pipelineStep === 2 ? (
                    <Building2 className="w-5 h-5 text-primary animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-border" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Geographical Authority Routing</div>
                  <div className="text-xs text-muted">
                    {pipelineStep > 2
                      ? `Target: Ward Division, ${city}`
                      : pipelineStep === 2
                      ? "Resolving municipal boundaries for ward routing..."
                      : "Pending queue..."}
                  </div>
                </div>
              </div>

              {/* Agent Step 4 */}
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {pipelineStep > 3 ? (
                    <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs font-bold select-none pointer-events-none">
                      ✓
                    </div>
                  ) : pipelineStep === 3 ? (
                    <Clock className="w-5 h-5 text-primary animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-border" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Official Grievance Registration</div>
                  <div className="text-xs text-muted">
                    {pipelineStep > 3
                      ? "Complaint registered. Redirecting..."
                      : pipelineStep === 3
                      ? "Drafting official letter and submitting to portal..."
                      : "Pending queue..."}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
