# Backward Analysis Prompt: Multifamily Property Deal Model

## Purpose

Build a financial model that works **backward** from my retirement income goal to identify the exact deal parameters a multifamily property must meet. The model should validate that the deal:

1. Generates enough cash flow to replace my income and fund my retirement
2. Has sufficient spread between cap rate and debt cost to satisfy typical LTV requirements (65%-80%)
3. Is attractive enough to passive investors to raise capital for down payment and closing costs
4. OR has enough flexibility/motivation for a seller to accept creative financing structures

---

## PROMPT TO BUILD THE MODEL

---

### System Context

You are a commercial real estate financial analyst specializing in multifamily acquisitions. Build a comprehensive **backward analysis model** that starts from my desired retirement outcome and reverse-engineers the exact deal criteria I need to find or negotiate.

---

### Section 1: Retirement Income Target (Start Here — Work Backward)

**Inputs I will provide:**
- Desired annual passive income (net after debt service, expenses, and reserves): $__________
- Target timeline to full retirement: __________ years
- Acceptable personal cash-on-cash return (minimum): __________% (suggest 8-12% as baseline)
- Number of deals I want to hold at retirement: __________ (or "single deal" if one property)
- Tax bracket / state (for after-tax income modeling): __________

**The model should calculate:**
- Required NOI per deal to hit my income target
- Maximum supportable debt service given my cash flow needs
- Implied minimum property size (units) based on market rent assumptions
- Total equity required across my portfolio to retire

---

### Section 2: Debt & LTV Constraint Validation

**Assumptions to use (adjustable):**
- Typical agency/DSCR loan LTV: 70%-75%
- Minimum DSCR required by lender: 1.20x - 1.25x
- Current market interest rates for multifamily: 6.0%-7.5% (30-yr amortization, 5-10 yr term)
- Typical loan origination/closing costs: 2%-3% of loan amount

**The model should determine:**
- Maximum loan amount the property NOI can support at required DSCR
- Whether the implied LTV from that max loan falls within conventional lending parameters
- The **spread** between going-in cap rate and cost of debt (target: 100-200+ bps positive spread)
- Breakeven occupancy after debt service
- Stress test: what happens if rates rise 100-150 bps at refinance

**Key output:** _"Does this deal pencil with conventional financing, or does the math require creative structures?"_

---

### Section 3: Investor Marketability Analysis (Syndication / JV Feasibility)

**If raising capital from passive investors, the model must validate:**

**Investor Return Thresholds (what makes this marketable):**
- Preferred return to LPs: 7%-10% annually
- Target equity multiple: 1.8x - 2.2x over 5-year hold
- Target IRR to investors: 15%-20%
- Promote/waterfall structure: ____% to GP after pref hurdle

**The model should show:**
- Total capital raise needed (down payment + closing costs + reserves + capex budget)
- Per-investor minimum (e.g., $50K-$100K units) and number of investors needed
- Projected annual cash distributions to LPs (years 1-5)
- Projected sale/refinance proceeds split at exit
- Whether the deal hits LP return targets AFTER GP promote
- **Marketing viability score:** Does this deal have a clear, simple story?
  - Value-add upside (rent bumps, expense reduction, occupancy increase)?
  - Tangible forced appreciation plan?
  - Defined exit strategy with conservative assumptions?

**Key output:** _"Can I fill a $______ raise in 30-60 days with this deal's story?"_

---

### Section 4: Creative Financing Feasibility (Seller Finance / Subject-To / Master Lease)

**If the deal doesn't attract conventional investors easily OR if I want to minimize out-of-pocket capital:**

**The model should evaluate:**
- **Seller financing viability:**
  - Implied seller carry terms that still hit my cash flow target (rate, term, balloon)
  - What LTV can the seller carry at below-market rate and still feel compensated?
  - Seller's likely remaining mortgage balance vs. equity (estimate from public data)
  - Tax benefits to seller of installment sale vs. lump sum
  - Probability scoring: Is this a motivated seller? (estate sale, tired landlord, deferred maintenance, long hold period, fully depreciated asset)

