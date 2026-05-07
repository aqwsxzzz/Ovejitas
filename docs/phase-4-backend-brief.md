# Phase 4 Backend Brief: Flock Profitability & Economics
## For Backend Dev (Using Claude)

---

## 🎯 Context & Vision

### The Big Picture
We're building a comprehensive farm economics system that answers: **"Which flocks are profitable, and which ones are costing us money?"**

Currently (Phases 1-3):
- ✅ We track **feed purchases** and **daily consumption per flock** 
- ✅ We calculate **feed cost per flock**
- ✅ We track **egg production per flock per day**

But we're **missing the connection**: We can't yet compare daily income (eggs sold) vs. daily expenses (feed) per flock.

### Original Idea (User's Request in Spanish)
> "La idea era que se pudiera llevar un registro de gastos por diferentes tipos estos, entre ellos comida, y que se pudiera llevar un control de la cantidad que se usa y demas por cada flock/dia. Tambien se pudiera registrar la cantidad de huevos que cada flock de gallinas registra por dia... para calcular/estudiar el beneficio de cada flock."

**Translation:** Track expenses by type (food, etc.), monitor consumption per flock/day, record egg production per day per flock, and calculate profit/loss per flock to study which ones are viable.

---

## 📋 Phase 4 Requirements

### 1. **Global Egg Pricing Configuration**

**What we need:**
- A way to store egg unit prices globally (not per-flock, not per-species, truly global)
- Eggs are counted by "Maple" stacks (30 eggs = 1 stack)
- Therefore: Price is per egg, not per stack

**Data Model:**
```typescript
interface IEggPricingConfig {
  id: string;
  farmId: string;
  pricePerEgg: number; // e.g., $0.50
  currency: string; // e.g., "USD"
  effectiveFrom: Date;
  effectiveTo: Date | null; // null = ongoing
  createdAt: Date;
  updatedAt: Date;
}
```

**Endpoints needed:**
- `GET /farms/{farmId}/egg-pricing` — Fetch current egg price
- `POST /farms/{farmId}/egg-pricing` — Set/update egg price (only Maple version for now)
- Endpoint should return only the **active** pricing rule (where today falls between effectiveFrom/effectiveTo)

**Notes:**
- Store pricing with date ranges so we can have historical pricing changes
- For now, simple implementation: just one active price per farm at any time
- Examples:
  - Jan 1 – Jan 31: $0.50/egg
  - Feb 1 – ongoing: $0.55/egg (price increase happened in Feb)

---

### 2. **Profitability Calculation Endpoint**

**What we need:**
An endpoint that calculates profit/loss per flock for a given period.

**Input:**
```typescript
{
  farmId: string;
  flockId?: string; // optional: if provided, calculate for ONE flock; if omitted, calculate for ALL flocks
  period: "daily" | "weekly" | "monthly";
  from: string; // ISO date (YYYY-MM-DD)
  to: string; // ISO date (YYYY-MM-DD)
}
```

**Output:**
```typescript
interface IFlockProfitabilityReport {
  farmId: string;
  reportPeriod: "daily" | "weekly" | "monthly";
  dateRange: {
    from: string;
    to: string;
  };
  flocks: IFlockProfitabilityRow[];
}

interface IFlockProfitabilityRow {
  flockId: string;
  flockName: string;
  speciesId: string;
  speciesName: string;
  
  // Egg income
  eggsCollected: number; // total eggs in period
  eggsCollectedStacks: number; // eggsCollected / 30
  eggPrice: number; // price per egg at time of collection (or current if collection date older)
  totalEggRevenue: number; // eggsCollected × eggPrice
  
  // Feed expenses
  feedQuantity: number; // total kg consumed
  totalFeedCost: number; // from existing feed-report costs
  
  // Profitability
  totalExpenses: number; // for now, only feed (= totalFeedCost)
  profit: number; // totalEggRevenue - totalExpenses
  profitMargin: number; // profit / totalEggRevenue (as percentage, -100 to +inf)
  
  // Daily/weekly/monthly breakdown (if requested)
  periodBreakdown?: IPeriodData[];
}

interface IPeriodData {
  period: string; // "2026-01-01" for daily, "2026-W01" for weekly, "2026-01" for monthly
  eggsCollected: number;
  eggRevenue: number;
  feedCost: number;
  profit: number;
  profitMargin: number;
}
```

**Endpoint:**
- `POST /farms/{farmId}/reports/flock-profitability` — Calculate profitability report
- Or: `GET /farms/{farmId}/reports/flock-profitability?period=daily&from=2026-01-01&to=2026-01-31&flockId=abc123`

---

### 3. **Data Sources & Calculation Logic**

**Egg Revenue:**
- Query: `egg_collections` table filtered by `flockId`, `farmId`, date range
- If multiple egg collections per day for same flock, sum them
- Multiply by current farm egg price
- Consider: **Eggs on Jan 15 should use Jan 15's egg price, not today's price**
  - This means egg pricing should be historicized (see pricing config above)
  - Alternative: Store egg price in egg_collections at collection time? (Discuss with frontend)

**Feed Expenses:**
- Already exists: `getFeedCostByFlock()` endpoint returns cost per flock for date range
- Reuse that logic or create new query: `feed_costs` aggregated by flock for date range
- Sum all feed types per flock

**Profit Calculation:**
```
Profit = Total Egg Revenue - Total Feed Cost
Margin % = Profit / Total Egg Revenue × 100
  (e.g., $100 profit / $500 revenue = 20% margin)
```

---

### 4. **Period Breakdown Logic**

Support three period types:

**Daily:**
- Each row = one calendar day
- Example output: "2026-01-15": {eggs: 30, revenue: $15, cost: $8, profit: $7}

