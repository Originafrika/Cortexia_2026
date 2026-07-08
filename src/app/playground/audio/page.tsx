import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function AudioPage() {
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="audio"
        icon="🎵"
        title="Audio"
        params={[
          { key: "model", label: "Modèle", type: "select", default: "elevenlabs", options: [
            { value: "elevenlabs", label: "ElevenLabs" },
            { value: "musicgen", label: "MusicGen" },
            { value: "bark", label: "Bark (Suno)" },
          ]},
          { key: "duration", label: "Durée", type: "slider", min: 5, max: 120, step: 5, default: 30, unit: "secondes" },
          { key: "voice", label: "Voix", type: "select", default: "default", options: [
            { value: "default", label: "Voix par défaut" },
            { value: "male-1", label: "Voix masculine 1" },
            { value: "female-1", label: "Voix féminine 1" },
            { value: "male-2", label: "Voix masculine 2" },
          ]},
          { key: "format", label: "Format", type: "select", default: "mp3", options: [
            { value: "mp3", label: "MP3" },
            { value: "wav", label: "WAV" },
            { value: "ogg", label: "OGG" },
          ]},
          { key: "temperature", label: "Température", type: "slider", min: 0, max: 1.5, step: 0.1, default: 0.7 },
        ]}
      />
      <Footer />
    </>
  );
}
