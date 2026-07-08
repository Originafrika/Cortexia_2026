import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";
import { MODEL_CATALOG } from "@/lib/kie-ai";

export default function AudioPage() {
  const models = MODEL_CATALOG.audio;
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="audio"
        icon="🎵"
        title="Audio"
        params={[
          { key: "model", label: "Modèle", type: "select", default: models[0].id, options: models.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` })) },
          { key: "duration", label: "Durée", type: "slider", min: 5, max: 300, step: 5, default: 30, unit: "secondes" },
          { key: "voice", label: "Voix / Style", type: "select", default: "default", options: [
            { value: "default", label: "Par défaut" },
            { value: "male", label: "Voix masculine" },
            { value: "female", label: "Voix féminine" },
            { value: "instrumental", label: "Instrumental" },
          ]},
          { key: "format", label: "Format", type: "select", default: "mp3", options: [
            { value: "mp3", label: "MP3" },
            { value: "wav", label: "WAV" },
            { value: "ogg", label: "OGG" },
          ]},
          { key: "temperature", label: "Créativité", type: "slider", min: 0, max: 1.5, step: 0.1, default: 0.7 },
        ]}
      />
      <Footer />
    </>
  );
}
