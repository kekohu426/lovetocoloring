"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Backpack,
  BookOpenCheck,
  Check,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  Minus,
  Paintbrush,
  Plus,
  RotateCcw,
  RotateCw,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { downscaleImage } from "@/lib/client-image";
import { notifyCreditBalanceChanged } from "@/components/CreditBalance";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import type { Dictionary } from "@/i18n";
import type { GeneratorMode } from "@/lib/navigation";
import { getDefaultScenario, getScenario, listScenarios, type ScenarioId, type ScenarioPreset } from "@/lib/scenarios";

type Tier = "standard" | "pro";
type Audience = "Kids & Family" | "Classroom" | "Adult Coloring";
type Detail = "Simple" | "Balanced" | "Detailed";

interface Me { signedIn: boolean; credits: number; unlimited: boolean; freeLeft: number; costs: { standard: number; pro: number } }
interface Result { id: string; status: "pending" | "processing" | "completed" | "failed"; failMsg: string | null }

function valuesFor(preset: ScenarioPreset) {
  return Object.fromEntries(preset.fields.map((field) => [field.id, field.defaultValue]));
}

function presetHref(preset: ScenarioPreset) {
  return `/${preset.mode === "image" ? "photo" : "text"}-to-coloring-page?preset=${preset.id}`;
}

interface SmartPresetOption {
  value: string;
  presetId: ScenarioId;
  label: string;
  fieldId?: string;
  fieldValue?: string;
}

function smartPresetOptions(mode: GeneratorMode): SmartPresetOption[] {
  const result: SmartPresetOption[] = [];
  for (const item of listScenarios(mode)) {
    const cohort = item.fields.find((field) => (field.id === "age" || field.id === "grade") && field.type === "select");
    if (!cohort?.options) {
      result.push({ value: item.id, presetId: item.id, label: item.label });
      continue;
    }
    for (const option of cohort.options) result.push({ value: `${item.id}:${option}`, presetId: item.id, fieldId: cohort.id, fieldValue: option, label: `${item.label} - ${option}` });
  }
  return result;
}

function presetIcon(option: SmartPresetOption) {
  if (option.presetId === "adult") return <Paintbrush size={17} />;
  if (option.presetId === "birthday") return <Sparkles size={17} />;
  if (option.presetId === "classroom") {
    if (option.fieldValue === "Grades K-1") return <GraduationCap size={17} />;
    if (option.fieldValue === "Grades 1-3") return <BookOpenCheck size={17} />;
    return <Backpack size={17} />;
  }
  return <UserRound size={17} />;
}

const quickSelectChoices: Record<string, readonly string[]> = {
  theme: ["Animals", "Dinosaurs", "Nature", "Space", "Vehicles", "Fantasy"],
  topic: ["The solar system", "Plants", "Animals", "Weather", "Maps"],
};

