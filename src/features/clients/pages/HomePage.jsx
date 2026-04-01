import { HeroCarousel } from "../components/home/HeroCarousel";
import { HomeSections } from "../components/home/HomeSections";
import { SellerCTA } from "../components/home/SellerCTA";
import Navbar from "../../../components/navbar/Navbar";

export const HomePage = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <HeroCarousel />
      <HomeSections />
      <SellerCTA />
    </div>
  );
};
