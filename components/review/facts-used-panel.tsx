type Props = {
  profile: {
    fullName?: string | null;
    email?: string | null;
    location?: string | null;
    skills: string[];
    experiences: Array<{ title: string; company: string }>;
    projects: Array<{ name: string; role?: string | null }>;
  };
};

export function FactsUsedPanel({ profile }: Props) {
  return (
    <section className="rounded border bg-white p-4">
      <h2 className="font-semibold">Facts Used</h2>
      <p className="mt-2 text-sm">{profile.fullName ?? "—"} · {profile.email ?? "—"} · {profile.location ?? "—"}</p>
      <div className="mt-3 text-sm">
        <p className="font-medium">Skills</p>
        <p>{profile.skills.join(", ") || "No skills added"}</p>
      </div>
      <div className="mt-3 text-sm">
        <p className="font-medium">Experience Signals</p>
        <ul className="list-disc pl-5">
          {profile.experiences.map((exp) => (
            <li key={`${exp.title}-${exp.company}`}>{exp.title} at {exp.company}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3 text-sm">
        <p className="font-medium">Project Signals</p>
        <ul className="list-disc pl-5">
          {profile.projects.map((project) => (
            <li key={project.name}>{project.name}{project.role ? ` (${project.role})` : ""}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
