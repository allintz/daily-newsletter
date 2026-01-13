# Citations & Summary System

## How It Works

### Newsletter Summaries

**Problem**: Reading through 7 full newsletters to avoid repetition is inefficient and uses too many tokens.

**Solution**: After each newsletter is generated, the system:
1. Automatically generates a 2-sentence summary
2. Saves it to `newsletter-summaries.json`
3. Uses these summaries (not full text) when generating future newsletters

**File structure** (`newsletter-summaries.json`):
```json
{
  "2026-01-12": "Explored the Arizona fake electors scheme mechanics. Compared it to Georgia's PVT system as democratic safeguard.",
  "2026-01-13": "Analyzed Hungary's democratic backsliding 2010-2020. Discussed Orbán's gradual institutional capture.",
  "2026-01-14": "Summarized Levitsky & Ziblatt's research on norm erosion. Applied framework to US context."
}
```

**Benefits**:
- Much more efficient (7 two-sentence summaries vs 7 full newsletters)
- Faster generation
- Lower API costs
- Still effective at preventing repetition

### Citation Requirements

**Problem**: AI models can sometimes present uncertain information as fact or hallucinate details.

**Solution**: The prompt now requires:

**Minimum 5-7 citations per newsletter** with links to reputable sources

**What needs citations:**
- Specific facts, numbers, dates
- Research findings or studies
- Historical events (when not common knowledge)
- Quotes from documents or people
- Claims that could be disputed

**What doesn't need citations:**
- Widely known historical facts (e.g., "The US has presidential elections every four years")
- Your own analysis or reasoning
- General conceptual explanations

**Acceptable sources:**
- Court documents and legal filings
- Government reports and official records
- Academic papers and journals
- Reputable news investigations (NYT, WaPo, WSJ, Reuters, AP)
- Official transcripts
- Primary sources (speeches, letters, etc.)

**Format examples:**
```
According to the [January 6 Committee Report](URL), over 200 people...

The scheme involved 84 fake electors across seven states ([source](URL)).

Research by Levitsky & Ziblatt (2018) in "How Democracies Die" found that...
```

## Adjusting Citation Standards

If you want **more citations**, edit `prompt-template.txt`:
```
- Minimum: At least 10-12 citations per newsletter
- Cite every specific claim, even widely reported ones
```

If you want **fewer citations** (more trust in general knowledge):
```
- Minimum: At least 3-5 citations for key claims only
- Focus citations on disputed facts or specific numbers
```

## Checking Citation Quality

When reading a newsletter, ask:
- Can I verify the key facts by clicking the links?
- Are sources reputable and relevant?
- Are specific claims backed up?
- If something seems uncertain, is that acknowledged?

## Summary Quality

The 2-sentence summaries are automatically generated and should:
- Capture the main topic
- Include a key takeaway or focus
- Be specific enough to avoid repetition

If summaries seem too vague, you could manually edit `newsletter-summaries.json` to make them more specific.

## Example: Well-Cited Newsletter Excerpt

> The Arizona fake electors scheme involved 11 Republicans who signed certificates on December 14, 2020, claiming to be "duly elected and qualified" electors ([Arizona indictment, AG Mayes, April 2024](https://example.com/az-indictment)). This occurred 14 days after Governor Doug Ducey had certified Biden's win ([Arizona Republic, Nov 30 2020](https://example.com/ducey-cert)).
>
> Unlike the 1960 Hawaii precedent, where alternate electors explicitly conditioned their certificates on pending recounts ([Congressional Research Service analysis](https://example.com/crs-report)), the Arizona certificates made no such qualification ([comparison by election law expert Rick Hasen](https://example.com/hasen-analysis)).

Notice:
- Specific facts cited (dates, names, numbers)
- Multiple source types (legal documents, news, expert analysis)
- Links provided for verification
- Comparison to precedent includes citation

## Troubleshooting

**Issue**: Newsletter has few or no citations
→ The prompt emphasizes "CRITICAL" but AI might still under-cite. Consider adding: "EVERY paragraph must contain at least one citation."

**Issue**: Citations are to unreliable sources
→ Update acceptable sources list in prompt to be more restrictive

**Issue**: Links are dead or wrong
→ Unfortunately AI can't verify links in real-time. This is a known limitation. Cross-check important claims.

**Issue**: Too many citations disrupt reading flow
→ Reduce minimum to 3-5 and focus on "claims that could be disputed"

**Issue**: Summaries in newsletter-summaries.json are too similar
→ Manually edit the JSON file to make them more distinctive

## Cost Implications

Adding summary generation means:
- Each newsletter = 2 API calls (newsletter + summary)
- Summary generation is cheap (~$0.01 per summary)
- Total cost per newsletter: ~$0.16-0.31 instead of ~$0.15-0.30

The citation requirement might make newsletters slightly longer, but shouldn't significantly affect cost since it's still within the same token budget.
