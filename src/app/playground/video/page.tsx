import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";
import { MODEL_CATALOG } from "@/lib/kie-ai";

export default function VideoPage() {
  const models = MODEL_CATALOG.video;
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="video"
        icon="🎬"
        title="Vidéo"
        params={[
          { key: "model", label: "Modèle", type: "select", default: models[0].id, options: models.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` })) },
          { key: "duration", label: "Durée", type: "select", default: "5", options: [
            { value: "5", label: "5 secondes" },
            { value: "10", label: "10 secondes" },
            { value: "15", label: "15 secondes" },
            { value: "30", label: "30 secondes" },
            { value: "60", label: "60 secondes" },
          ]},
          { key: "resolution", label: "Résolution", type: "select", default: "1080p", options: [
            { value: "720p", label: "720p" },
            { value: "1080p", label: "1080p" },
            { value: "4k", label: "4K" },
          ]},
          { key: "style", label: "Style", type: "select", default: "auto", options: [
            { value: "auto", label: "Automatique" },
            { value: "cinematic", label: "Cinématique" },
            { value: "anime", label: "Anime" },
            { value: "realistic", label: "Réaliste" },
          ]},
          { key: "seed", label: "Seed", type: "number", min: 0, max: 999999, default: 0 },
        ]}
      />
      <Footer />
    </>
  );
}
