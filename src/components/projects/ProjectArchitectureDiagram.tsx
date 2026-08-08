import { cn } from "@/lib/utils";

type DiagramProps = {
  slug: string;
  className?: string;
};

function DiagramShell({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card/50 p-6", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
        <div className="text-xs text-muted-foreground">High level</div>
      </div>
      {children}
    </div>
  );
}

function SvgBase({
  viewBox,
  children,
}: {
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label="Architecture diagram"
      className="w-full overflow-visible"
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L7,3.5 L0,7 z" fill="hsl(var(--muted-foreground))" />
        </marker>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="hsl(var(--foreground))" floodOpacity="0.08" />
        </filter>
      </defs>
      {children}
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  tone = "default",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  tone?: "default" | "primary";
}) {
  const fill = tone === "primary" ? "hsl(var(--primary) / 0.10)" : "hsl(var(--background))";
  const stroke = tone === "primary" ? "hsl(var(--primary) / 0.35)" : "hsl(var(--border))";

  return (
    <g filter="url(#softShadow)">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="16"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <text
        x={x + 18}
        y={y + 34}
        fontSize="14"
        fontWeight="700"
        fill="hsl(var(--foreground))"
      >
        {title}
      </text>
      {subtitle ? (
        <text
          x={x + 18}
          y={y + 56}
          fontSize="12"
          fill="hsl(var(--muted-foreground))"
        >
          {subtitle}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}) {
  return (
    <g>
      <path
        d={`M${x1} ${y1} L${x2} ${y2}`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.6"
        fill="none"
        markerEnd="url(#arrow)"
        opacity="0.9"
      />
      {label ? (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fontSize="11"
          fill="hsl(var(--muted-foreground))"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function TalkerDiagram() {
  return (
    <DiagramShell
      title="Architecture"
      subtitle="RAG pipeline with retrieval-first responses and citations."
    >
      <SvgBase viewBox="0 0 980 240">
        <Box x={24} y={78} w={210} h={86} title="Learner" subtitle="Question + context" />
        <Box x={270} y={42} w={260} h={86} title="Retriever" subtitle="FAISS vector index" />
        <Box x={270} y={140} w={260} h={78} title="Sources" subtitle="Slides, syllabus, notes" />
        <Box x={570} y={78} w={260} h={86} title="Generator" subtitle="Ollama2 + guardrails" tone="primary" />
        <Box x={866} y={78} w={90} h={86} title="Answer" subtitle="Citations" />

        <Arrow x1={234} y1={121} x2={270} y2={85} label="embed + search" />
        <Arrow x1={400} y1={128} x2={400} y2={140} label="grounding" />
        <Arrow x1={530} y1={85} x2={570} y2={121} label="contexts" />
        <Arrow x1={830} y1={121} x2={866} y2={121} label="final" />

        <Box x={570} y={168} w={260} h={54} title="Optional" subtitle="YouTube timestamps" />
        <Arrow x1={700} y1={164} x2={700} y2={156} label="multi-modal" />
      </SvgBase>
    </DiagramShell>
  );
}

function TradingBotDiagram() {
  return (
    <DiagramShell
      title="Architecture"
      subtitle="Signals + risk engine feeding an execution layer."
    >
      <SvgBase viewBox="0 0 980 240">
        <Box x={24} y={48} w={230} h={78} title="News" subtitle="Real-time headlines" />
        <Box x={24} y={140} w={230} h={78} title="Market Data" subtitle="Price + volume" />

        <Box x={286} y={48} w={250} h={78} title="Sentiment" subtitle="FinBERT scoring" />
        <Box x={286} y={140} w={250} h={78} title="Indicators" subtitle="SMA, RSI, etc." />

        <Box x={572} y={78} w={240} h={86} title="Risk Engine" subtitle="Limits + sizing" tone="primary" />
        <Box x={836} y={78} w={120} h={86} title="Execution" subtitle="Alpaca API" />

        <Arrow x1={254} y1={87} x2={286} y2={87} label="score" />
        <Arrow x1={254} y1={179} x2={286} y2={179} label="compute" />
        <Arrow x1={536} y1={87} x2={572} y2={121} label="signals" />
        <Arrow x1={536} y1={179} x2={572} y2={121} label="features" />
        <Arrow x1={812} y1={121} x2={836} y2={121} label="orders" />
      </SvgBase>
    </DiagramShell>
  );
}

function FraudStreamDiagram() {
  return (
    <DiagramShell
      title="Architecture"
      subtitle="Transactions scored in-stream, masked before they are ever stored."
    >
      <SvgBase viewBox="0 0 980 240">
        <Box x={24} y={78} w={190} h={86} title="Sources" subtitle="Mobile · POS · Online" />
        <Box x={240} y={78} w={190} h={86} title="Kafka" subtitle="Avro + Schema Registry" />
        <Box x={456} y={36} w={230} h={86} title="Spark Streaming" subtitle="Features + quality" tone="primary" />
        <Box x={456} y={150} w={230} h={70} title="Detection" subtitle="8 patterns, sub-second" />
        <Box x={712} y={78} w={244} h={86} title="Snowflake" subtitle="Bronze / Silver / Gold" />

        <Arrow x1={214} y1={121} x2={240} y2={121} label="ingest" />
        <Arrow x1={430} y1={121} x2={456} y2={79} label="validate" />
        <Arrow x1={571} y1={122} x2={571} y2={150} label="score" />
        <Arrow x1={686} y1={79} x2={712} y2={121} label="masked" />
      </SvgBase>
    </DiagramShell>
  );
}

function QSensorSimDiagram() {
  return (
    <DiagramShell
      title="Architecture"
      subtitle="Simulation runs are jobs, not requests — progress is queryable throughout."
    >
      <SvgBase viewBox="0 0 980 240">
        <Box x={24} y={78} w={190} h={86} title="Job request" subtitle="Scenario config" />
        <Box x={240} y={78} w={190} h={86} title="FastAPI" subtitle="REST gateway" />
        <Box x={456} y={36} w={220} h={86} title="Celery worker" subtitle="SciPy simulation" tone="primary" />
        <Box x={456} y={150} w={220} h={70} title="Redis" subtitle="Broker + progress" />
        <Box x={702} y={78} w={254} h={86} title="Navigation output" subtitle="Kalman-filtered" />

        <Arrow x1={214} y1={121} x2={240} y2={121} label="submit" />
        <Arrow x1={430} y1={121} x2={456} y2={181} label="enqueue" />
        <Arrow x1={566} y1={150} x2={566} y2={122} label="dispatch" />
        <Arrow x1={676} y1={79} x2={702} y2={121} label="results" />
      </SvgBase>
    </DiagramShell>
  );
}

function BlogAIDiagram() {
  return (
    <DiagramShell
      title="Architecture"
      subtitle="Workflow-driven generation with clean export formats."
    >
      <SvgBase viewBox="0 0 980 240">
        <Box x={24} y={78} w={220} h={86} title="Brief" subtitle="Topic + keywords" />
        <Box x={272} y={78} w={260} h={86} title="Workflow" subtitle="LangChain orchestration" />
        <Box x={564} y={78} w={250} h={86} title="Generator" subtitle="GPT-4 drafting" tone="primary" />
        <Box x={846} y={42} w={110} h={78} title="MDX" subtitle="Blog" />
        <Box x={846} y={128} w={110} h={78} title="DOCX" subtitle="Book" />

        <Arrow x1={244} y1={121} x2={272} y2={121} label="outline" />
        <Arrow x1={532} y1={121} x2={564} y2={121} label="steps" />
        <Arrow x1={814} y1={106} x2={846} y2={81} label="export" />
        <Arrow x1={814} y1={136} x2={846} y2={167} label="export" />
      </SvgBase>
    </DiagramShell>
  );
}

/**
 * Slugs with a hand-drawn diagram. Callers use this to decide whether to render
 * the generic architecture fallback, so the list lives in exactly one place.
 */
export const DIAGRAM_SLUGS = [
  'talker',
  'ai-powered-trading-bot',
  'fraud-stream',
  'qsensor-sim',
  'blog-ai',
] as const;

export function hasArchitectureDiagram(slug: string | undefined): boolean {
  return !!slug && (DIAGRAM_SLUGS as readonly string[]).includes(slug);
}

function getDiagramForSlug(slug: string): React.ReactNode {
  switch (slug) {
    case 'talker':
      return <TalkerDiagram />
    case 'ai-powered-trading-bot':
      return <TradingBotDiagram />
    case 'fraud-stream':
      return <FraudStreamDiagram />
    case 'qsensor-sim':
      return <QSensorSimDiagram />
    case 'blog-ai':
      return <BlogAIDiagram />
    default:
      return null
  }
}

export function ProjectArchitectureDiagram({ slug, className }: DiagramProps): React.ReactNode {
  const diagram = getDiagramForSlug(slug)

  if (!diagram) return null

  return <div className={className}>{diagram}</div>
}