export function Generator({ t, initialMode = "text", lockedMode, initialPresetId, initialPrompt }: {
  t: Dictionary;
  initialMode?: GeneratorMode;
  lockedMode?: GeneratorMode;
  initialPresetId?: ScenarioId;
  initialPrompt?: string;
}) {
  const router = useRouter();
  const mode = lockedMode ?? initialMode;
  const requestedPreset = initialPresetId ? getScenario(initialPresetId) : getDefaultScenario(mode);
  const firstPreset = requestedPreset.mode === mode ? requestedPreset : getDefaultScenario(mode);
  const [presetId, setPresetId] = useState<ScenarioId>(firstPreset.id);
  const preset = getScenario(presetId);
  const [audience, setAudience] = useState<Audience>(firstPreset.audience as Audience);
  const [detail, setDetail] = useState<Detail>(firstPreset.detail);
  const [prompt, setPrompt] = useState(initialPrompt?.trim().slice(0, 500) || firstPreset.promptTemplate || "");
  const [values, setValues] = useState<Record<string, string>>(() => valuesFor(firstPreset));
  const [tier, setTier] = useState<Tier>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewRotation, setPreviewRotation] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const refreshMe = useCallback(async () => {
    const response = await fetch("/api/me", { cache: "no-store" });
    if (response.ok) setMe(await response.json());
  }, []);

  useEffect(() => { void refreshMe(); }, [refreshMe]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (!result || result.status === "completed" || result.status === "failed") return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/generations/${result.id}`, { cache: "no-store" });
      if (!response.ok) return;
      const next: Result = await response.json();
      setResult(next);
      if (next.status === "completed") {
        notifyCreditBalanceChanged();
        router.push(`/projects/${next.id}/palette`);
      }
      if (next.status === "failed") {
        setBusy(false);
        setError(next.failMsg ?? t.errors.generic);
        void refreshMe();
      }
    }, 1800);
    return () => window.clearInterval(timer);
  }, [result, refreshMe, router, t.errors.generic]);

  function applyPreset(next: ScenarioPreset) {
    setPresetId(next.id);
    setAudience(next.audience as Audience);
    setDetail(next.detail);
    setPrompt(next.promptTemplate ?? "");
    setValues(valuesFor(next));
    setDirty(false);
    setError(null);
  }

  function changeSmartPreset(option: SmartPresetOption) {
    const next = getScenario(option.presetId);
    if (dirty && !window.confirm("Change preset and replace the current suggested settings?")) return;
    applyPreset(next);
    if (option.fieldId && option.fieldValue) {
      setValues({ ...valuesFor(next), [option.fieldId]: option.fieldValue });
    }
    window.history.pushState({ preset: next.id }, "", presetHref(next));
  }

  function pickFile(next: File | null) {
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setDirty(true);
    setError(null);
  }

  async function generate() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let sourcePath: string | null = null;
      if (mode === "image") {
        if (!file) throw new Error("Choose a clear photo first.");
        const form = new FormData();
        form.append("file", await downscaleImage(file));
        const upload = await fetch("/api/upload", { method: "POST", body: form });
        const uploaded = await upload.json();
        if (!upload.ok) throw new Error(uploaded.error ?? t.errors.generic);
        sourcePath = uploaded.path;
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt, tier, size: "portrait", sourcePath, presetId, presetValues: values, audience, detail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t.errors.generic);
      setResult({ id: data.id, status: data.status === "completed" ? "processing" : data.status, failMsg: null });
      notifyCreditBalanceChanged();
      void refreshMe();
    } catch (reason) {
      setBusy(false);
      setError(reason instanceof Error ? reason.message : t.errors.generic);
    }
  }

  const cost = tier === "pro" ? me?.costs.pro ?? 4 : me?.costs.standard ?? 1;
  const smartOptions = smartPresetOptions(mode);
  const activeSmart = smartOptions.find((option) => option.presetId === presetId && (!option.fieldId || values[option.fieldId] === option.fieldValue)) ?? smartOptions.find((option) => option.presetId === presetId) ?? smartOptions[0];
  const fineTuneFields = preset.fields.filter((field) => field.id !== activeSmart?.fieldId);
  const previewImage = mode === "image" && preview ? preview : preset.image;
  const needsCredits = Boolean(me?.signedIn && !me.unlimited && me.credits < cost);
  const needsSignIn = Boolean(me && !me.signedIn && me.freeLeft < 1);
  const activePresetLabel = activeSmart?.fieldValue
    ? `${preset.label} - ${activeSmart.fieldValue}`
    : activeSmart?.label ?? preset.label;

  function resetPreviewView() {
    setPreviewZoom(100);
    setPreviewRotation(0);
  }

  return <>
    <WorkflowSteps active={1} />
    <section className={`studio-shell wizard-workbench ${mode === "text" ? "text-generator-workbench" : "photo-generator-workbench"}`} aria-label={`${mode === "text" ? "Text" : "Photo"} coloring page studio`}>
      <form className={`studio-controls wizard-controls ${mode === "text" ? "text-generator-controls" : "photo-generator-controls"}`} onSubmit={(event) => { event.preventDefault(); void generate(); }}>
        {mode === "image" ? <><label className="field-label">1. Upload your photo</label><label className={`upload-box${preview ? " has-preview" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); pickFile(event.dataTransfer.files[0] ?? null); }}>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => pickFile(event.target.files?.[0] ?? null)} />
          <span className="upload-icon"><UploadCloud size={20} /></span><span className="upload-copy"><strong>{preview ? "Change the selected photo" : "Drop a photo here or browse"}</strong><small>{file?.name ?? "JPG, PNG or WebP - up to 10 MB"}</small></span><img src={preview ?? preset.image} alt="Selected source photo preview" />
        </label></> : <><label className="field-label prompt-label" htmlFor="coloring-prompt"><span>1. Describe your scene</span><small>{prompt.length}/500</small></label><textarea id="coloring-prompt" maxLength={500} rows={5} value={prompt} onChange={(event) => { setPrompt(event.target.value); setDirty(true); }} /></>}

        <div className="smart-preset smart-preset-expanded">
          <div className="smart-preset-heading"><span>2. Choose a preset</span><small>Audience and age</small></div>
          <div className="smart-preset-options">
            {smartOptions.map((option) => {
              const selected = option.value === (activeSmart?.value ?? presetId);
              return <button type="button" className={`${selected ? "selected " : ""}preset-${option.presetId}`} aria-pressed={selected} key={option.value} onClick={() => changeSmartPreset(option)}>
                <span className="preset-check" aria-hidden="true">{selected ? <Check size={13} /> : presetIcon(option)}</span>
                <span>{option.fieldValue ?? (option.presetId === "adult" ? "Adults" : option.label)}</span>
              </button>;
            })}
          </div>
        </div>

        <div className="generation-quality fine-tune-result fine-tune-expanded"><div className="fine-tune-heading"><b>Quick settings</b><span>Adjust the result</span></div>
          {fineTuneFields.length ? <div className="preset-fields">{fineTuneFields.map((field) => <div className="fine-tune-field" key={field.id}><label className="field-label" htmlFor={field.type === "select" ? undefined : `preset-${field.id}`}>{field.label === "Favorite theme" ? "Theme" : field.label}</label>{field.type === "select" ? <div className="option-buttons" role="group" aria-label={field.label}>{field.options?.map((option) => {
            const selected = (values[field.id] ?? field.defaultValue) === option;
            return <button type="button" aria-pressed={selected} className={selected ? "selected" : ""} key={option} onClick={() => { setValues({ ...values, [field.id]: option }); setDirty(true); }}>{option}</button>;
          })}</div> : presetId !== "birthday" && quickSelectChoices[field.id] ? <select id={`preset-${field.id}`} value={values[field.id] ?? field.defaultValue} onChange={(event) => { setValues({ ...values, [field.id]: event.target.value }); setDirty(true); }}>{Array.from(new Set([values[field.id] ?? field.defaultValue, ...quickSelectChoices[field.id]])).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={`preset-${field.id}`} type={field.type} min={field.type === "number" ? 1 : undefined} value={values[field.id] ?? field.defaultValue} onChange={(event) => { setValues({ ...values, [field.id]: event.target.value }); setDirty(true); }} />}</div>)}</div> : null}
          {mode === "text" ? <><label className="field-label">Detail level</label><div className="segmented three detail-level-control">{(["Simple", "Balanced", "Detailed"] as Detail[]).map((item) => <button type="button" className={detail === item ? "selected" : ""} key={item} onClick={() => { setDetail(item); setDirty(true); }}>{item === "Balanced" ? "Medium" : item}</button>)}</div></> : null}
          <label className="field-label">Quality</label><div className="segmented two">{(["standard", "pro"] as Tier[]).map((item) => <button type="button" className={tier === item ? "selected" : ""} key={item} onClick={() => setTier(item)}>{item === "standard" ? "Standard" : "High (PNG + PDF)"}</button>)}</div>
          {mode === "image" ? <><label className="field-label" htmlFor="photo-direction">Optional direction</label><textarea id="photo-direction" rows={2} value={prompt} onChange={(event) => { setPrompt(event.target.value); setDirty(true); }} placeholder="Keep the face and simplify the background" /></> : null}
        </div>

        <div className="format-row"><span>A4 / US Letter</span><span>High-resolution PNG + PDF</span></div>
        {needsCredits ? <Link className="primary-action credit-action" href="/pricing"><Sparkles size={17} />Get credits to create</Link> : needsSignIn ? <button className="primary-action credit-action" type="button" onClick={() => signIn("google", { callbackUrl: window.location.href })}><LockKeyhole size={17} />Sign in to keep creating</button> : <button className="primary-action" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Creating clean line art...</> : <>{mode === "text" ? "Generate line art" : "Convert photo"}{me?.unlimited || (!me?.signedIn && me?.freeLeft) ? "" : ` - ${cost} credit${cost === 1 ? "" : "s"}`} <ArrowRight size={16} aria-hidden="true" /></>}</button>}
        {mode === "image" ? <p className="privacy-note">Your photo is used only to create this page and is not displayed publicly in the app.</p> : null}
        {error ? <div className="inline-error">{error}{/sign in/i.test(error) ? <button type="button" onClick={() => signIn("google", { callbackUrl: window.location.href })}>Sign in</button> : null}</div> : null}
      </form>

      <div className="studio-preview wizard-preview" aria-live="polite">
        <div className="preview-topbar"><div><span className={busy ? "status-dot working" : "status-dot"} />{busy ? (mode === "image" ? "Simplifying shapes and cleaning outlines..." : "Drawing clean, printable outlines...") : preview && mode === "image" ? "Photo ready for conversion" : "Live preview - expected result"}</div><span>{activePresetLabel}</span></div>
        <div className={`preview-canvas portrait ${busy ? "is-working" : ""}`}><img style={{ transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)` }} src={previewImage} alt={preview && mode === "image" ? "Photo awaiting conversion" : `${preset.label} line art preview`} />{busy ? <div className="scan-line" /> : null}</div>
        <div className="preview-toolbar" aria-label="Preview controls">
          <div className="zoom-control"><span>Zoom</span><button type="button" onClick={() => setPreviewZoom((value) => Math.max(70, value - 10))} title="Zoom out"><Minus size={15} /></button><b>{previewZoom}%</b><button type="button" onClick={() => setPreviewZoom((value) => Math.min(150, value + 10))} title="Zoom in"><Plus size={15} /></button></div>
          <div className="rotation-control"><button type="button" onClick={() => setPreviewRotation((value) => value - 90)} title="Rotate left"><RotateCcw size={15} /></button><button type="button" onClick={() => setPreviewRotation((value) => value + 90)} title="Rotate right"><RotateCw size={15} /></button></div>
          <button className="reset-view" type="button" onClick={resetPreviewView}><span>Reset view</span><Maximize2 size={14} /></button>
        </div>
        <div className="next-step-hint"><span>2</span><p>Next: compare the result and choose a color palette</p></div>
      </div>
    </section>
  </>;
}
