import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function TextPage() {
  return (
    <>
      <Header />
      <ModelPlayground
        modelType="text"
        icon="✍️"
        title="Texte"
        params={[
          { key: "model", label: "Modèle", type: "select", default: "claude-3.5", options: [
            { value: "gpt-4o", label: "GPT-4o" },
            { value: "claude-3.5", label: "Claude 3.5 Sonnet" },
            { value: "llama-3", label: "Llama 3 70B" },
            { value: "gemini-pro", label: "Gemini Pro" },
          ]},
          { key: "temperature", label: "Température", type: "slider", min: 0, max: 2, step: 0.1, default: 0.7 },
          { key: "maxTokens", label: "Max tokens", type: "slider", min: 100, max: 4096, step: 100, default: 2048, unit: "tokens" },
          { key: "topP", label: "Top P", type: "slider", min: 0, max: 1, step: 0.05, default: 0.9 },
        ]}
      />
      <Footer />
    </>
  );
}
