/**
 * PLATFORM PLAYBOOK - SINGLE SOURCE OF TRUTH
 *
 * Platform-specific best practices + instruction-manual writing guidance.
 * Applies across Jamie/SpoonFlow when generating or reviewing content.
 *
 * Voice is handled separately by /config/voice_profile.ts
 */

export const platformPlaybook = {
  version: "1.0",
  platforms: {
    "LI Post": {
      purpose: "Fast insight + conversation starter. One idea. Highly scannable.",
      ideal_length_words: { min: 120, max: 350 },
      structure: [
        { key: "hook", label: "Hook", guidance: "1–2 lines. A sharp truth, a tension, a surprising observation, or a question. Make it about what the reader is navigating." },
        { key: "context_or_micro_story", label: "Context / Micro-story", guidance: "2–5 short lines. A real moment, example, or pattern you've seen. Keep it specific." },
        { key: "takeaway", label: "Your take", guidance: "Name the lesson. Translate what it means for teams building healthcare tools (patient + workflow reality)." },
        { key: "how_to_apply", label: "Make it usable", guidance: "1–3 bullets or a tight mini-framework. Give the reader something to do or look for." },
        { key: "cta", label: "CTA", guidance: "Invite comments, ask a question, or offer a DM next step. One clear ask." }
      ],
      modules: [
        {
          key: "hook",
          label: "Hook",
          description: "1–2 lines. Name a tension, truth, or pattern your reader recognizes. Make it about what THEY're dealing with.",
          placeholder: "Start with a sharp truth your reader will recognize..."
        },
        {
          key: "context",
          label: "Context / Micro-story",
          description: "2–5 short lines. One specific moment, example, or pattern you've seen. Enough detail to make the insight feel real.",
          placeholder: "Quick scene or pattern you've seen (keep it tight)..."
        },
        {
          key: "pov",
          label: "Your take",
          description: "Name the lesson. Translate what this means for healthcare teams building products (patient reality + workflow reality).",
          placeholder: "Here's what this means (and what teams often miss)..."
        },
        {
          key: "takeaways",
          label: "Make it usable",
          description: "1–3 bullets or a mini-framework. Give the reader something to check, change, or try this week.",
          placeholder: "Practical bullets or a mini-framework..."
        },
        {
          key: "cta",
          label: "CTA",
          description: "One clear ask. Invite comments, ask a question, or offer a DM next step.",
          placeholder: "End with one question or next step..."
        }
      ],
      best_practices: [
        "Hook in the first 1–2 lines",
        "Short paragraphs and lots of line breaks",
        "One idea per post",
        "Use concrete examples over general claims",
        "End with one clear question or next step"
      ],
      do: [
        "Write like you talk (professional, human, direct)",
        "Use whitespace like it's part of the voice",
        "Use 1–2 strategic fragments for emphasis"
      ],
      avoid: [
        "Long blocks of text",
        "Multiple unrelated points",
        "Over-explaining the background",
        "Corporate-y wording"
      ],
      cta_examples: [
        "If you're building a patient-facing tool, what's the hardest part to get right?",
        "Curious how others handle this — what have you seen work?",
        "Want help pressure-testing this with a patient lens? DM me."
      ],
      checklist: [
        { key: "has_hook_early", label: "Hook in first ~2 lines", pass_if: "opening feels sharp and specific" },
        { key: "scannable", label: "Scannable formatting", pass_if: "uses line breaks; paragraphs are short" },
        { key: "one_idea", label: "One core idea", pass_if: "post can be summarized in one sentence" },
        { key: "has_cta", label: "CTA present", pass_if: "ends with a question or clear next step" }
      ]
    },

    "LI Article": {
      purpose: "Teach something. Build credibility. Make the reader smarter in 5–8 minutes.",
      ideal_length_words: { min: 700, max: 1600 },
      structure: [
        { key: "headline_promise", label: "Headline + promise", guidance: "Clear, specific title. Make a promise you'll fulfill (what they'll learn / see differently)." },
        { key: "opening_hook", label: "Opening hook", guidance: "A short scene, tension, or common mistake. Make it immediately relevant." },
        { key: "why_it_matters", label: "Why it matters", guidance: "Tie the topic to business outcomes: adoption, trust, engagement, workflow fit, risk, retention." },
        { key: "core_framework", label: "Framework / main argument", guidance: "Explain your model or point of view. Use headings every ~200–300 words." },
        { key: "example", label: "Real example", guidance: "One concrete example that proves the point (patient moment, workflow workaround, etc.)." },
        { key: "practical_takeaways", label: "Practical takeaways", guidance: "A short list: what to do, what to watch for, what to stop doing." },
        { key: "closing_cta", label: "Closing CTA", guidance: "Invite comments, offer a resource, or suggest a next step (DM / consult / subscribe)." }
      ],
      modules: [
        {
          key: "hook",
          label: "Opening hook",
          description: "Start with a scene, tension, or common mistake. Pull the reader in fast — then promise what they'll learn.",
          placeholder: "Start with a moment/mistake that sets up the article..."
        },
        {
          key: "context",
          label: "Why this matters",
          description: "Set the stakes. Tie the topic to outcomes: trust, adoption, engagement, workflow fit, risk, retention, revenue.",
          placeholder: "Why this matters (in real-world outcomes)..."
        },
        {
          key: "pov",
          label: "Framework / Main argument",
          description: "Teach your model. Use headings as you write. Include at least one concrete example that proves the point.",
          placeholder: "Your framework + a real example that makes it click..."
        },
        {
          key: "takeaways",
          label: "Practical takeaways",
          description: "A short list: what to do, what to watch for, what to stop doing. Make the reader smarter in minutes.",
          placeholder: "What to do / watch / stop..."
        },
        {
          key: "cta",
          label: "Closing CTA",
          description: "Invite comments, offer a resource, or propose a next step (DM, consult, subscribe).",
          placeholder: "What would you like help with next?"
        }
      ],
      best_practices: [
        "Use headings regularly to prevent wall-of-text",
        "Include at least one specific example",
        "Keep claims grounded in lived reality (patient + care delivery)",
        "End with a takeaway list"
      ],
      do: [
        "Write in first person (I) when it's your viewpoint",
        "Use short paragraphs even in long-form",
        "Keep it practical — readers should know what to do differently"
      ],
      avoid: [
        "Vague thought leadership with no steps",
        "Overly academic tone",
        "Overstuffing multiple topics into one article"
      ],
      cta_examples: [
        "If you're building in this space, where have you seen patients get stuck?",
        "Want a patient-experience pressure test on your flow? DM me.",
        "If this was useful, follow along — I share these patterns weekly."
      ],
      checklist: [
        { key: "has_headings", label: "Multiple headings", pass_if: "has several section breaks/headings" },
        { key: "has_example", label: "Concrete example included", pass_if: "reader can point to a real scenario" },
        { key: "has_takeaways", label: "Takeaways section", pass_if: "ends with bullets or clear summary" },
        { key: "has_cta", label: "CTA included", pass_if: "ends with a prompt or next step" }
      ]
    },

    "SS Post": {
      purpose: "Build connection + nuance. Tell the story behind the insight. Invite real replies.",
      ideal_length_words: { min: 600, max: 1200 },
      structure: [
        { key: "opening_line", label: "Opening line", guidance: "A human hook. A truth, a feeling, a moment, or a pattern you've lived/seen." },
        { key: "story_or_scene", label: "Story / scene", guidance: "Set up the lived moment. Keep it concrete. Let the reader feel the stakes." },
        { key: "turn", label: "Turn (what you realized)", guidance: "Name the shift: what this taught you about patient experience, care friction, or what teams miss." },
        { key: "insight", label: "Your insight", guidance: "Translate to a broader pattern — but keep it specific, not abstract." },
        { key: "what_to_do", label: "What teams can do", guidance: "A short list of actions, questions, or design principles." },
        { key: "invite_reply", label: "Invite reply", guidance: "Ask for readers' experiences. Encourage responses." }
      ],
      modules: [
        {
          key: "hook",
          label: "Opening line",
          description: "Lead with a feeling, truth, or lived moment. You've got room here — aim for connection first.",
          placeholder: "A human opener that sets the tone..."
        },
        {
          key: "context",
          label: "Story / Scene",
          description: "Tell the moment. Concrete details, clear stakes. Let the reader feel what was hard before you explain the lesson.",
          placeholder: "What happened (the scene + the stakes)..."
        },
        {
          key: "pov",
          label: "The turn + your insight",
          description: "Name what you realized. Translate it into a pattern teams should understand — specific, not abstract.",
          placeholder: "What shifted for you + the insight it revealed..."
        },
        {
          key: "takeaways",
          label: "What teams can do",
          description: "A short list of actions, questions, or principles. Keep it practical, still in your voice.",
          placeholder: "Actions / questions / principles for teams..."
        },
        {
          key: "cta",
          label: "Invite reply",
          description: "Ask for real responses. Substack is a conversation space — invite stories, not just likes.",
          placeholder: "Invite readers to share their experience..."
        }
      ],
      best_practices: [
        "Short paragraphs and clear section breaks",
        "Voice shows up early (I, lived reality, direct address)",
        "Slower build is okay, but don't bury the point",
        "Invite replies — Substack is a conversation space"
      ],
      do: [
        "Use a story to earn the insight",
        "Let emotion show without melodrama",
        "Include one or two lines that are 'quoteable'"
      ],
      avoid: [
        "Sounding like a LinkedIn post pasted into Substack",
        "Over-summarizing without your POV",
        "Ending without an invitation"
      ],
      cta_examples: [
        "If you've lived something like this, I'd love to hear it in the replies.",
        "What do you wish your care team understood about this moment?",
        "If you're building for patients, where do you see this showing up?"
      ],
      checklist: [
        { key: "voice_early", label: "Voice appears early", pass_if: "first 1–2 paragraphs include POV or lived context" },
        { key: "has_turn", label: "Clear 'turn' moment", pass_if: "reader can identify what changed/what you realized" },
        { key: "has_actions", label: "Actionable section", pass_if: "includes steps/questions/principles" },
        { key: "invites_replies", label: "Invites replies", pass_if: "ends with a prompt to respond" }
      ]
    },

    "SS Audio": {
      purpose: "Sound like you. Teach through voice. Keep it easy to follow while listening.",
      ideal_length_words: { min: 1200, max: 1800 },
      structure: [
        { key: "cold_open", label: "Cold open", guidance: "First 20–30 seconds: why this matters + what they'll get." },
        { key: "setup", label: "Setup", guidance: "Name the problem/pattern. Brief context." },
        { key: "beats", label: "Beats", guidance: "3–5 beats with clear transitions. One main point per beat." },
        { key: "example", label: "Example", guidance: "A short story or scenario to make it real." },
        { key: "recap", label: "Recap", guidance: "1–2 minute recap: what to remember." },
        { key: "close", label: "Close", guidance: "Clear next step: reply, share, subscribe, DM." }
      ],
      modules: [
        {
          key: "hook",
          label: "Cold open",
          description: "First 20–30 seconds. Why this matters + what they'll get. Simple, spoken, no throat-clearing.",
          placeholder: "Today we're talking about ___, and here's why it matters..."
        },
        {
          key: "context",
          label: "Setup",
          description: "Set up the pattern/problem. Short sentences. Clear transitions like you're speaking to a real person.",
          placeholder: "Here's the setup (keep it listening-friendly)..."
        },
        {
          key: "pov",
          label: "Beats (3–5)",
          description: "Walk through 3–5 beats with signposts (First / Next / Here's the shift). One main point per beat + a quick scenario.",
          placeholder: "Beat 1… Beat 2… Beat 3… (use signposts as you go)"
        },
        {
          key: "takeaways",
          label: "Recap",
          description: "1–2 minutes. Say the point cleanly. Repeat what you want them to remember.",
          placeholder: "Quick recap: here's what to remember..."
        },
        {
          key: "cta",
          label: "Close",
          description: "One specific next step: reply, share, subscribe, or DM. Keep it direct.",
          placeholder: "If this resonated, here's what to do next..."
        }
      ],
      best_practices: [
        "Write for listening: short sentences, simple transitions",
        "Say the point early; repeat it cleanly at the end",
        "Use signposts (First / Next / Here's the shift / So what?)",
        "Keep beats tight — no wandering"
      ],
      do: [
        "Read the script out loud once and tighten anything that sounds clunky",
        "Use natural phrasing and contractions",
        "Make the close specific (one next step)"
      ],
      avoid: [
        "Long sentences",
        "Dense paragraphs",
        "Too many subpoints without signposts"
      ],
      cta_examples: [
        "Reply and tell me where you've seen this show up.",
        "If you want a patient lens on what you're building, DM me.",
        "Subscribe if you want more real-world patient experience patterns."
      ],
      checklist: [
        { key: "why_matters_fast", label: "Why it matters in first 30 seconds", pass_if: "listener quickly understands value" },
        { key: "clear_beats", label: "Clear beats", pass_if: "has 3–5 distinct sections" },
        { key: "listening_friendly", label: "Listening-friendly", pass_if: "short sentences; easy transitions" },
        { key: "clear_close", label: "Clear close", pass_if: "one specific next step" }
      ]
    }
  }
} as const;

export type PlatformPlaybook = typeof platformPlaybook;