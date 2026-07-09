import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function VideoPage() {
  return (
    <>
      <Header />
      <div className="animate-fade-in flex-1 flex flex-col">
        <ModelPlayground modelType="video" icon="🎬" title="Vidéo" />
      </div>
      <Footer />
    </>
  );
}
