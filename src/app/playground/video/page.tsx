import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function VideoPage() {
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="video"
        icon="🎬"
        title="Vidéo"
        params={[
          { key: "model", label: "Modèle", type: "select", default: "runway", options: [
            { value: "runway", label: "Runway Gen-3" },
            { value: "kling", label: "Kling 1.5" },
            { value: "pika", label: "Pika 2.0" },
          ]},
          { key: "duration", label: "Durée", type: "select", default: "5", options: [
            { value: "5", label: "5 secondes" },
            { value: "10", label: "10 secondes" },
            { value: "15", label: "15 secondes" },
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
          { key: "seed", label: "Seed", type: "number", min: 0, max: 999999, default: 42 },
        ]}
      />
      <Footer />
    </>
  );
}
