import type { Metadata } from "next";

import CareersFooter from "@/components/careers/CareersFooter";
import CareersHeader from "@/components/careers/CareersHeader";
import CareersSpontaneousForm from "@/components/careers/CareersSpontaneousForm";

export const metadata: Metadata = {
  title: "Introduce yourself | LMG Careers",
  description:
    "Introduce yourself to LMG and tell us what you could build with us.",
};

export default function SpontaneousApplicationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <CareersHeader />

      <section className="mx-auto max-w-[1600px] px-5 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
          Open application
        </p>

        <h1 className="mt-8 max-w-6xl text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
          Make
          <br />
          the first
          <br />
          move.
        </h1>

        <div className="mt-16 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-2 md:gap-20">
          <p className="max-w-xl text-2xl font-semibold leading-tight md:text-4xl">
            The right role doesn&apos;t always exist
            before the right person shows up.
          </p>

          <div className="max-w-xl text-base leading-7 text-white/55">
            <p>
              If you see yourself contributing to LMG
              but don&apos;t see the right opening yet,
              introduce yourself.
            </p>

            <p className="mt-5">
              Tell us what you do, what you&apos;re
              building toward and where you think your
              perspective could make a difference.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-[0.65fr_1.35fr] md:px-10 md:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d5ad58]">
              Your profile
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] md:text-6xl">
              Show us
              <br />
              what you
              <br />
              bring.
            </h2>
          </div>

          <CareersSpontaneousForm />
        </div>
      </section>

      <CareersFooter />
    </main>
  );
}
