import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  image: string;
}

export default function TestimonialCard({ name, role, quote, image }: TestimonialCardProps) {
  return (
    <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur-xl" data-reveal>
      <p className="text-[var(--muted)] leading-7 mb-5">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <Image
          src={image}
          alt={`${name} profile`}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover border border-[var(--line)]"
        />
        <div>
          <p className="text-[var(--foreground)] font-semibold">{name}</p>
          <p className="text-sm text-[var(--muted)]">{role}</p>
        </div>
      </div>
    </article>
  );
}
