import React from "react";
import { Heart, Users, Sparkles } from "lucide-react";
import { IMAGES } from "../mock";

const VALUES = [
  { icon: Heart, title: "Genuine care", desc: "We clean like it's our own home — because to us, trust is everything." },
  { icon: Users, title: "The same faces", desc: "Consistent, vetted crews who get to know you and your space." },
  { icon: Sparkles, title: "Detail obsessed", desc: "The corners others skip are the ones we notice first." },
];

const About = () => {
  return (
    <section id="about" className="section-pad bg-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative reveal">
          <div className="rounded-[2rem] overflow-hidden shadow-lift ring-1 ring-black/5">
            <img src={IMAGES.cleanerTeam} alt="Our cleaning team at work" className="w-full h-[440px] md:h-[540px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-4 md:-right-8 bg-brand-green text-brand-cream rounded-2xl p-5 shadow-lift max-w-[220px]">
            <p className="font-serif text-lg leading-snug">“We brighten your home and free up your time.”</p>
            <p className="text-xs text-brand-cream/70 mt-2">— Our promise since day one</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-brand-green/70 font-semibold reveal">Our story</p>
          <h2 className="reveal mt-3 font-serif text-4xl md:text-5xl font-600 text-brand-ink">
            A family-run team, now brightening all of DFW
          </h2>
          <p className="reveal mt-5 text-brand-ink/70 text-lg leading-relaxed">
            What started as a family cleaning homes in Collin County has grown into a trusted name across the Dallas–Fort Worth metroplex — for homes and businesses alike. We never lost the thing that made us special: real people who show up, care deeply, and do the job right every single time.
          </p>
          <p className="reveal mt-4 text-brand-ink/70 leading-relaxed">
            No call centers. No cutting corners. Just a dependable crew, eco-friendly products, and a 100% satisfaction guarantee behind every visit.
          </p>

          <div className="reveal mt-8 grid sm:grid-cols-3 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-brand-cream rounded-2xl p-5 ring-1 ring-black/5">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-sage text-brand-green">
                  <v.icon className="w-5 h-5" />
                </span>
                <h4 className="mt-3 font-600 text-brand-ink">{v.title}</h4>
                <p className="mt-1 text-sm text-brand-ink/60">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
