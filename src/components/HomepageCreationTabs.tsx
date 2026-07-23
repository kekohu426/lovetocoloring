"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

export function HomepageCreationTabs({
  textHref,
  photoHref,
}: {
  textHref: string;
  photoHref: string;
}) {
  const [mode, setMode] = useState<"idea" | "photo">("idea");

  return (
    <div className="homepage-creation-tabs">
      <div className="homepage-creation-tablist" role="tablist" aria-label="Choose how to create a coloring page">
        <button type="button" role="tab" aria-selected={mode === "idea"} onClick={() => setMode("idea")}>
          <Sparkles size={20} /> Create from an idea
        </button>
        <button type="button" role="tab" aria-selected={mode === "photo"} onClick={() => setMode("photo")}>
          <Camera size={20} /> Upload a photo
        </button>
      </div>

      {mode === "idea" ? (
        <div className="homepage-creation-panel">
          <form className="homepage-creation-idea" action={textHref} method="get">
            <label htmlFor="homepage-creation-idea">Describe your coloring page</label>
            <textarea
              id="homepage-creation-idea"
              name="prompt"
              defaultValue="A friendly dinosaur celebrating a birthday with balloons and a cake"
              maxLength={300}
            />
            <div className="homepage-creation-suggestions">
              <span><Sparkles size={15} /> Try an idea:</span>
              {["Cute dinosaur", "Space adventure", "Flower garden", "Animal mandala"].map((idea) => (
                <button key={idea} type="button" onClick={(event) => {
                  const form = event.currentTarget.closest("form");
                  const textarea = form?.querySelector("textarea");
                  if (textarea) textarea.value = idea;
                }}>{idea}</button>
              ))}
            </div>
            <button className="homepage-creation-submit" type="submit">
              Create my coloring page <ArrowRight size={20} />
            </button>
          </form>
          <figure className="homepage-creation-preview">
            <span>Example result</span>
            <Image src="/images/homepage/case-birthday.png" alt="Birthday dinosaur coloring page example" width={960} height={720} sizes="(min-width: 900px) 34vw, 90vw" />
            <figcaption>Your page will be uniquely generated</figcaption>
          </figure>
        </div>
      ) : (
        <div className="homepage-creation-panel">
          <Link className="homepage-creation-upload" href={photoHref}>
            <span className="homepage-creation-upload-icon"><Camera size={34} /><ArrowRight size={17} /></span>
            <strong>Drop a photo here or <em>browse</em></strong>
            <span>Portraits, pets and family memories</span>
            <span>JPG, PNG or WebP · up to 10 MB</span>
            <small><ShieldCheck size={18} /> Private by default</small>
          </Link>
          <figure className="homepage-creation-preview">
            <Image src="/images/homepage/case-pet.png" alt="Pet photo transformed into a printable coloring page" width={960} height={720} sizes="(min-width: 900px) 34vw, 90vw" />
            <figcaption>Photo to coloring page</figcaption>
          </figure>
          <Link className="homepage-creation-submit photo" href={photoHref}>
            Turn photo into a coloring page <ArrowRight size={20} />
          </Link>
        </div>
      )}

      <div className="homepage-creation-meta">
        <span>No design skills</span><span>A4 &amp; US Letter</span><span>PNG + PDF</span>
      </div>
    </div>
  );
}
