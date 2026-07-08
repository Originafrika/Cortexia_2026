import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";
import { MODEL_CATALOG } from "@/lib/kie-ai";

export default function ImagePage() {
  const models = MODEL_CATALOG.image;
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="image"
        icon="🎨"
        title="Image"
        params={[
          { key: "model", label: "Modèle", type: "select", default: models[0].id, options: models.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` })) },
          { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
            { value: "512x512", label: "512 × 512" },
            { value: "768x768", label: "768 × 768" },
            { value: "1024x1024", label: "1024 × 1024" },
            { value: "1216x832", label: "1216 × 832" },
            { value: "832x1216", label: "832 × 1216" },
            { value: "1536x1024", label: "1536 × 1024" },
          ]},
          { key: "style", label: "Style", type: "select", default: "auto", options: [
            { value: "auto", label: "Automatique" },
            { value: "realistic", label: "Réaliste" },
            { value: "anime", label: "Anime" },
            { value: "cinematic", label: "Cinématique" },
            { value: "artistic", label: "Artistique" },
          ]},
          { key: "seed", label: "Seed", type: "number", min: 0, max: 999999, default: 0 },
          { key: "steps", label: "Steps", type: "slider", min: 1, max: 50, step: 1, default: 28 },
        ]}
      />
      <Footer />
    </>
  );
}
