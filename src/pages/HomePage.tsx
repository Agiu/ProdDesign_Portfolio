import { WeatherHero } from '../components/WeatherHero';
import { CaseStudies } from '../components/case-studies';
import { About } from '../components/About';

interface HomePageProps {
  darkColor: string;
  onDarkColorChange: (color: string) => void;
}

export function HomePage({ darkColor, onDarkColorChange }: HomePageProps) {
  return (
    <>
      <WeatherHero onDarkColorChange={onDarkColorChange} />
      <CaseStudies darkColor={darkColor} />
      <About darkColor={darkColor} />
    </>
  );
}
