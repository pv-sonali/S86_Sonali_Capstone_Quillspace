import MainLayout from '../layouts/MainLayout';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import CTASection from '../components/CTASection';

const LandingPage = () => {
  return (
    <MainLayout>
      <HeroSection />
      <Features />
      <CTASection />
    </MainLayout>
  );
};

export default LandingPage;
