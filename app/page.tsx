import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Stats from "@/app/components/Stats";
import Capabilities from "@/app/components/Capabilities";
import LiveDemo from "@/app/components/LiveDemo";
import Pipeline from "@/app/components/Pipeline";
import TechStack from "@/app/components/TechStack";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Capabilities />
        <LiveDemo />
        <Pipeline />
        <TechStack />
      </main>
      <Footer />
    </>
  );
}
