import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";
import { MODEL_CATALOG } from "@/lib/kie-ai";

export default function TextPage() {
  const models = MODEL_CATALOG.text;
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="text"
        icon="✍️"
        title="Texte"
        params={[
          { key: "model", label: "Modèle", type: "select", default: models[0].id, options: models.map((m) => ({ value: m.id, label: `${m.provider} — ${m.name}` })) },
          { key: "temperature", label: "Température", type: "slider", min: 0, max: 2, step: 0.1, default: 0.7 },
          { key: "maxTokens", label: "Max tokens", type: "slider", min: 100, max: 16384, step: 100, default: 2048, unit: "tokens" },
          { key: "topP", label: "Top P", type: "slider", min: 0, max: 1, step: 0.05, default: 1.0 },
        ]}
      />
      <Footer />
    </>
  );
}
