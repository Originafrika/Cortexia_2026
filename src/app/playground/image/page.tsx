import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ModelPlayground } from "@/components/model-playground";

export default function ImagePage() {
  return (
    <>
      <Header />
      <ModelPlayground modelType="image" icon="🎨" title="Image" />
      <Footer />
    </>
  );
}
