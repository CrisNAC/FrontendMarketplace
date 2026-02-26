import { CategoriesBar } from "../features/clients/components/CategoriesBar";
import { HeroCarousel } from "../features/clients/components/HeroCarousel";
import { HomeSections } from "../features/clients/components/HomeSections";
import { MarketplaceNavbar } from "../features/clients/components/MarketplaceNavbar";
import Navbar from "../features/clients/components/Navbar";

export const HomePage = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <HeroCarousel />
      <HomeSections />
    </div>
  );
};