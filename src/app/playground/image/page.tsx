import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function ImagePage() {
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="image"
        icon="🎨"
        title="Image"
        params={[
          { key: "model", label: "Modèle", type: "select", default: "sd-xl", options: [
            { value: "sd-xl", label: "Stable Diffusion XL" },
            { value: "sd-3", label: "Stable Diffusion 3" },
            { value: "dall-e-3", label: "DALL-E 3" },
          ]},
          { key: "resolution", label: "Résolution", type: "select", default: "1024x1024", options: [
            { value: "512x512", label: "512 × 512" },
            { value: "1024x1024", label: "1024 × 1024" },
            { value: "1216x832", label: "1216 × 832" },
            { value: "832x1216", label: "832 × 1216" },
          ]},
          { key: "style", label: "Style", type: "select", default: "auto", options: [
            { value: "auto", label: "Automatique" },
            { value: "realistic", label: "Réaliste" },
            { value: "anime", label: "Anime" },
            { value: "cinematic", label: "Cinématique" },
            { value: "artistic", label: "Artistique" },
          ]},
          { key: "seed", label: "Seed", type: "number", min: 0, max: 999999, default: 42 },
          { key: "steps", label: "Steps", type: "slider", min: 10, max: 100, step: 5, default: 30 },
        ]}
      />
      <Footer />
    </>
  );
}