**Weekly:**
- ISO week format: "2026-W03" = week 3 of 2026 (Jan 19–25)
- Each row = one full week Mon–Sun
- Sum all eggs/costs within that week

**Monthly:**
- Format: "2026-01" = January 2026
- Each row = all data for that calendar month

---

## 🔧 Implementation Notes

### Backend Architecture

**Option A: New endpoint only**
- Create new endpoint: `POST /reports/flock-profitability`
- Queries existing `egg_collections` + existing `feed_costs`
- No schema changes needed

**Option B: Refactor with cached data** (future optimization)
- Pre-calculate daily/weekly/monthly profitability and cache results
- Faster reporting for large date ranges
- Requires: new `flock_profitability_cache` table + cron job to refresh

→ **Recommend: Start with Option A** (simpler, no new tables). If slow, optimize later.

---

### Egg Pricing Considerations

**Decision: When to read egg price?**

1. **At collection time** (store price in egg_collections row)
   - Pro: Historical accuracy, fast queries
   - Con: Data duplication, need migration

2. **At report time** (join with egg_pricing config)
   - Pro: Single source of truth, can retroactively change pricing logic
   - Con: Slightly slower (join operation)

→ **Recommend: Option 2 for now** (simpler, no data duplication)
- At report time: For each egg collection, find the active egg price on that collection's date
- Query: `SELECT * FROM egg_pricing WHERE farmId = X AND effectiveFrom <= collectionDate AND (effectiveTo IS NULL OR effectiveTo >= collectionDate)`

---

### Edge Cases to Handle

1. **No egg collections in period** → Return row with 0 eggs, 0 revenue, but full feed cost
   - Flock still has negative profit from feed cost alone

2. **No feed logs in period** → Return row with egg revenue but 0 cost
   - Flock shows as profitable (only eggs earned, no feed tracked)

3. **No egg pricing configured** → Return error or default to $0?
   - Recommend: Return error "Egg pricing not configured for this farm"

4. **Flock deleted between period start and end** → Should query return historical flock name?
   - Recommend: Yes, store flock name in report (in case flock is deleted later)

5. **Multiple egg prices in one month** → Use price active on each collection date
   - Should be automatic if using `effectiveFrom/effectiveTo` join

---

## 📊 Frontend Integration Points

**Frontend will call this endpoint for:**
1. Page load: Fetch profitability for "daily" period for current month
2. Period toggle: Re-fetch data for "weekly" or "monthly"
3. Flock detail: Fetch profitability for that specific flock
4. Date range change: Re-fetch with new from/to dates

**Frontend expects:**
- Fast response (< 500ms) for typical farm (10–50 flocks)
- Stable period keys ("2026-01-15" for daily, "2026-W03" for weekly, "2026-01" for monthly)
- Null-safe values (no undefined, use 0 for missing data)

---

## 🎯 Recommendations & Future Phases

### Phase 4A (Current – Eggs vs. Feed Only)
- ✅ Global egg pricing config
- ✅ Profitability endpoint (eggs vs. feed)
- ✅ Three period types (daily/weekly/monthly)
- ✅ Single flock or all flocks

### Phase 4B (Future – Add Other Expenses)
- Add `"Other expenses" per flock` (veterinary, equipment, labor)
- Include in profit calculation: `Profit = Revenue - Feed - Other`
- Query: `expenses` table filtered by flock, sum all except feed

### Phase 4C (Future – Comparative Analysis)
- Add endpoints: "Top 5 most profitable flocks," "Top 5 least profitable"
- Add alerts: "Flock X has negative margin 3 weeks running"
- Add trends: "Flock X profit trending up/down"

### Phase 4D (Future – Production Optimization)
- Cost per egg: `totalFeedCost / eggsCollected`
- Benchmark: "Industry avg = $0.15/egg, you = $0.20/egg"
- Recommendations: "Reduce feed cost by $X to break even"

---

## ❓ Questions for Backend Dev

1. **Egg pricing storage:** Should we add `egg_pricing` table, or just a farm config (one global price)?
   - Recommend: Table with date ranges (so we can track price history)

2. **Performance:** Will joining `egg_collections` + `egg_pricing` be fast enough?
   - Expected: < 500ms for 10 flocks, 1 year of data
   - If slow, can we pre-calculate daily summaries?

3. **Existing feed costs:** Can we reuse `getFeedCostByFlock()` logic for this?
   - Or should we create a separate `_coreFlockProfitability()` internal function to avoid circular dependencies?

4. **Null flocks in egg collections:** Does the egg_collections table have flockId?
   - What if eggs collected but flockId not yet assigned?
   - Should profitability query skip those rows, or group as "Unassigned"?

---

## 📝 Summary

**What we're building:**
- A profitability report per flock showing: eggs sold (revenue) vs. feed cost (expense) = profit/loss
- Three period views: daily, weekly, monthly
- Global egg pricing (configurable, with date ranges)
- One endpoint that feeds all three periods

**Why it matters:**
- Identifies which flocks are worth keeping, which are dead weight
- Guides decisions: "Flock A profitable, expand it. Flock B negative, reduce or optimize feed."
- Enables financial analysis of the farm business

**Timeline estimate:**
- Egg pricing config: 2–3 hours
- Profitability endpoint + logic: 4–5 hours
- Testing & edge cases: 2–3 hours
- **Total: ~9–11 hours** (or less if reusing existing feed_cost logic)

---

## 🚀 Next Steps

1. Backend (you): Review this brief, ask questions, propose schema
2. Frontend (me): Design UI mockup for profitability dashboard
3. Backend: Implement Phase 4A endpoints
4. Frontend: Wire up to UI, test with real data
5. Deploy & gather feedback

Let's go! 🎯