- **Subject-to / wrap scenarios:**
  - Existing debt terms (if assumable or sub-to viable)
  - Gap financing needed between existing debt and purchase price
  - Risk analysis of due-on-sale clause

- **Master lease with option to purchase:**
  - Minimum lease payment to cover seller's debt service
  - Option price / strike price at end of lease term
  - My ability to reposition and refinance during lease term

**Key output:** _"What creative structure lets me control this asset with $______ or less out of pocket?"_

---

### Section 5: Backward-Engineered Deal Criteria (Final Output)

**Given all of the above, the model should output a clear acquisition criteria box:**

| Parameter | Minimum | Target | Maximum |
|-----------|---------|--------|---------|
| Unit count | ___ | ___ | ___ |
| Purchase price | $___ | $___ | $___ |
| Going-in cap rate | ___% | ___% | ___% |
| Price per unit | $___ | $___ | $___ |
| Price per SF | $___ | $___ | $___ |
| Current occupancy | ___% | ___% | --- |
| In-place NOI | $___ | $___ | $___ |
| Stabilized NOI (post-reno) | $___ | $___ | $___ |
| Rent upside per unit | $___ | $___ | $___ |
| Total capex budget | $___ | $___ | $___ |
| Capex per unit | $___ | $___ | $___ |
| Year 1 Cash-on-Cash | ___% | ___% | --- |
| 5-Year IRR (levered) | ___% | ___% | --- |
| Exit cap rate assumption | ___% | ___% | ___% |
| Max out-of-pocket (creative) | $___ | $___ | $___ |
| Capital raise (syndication) | $___ | $___ | $___ |

---

### Section 6: Sensitivity & Scenario Modeling

**The model should include toggles/scenarios for:**
1. **Bull case:** Full rent increases achieved, exit at compressed cap, low vacancy
2. **Base case:** 80% of projected rent increases, market exit cap, normal vacancy
3. **Bear case:** Flat rents, cap rate expansion at exit, elevated vacancy/turnover
4. **Catastrophe:** Rate spike at refi + rent decline (survive or not?)

**For each scenario, show:**
- My personal cash flow
- Investor returns (if syndicated)
- Equity at exit
- Whether the deal still supports retirement timeline

---

### Section 7: Decision Framework Output

**The model should produce a simple GO / NO-GO / NEGOTIATE framework:**

- **GO (Conventional):** Deal hits all metrics with standard agency debt + investor raise
- **GO (Creative):** Deal requires creative structure but math works and seller profile fits
- **NO-GO:** Spread too thin, returns don't justify risk, can't market to investors
- **NEGOTIATE:** Deal works at $X price or with Y seller concession — here's my counteroffer basis

---

## How to Use This Prompt

1. Feed this prompt into an AI model (or use it to build a spreadsheet/financial model)
2. Input your personal retirement income target and timeline
3. Input the specific deal you're evaluating (or use it to filter MLS/broker listings)
4. The model backward-solves from your goal to tell you exactly what the deal needs to look like
5. Use the output to make offers, pitch investors, or structure creative proposals

---

## Example Quick-Start Inputs

```
Retirement income goal: $200,000/year net passive income
Timeline: 5 years
Number of properties at retirement: 2-3
Target market: [Your MSA]
Cash available for first deal: $50,000 - $150,000
Preferred strategy: Value-add with syndication OR creative seller finance
Risk tolerance: Moderate (no negative cash flow in Year 1)
```

---

## Notes on Model Philosophy

- **Conservative underwriting wins:** Use trailing 12-month actuals, not pro forma, for debt sizing
- **Always model the downside first:** If the bear case still works, the deal is solid
- **Investor psychology matters:** Simple stories raise money. "Buy at $X, spend $Y on renos, rents go from $A to $B, sell at $Z" is fundable. Complex structures are not.
- **Creative financing is a tool, not a crutch:** Use it when it genuinely benefits both parties, not to force a bad deal to work
- **Your time is equity:** If a deal requires 2 years of repositioning, model your sweat equity and management burden honestly
