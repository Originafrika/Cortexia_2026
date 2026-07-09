import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function TextPage() {
  return (
    <>
      <Header />
      <ModelPlayground modelType="text" icon="✍️" title="Texte" />
      <Footer />
    </>
  );
}
