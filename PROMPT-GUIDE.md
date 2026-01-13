# Prompt Workshopping Guide

The newsletter generation prompt is stored in `prompt-template.txt` and can be customized without touching any code.

## How It Works

The system:
1. Reads `prompt-template.txt`
2. Replaces template variables with actual values:
   - `{{TOPICS}}` → Your topics from config.json
   - `{{STYLE}}` → Your newsletter style from config.json
   - `{{READ_TIME}}` → Target read time from config.json
   - `{{DATE}}` → Current date
   - `{{RECENT_TOPICS}}` → Summaries of the last 7 newsletters (to avoid repetition)
3. Sends the prompt to Claude
4. Generates your newsletter

## Anti-Repetition System

The system automatically:
- Reads the last 7 days of newsletters
- Extracts the first 200 characters as a topic summary
- Includes them in the prompt with the instruction "DO NOT repeat these"
- This ensures variety across the week

## Workshopping the Prompt

### Current Strengths

The prompt currently emphasizes:
- **Reasoning transparency** (EA Forum style)
- **Specific examples** over generalities
- **Epistemic humility** (acknowledging uncertainty)
- **Variety** (5 different content categories)
- **Depth** over breadth (one topic per day)

### Ideas for Enhancement

**1. Add more structure cues:**
```
- Start with a hook or surprising fact
- Use subheadings for each major section
- End with actionable insights or questions to ponder
```

**2. Specify research depth:**
```
- Cite at least 2-3 specific sources (court documents, academic papers, news investigations)
- Include direct quotes when they illuminate key points
- Link related concepts to provide context
```

**3. Adjust tone:**
```
- More formal/academic: "Adopt a scholarly tone with rigorous citation practices"
- More accessible: "Explain concepts as if to an intelligent friend over coffee"
- More urgent: "Emphasize the stakes and time-sensitivity of democratic threats"
```

**4. Add topic constraints:**
```
- Focus on lesser-known cases that deserve attention
- Prioritize recent developments (last 30 days) over historical analysis
- Balance between federal and state-level threats
```

**5. Enhance variety guidelines:**
```
- Monday: Week ahead preview with multiple developing stories
- Tuesday-Thursday: Deep dives into single topics
- Friday: Week in review synthesis
- Weekend: Historical/comparative analysis
```

## Editing the Prompt

1. **Open the file:**
   ```bash
   open prompt-template.txt
   ```
   Or use any text editor

2. **Make your changes** while keeping the template variables:
   - `{{TOPICS}}`
   - `{{STYLE}}`
   - `{{READ_TIME}}`
   - `{{DATE}}`
   - `{{RECENT_TOPICS}}`

3. **Save the file**

4. **Test it:**
   ```bash
   npm run test
   ```

5. **Iterate** based on the output

## Example Modifications

### Make it more research-focused:
Add after "Requirements:" section:
```
Research standards:
- Cite at least 3 primary sources (court documents, official reports, academic papers)
- Include links or specific citations (case numbers, paper titles, dates)
- Distinguish between reporting, analysis, and opinion
- Note methodology and sample sizes for any studies mentioned
```

### Add more narrative structure:
Add before "Write the full newsletter now:":
```
Structure your newsletter as:
1. **Hook** (1 paragraph): Start with a compelling fact or recent development
2. **Context** (2-3 paragraphs): Historical background and why this matters
3. **Analysis** (3-4 paragraphs): Deep dive with evidence and reasoning
4. **Implications** (1-2 paragraphs): What this means for democratic stability
5. **Bottom Line** (1 paragraph): Key takeaway and open questions
```

### Focus on actionability:
Add to requirements:
```
- Include a "What to Watch" section highlighting indicators or upcoming events
- Suggest 1-2 ways readers can engage (organizations to follow, hearings to watch, etc.)
- Note any pending court cases or legislative actions related to the topic
```

## Testing Different Approaches

Try these experiments:

**Week 1:** Use the default prompt
**Week 2:** Add more structure requirements
**Week 3:** Emphasize primary sources
**Week 4:** Add actionability components

Compare which newsletters you find most valuable.

## Common Issues and Solutions

**Issue: Content too academic/dry**
→ Add: "Use vivid examples and clear explanations. Avoid jargon."

**Issue: Not enough specific details**
→ Add: "Name specific people, dates, places, and events. Avoid vague generalities."

**Issue: Too US-centric**
→ Add to variety: "Include international comparisons showing how other democracies handle similar challenges"

**Issue: Missing connections**
→ Add: "Draw explicit connections between historical precedents and current risks"

**Issue: Topics feel random**
→ Add: "Build on themes from recent newsletters while exploring new angles"

## Advanced: Multiple Prompt Styles

You can create multiple prompt templates:
- `prompt-template.txt` (default)
- `prompt-deep-dive.txt` (for detailed single-topic analysis)
- `prompt-weekly-roundup.txt` (for synthesis newsletters)

Then modify the script to use different templates on different days!

## Questions to Ask Yourself

After reading a newsletter:
- Did I learn something new?
- Was the reasoning clear and convincing?
- Did it cite specific, verifiable sources?
- Was the writing engaging?
- Did it avoid repetition?
- Would I want to share this with someone?

Use your answers to refine the prompt!
