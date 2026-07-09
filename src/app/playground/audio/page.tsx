import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function AudioPage() {
  return (
    <>
      <Header />
      <ModelPlayground modelType="audio" icon="🎵" title="Audio" />
      <Footer />
    </>
  );
}
