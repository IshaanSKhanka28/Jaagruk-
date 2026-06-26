"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { uploadImage, createIssue } from "@/lib/api";

// Leaflet relies on `window`, so load the preview map client-side only
const LocationPreviewMap = dynamic(() => import("./LocationPreviewMap"), {
  ssr: false,
});

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
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Geolocation state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Submission & SDK uploading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Toast States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("Please enter your location manually", "error");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get a human-readable address (Nominatim, no API key)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await response.json();
          const addr = data.address || {};

          // Extract specific fields, with sensible fallbacks
          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || "";
          const detectedArea =
            addr.suburb || addr.neighbourhood || addr.road || "";
          const detectedState = addr.state || "";
          const detectedPincode = addr.postcode || "";

          // Build a clean, short address from the most useful parts
          const shortAddress = [detectedArea, detectedCity, detectedState]
            .filter(Boolean)
            .join(", ");

          setAddress(
            shortAddress ||
              data.display_name ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          );
          if (detectedCity) setCity(detectedCity);
          setArea(detectedArea);
          setPincode(detectedPincode);
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          // Fall back to raw coordinates if geocoding fails
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setArea("");
          setPincode("");
        } finally {
          setLat(latitude);
          setLng(longitude);
          setLocationDetected(true);
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        showToast("Please enter your location manually", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhoto(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoName("");
    setImageFile(null);
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
    setError(null);
    setIsUploading(true);

    let imageUrl = photo;

    // 1. Upload image if it is a local file object
    if (imageFile) {
      try {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.url;
      } catch (err) {
        console.error("Upload failed:", err);
        showToast("Upload failed, try again", "error");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    // 2. Create the civic issue in database
    try {
      if (!imageUrl) {
        showToast("Please provide a photograph", "error");
        setIsSubmitting(false);
        return;
      }

      const issuePayload = {
        image_url: imageUrl,
        description: `${title}\n\n${description}`,
        address,
        lat: lat || undefined,
        lng: lng || undefined,
        citizen_id: "anonymous"
      };

      const newIssue = await createIssue(issuePayload);
      if (newIssue && newIssue.id) {
        router.push(`/report/${newIssue.id}`);
      } else {
        throw new Error("Empty issue ID response");
      }
    } catch (err) {
      console.error("Issue creation failed:", err);
      showToast("Submission failed, try again", "error");
      setIsSubmitting(false);
    }
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
                    <label className="text-sm font-semibold text-foreground">Detected Address</label>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={detectingLocation}
                      className="w-full h-12 px-4 inline-flex items-center justify-center gap-2 rounded-sm border border-primary bg-primary-subtle text-primary font-semibold hover:bg-primary/10 disabled:opacity-60 disabled:pointer-events-none transition-all select-none"
                      aria-label={screenReader ? "Detect my current location using browser geolocation" : "Use my location"}
                      aria-busy={detectingLocation}
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          📍 Detecting location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          Use My Location
                        </>
                      )}
                    </button>
                    {locationDetected && (
                      <p className="text-xs font-semibold text-success flex items-center gap-1.5" role="status">
                        <Check className="w-3.5 h-3.5" /> ✅ Location detected
                      </p>
                    )}
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 12th Main Road, Indiranagar"
                      className="w-full h-12 px-3 rounded-sm border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus:outline-none text-foreground transition-all"
                      aria-label={screenReader ? "Confirm or write the detected address location details" : "Street address"}
                    />

                    {/* Detected location detail chips */}
                    {locationDetected && (area || city || pincode) && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {area && (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-3 py-1 text-xs">
                            📍 {area}
                          </span>
                        )}
                        {city && (
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-xs">
                            🏙️ {city}
                          </span>
                        )}
                        {pincode && (
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1 text-xs">
                            📮 {pincode}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Inline map preview of the detected location */}
                    {locationDetected && lat && lng && (
                      <div className="mt-4">
                        <p className="text-xs text-muted mb-2">📍 Your location on map</p>
                        <LocationPreviewMap lat={lat} lng={lng} address={address} />
                        <button
                          type="button"
                          onClick={() => {
                            setLocationDetected(false);
                            setLat(null);
                            setLng(null);
                            setAddress("");
                            setCity("");
                            setArea("");
                            setPincode("");
                          }}
                          className="text-xs text-muted hover:text-foreground mt-2 underline"
                        >
                          Wrong location? Enter manually
                        </button>
                      </div>
                    )}
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
          /* Submitting / Uploading Loading Screen */
          <motion.div
            key="submitting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={transitionVars}
            className="bg-surface border border-border rounded-lg p-8 shadow-md text-center max-w-[500px] mx-auto space-y-8"
            style={{ willChange: "transform, opacity" }}
          >
            <div>
              <h2 className="text-xl font-bold mb-2 text-foreground tracking-tight">
                {isUploading ? "Uploading Image" : "Submitting Report"}
              </h2>
              <p className="text-sm text-muted">
                {isUploading 
                  ? "Storing your evidence image securely..." 
                  : "Registering issue and launching AI verification pipeline..."}
              </p>
            </div>

            {/* Animation Core */}
            <div className="flex justify-center py-6 select-none pointer-events-none">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-24 h-24 text-primary animate-spin" style={{ strokeWidth: 1.5 }} />
                <div className="absolute text-2xl animate-pulse">🤖</div>
              </div>
            </div>

            <div className="text-xs text-muted font-mono bg-background/50 border border-border p-3 rounded-sm">
              Status: {isUploading ? "UPLOADING_IMAGE" : "CREATING_DB_RECORD"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-md shadow-lg border ${
              toastType === "success" 
                ? "bg-success/15 border-success text-success" 
                : "bg-error/15 border-error text-error"
            }`}
          >
            {toastType === "success" ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error" />
            )}
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-muted hover:text-foreground text-lg focus:outline-none"
              aria-label="Dismiss toast"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
