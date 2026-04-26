import { Suspense, lazy } from 'react';
import Header from '../components/common/layout/Header/Header';
import Banner from "../components/common/ui/Banner/Banner"
import CoursesSection from '../components/modules/course/CoursesSection/CoursesSection';
import ZJUIntroSection from '../components/common/ui/IntroSection/ZJUIntroSection';
import StoriesSection from '../components/modules/story/StoriesSection/StoriesSection';
import Footer from '../components/common/layout/Footer/Footer';
import { useSearchParams } from 'react-router-dom';

const EventsSection = lazy(() => import('../components/modules/event/EventsSection/EventsSection'));

export default function Home() {
  const [searchParams] = useSearchParams();
  const calendarParam = (searchParams.get('calendar') || '').toLowerCase();
  const showCalendar =
    calendarParam === '1' ||
    calendarParam === 'true' ||
    calendarParam === 'show';
  return (
    <>
      <Header />
      <main>
        <Banner />
        <CoursesSection />
        <ZJUIntroSection />
        <StoriesSection />
        {showCalendar && (
          <Suspense fallback={null}>
            <EventsSection />
          </Suspense>
        )}
      </main>
      <Footer />
    </>
  );
}
