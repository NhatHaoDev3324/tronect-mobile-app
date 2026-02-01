import SlideFeature from "@/components/customs/slides/SlideFeature";
import SlideStart from "@/components/customs/slides/SlideStart";
import SlideTechnology from "@/components/customs/slides/SlideTechnology";
import SlideWelcome from "@/components/customs/slides/SlideWelcome";

export const onboardingSlides = [
    {
        id: "welcome",
        component: () => <SlideWelcome />,
    },
    {
        id: "feature",
        component: () => <SlideFeature />,
    },
    {
        id: "technology",
        component: () => <SlideTechnology />,
    },
    {
        id: "start",
        component: () => <SlideStart />,
    },
];
