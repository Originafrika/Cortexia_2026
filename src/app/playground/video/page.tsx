import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function VideoPage() {
  return (
    <>
      <Header />
      <ModelPlayground modelType="video" icon="🎬" title="Vidéo" />
      <Footer />
    </>
  );
}
