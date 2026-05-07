# Feed Inventory Feature Guide
## Understanding the 3-Phase Implementation (Phase 1, 2 & 3)

---

## 🎯 What You Can Do Now

The feed inventory feature streamlines how you track, schedule, and report on feed purchases and consumption across your farm. It connects purchasing, daily feeding activities, and cost analysis into one unified system.

---

## 📋 Phase 1: Foundation — Feed Tracking & Consumption

### What This Phase Added
- **Feed lot management** — Record when you buy feed (quantity, price, date, supplier)
- **Consumption logging** — Record when flocks eat feed (which feed, how much, which flock, reason)
- **Stock tracking** — Automatically calculates remaining feed per lot

### How to Use It

#### Create a Feed Lot (Record a Purchase)
1. Go to **Inventory** → **Feed Lots** tab
2. Click **"New lot"**
3. Fill in:
   - **Feed type** — Select from your available feed types (hay, grain, pellets, etc.)
   - **Quantity** — How many kilos you bought
   - **Unit price** — Cost per kilo (e.g., $5.50/kg)
   - **Purchase date** — When you bought it
   - **Supplier** — Optional notes on where it came from
4. Click **Create** — The system records the lot and automatically shows remaining stock

#### Log Feed Consumed
1. Go to **Inventory** → **Feed Log** tab
2. Click **"Log feeding"**
3. Fill in:
   - **Feed type** — Which feed was consumed
   - **Flock** — Which flock ate it (or leave blank for waste/transfer)
   - **Reason** — Feeding, Waste, Transfer, or Adjustment
   - **Quantity** — How many kilos
   - **Date** — When this happened
4. Click **Create** — The system deducts from the lot and tracks consumption

#### View Stock Status
- In the **Feed Lots** tab, each lot shows:
  - **"X / Y kg remaining"** — How much is left from the original purchase
  - Example: "48 / 100 kg remaining" means you've used 52 kg

---

## ⏰ Phase 2: Automation — Feeding Schedules & Smart Logging

### What This Phase Added
- **Feeding schedules** — Pre-define daily feeding targets per flock
- **Smart feeding action** — Log today's feeding in one click based on schedule
- **Date-range planning** — Set when schedules are active (start date → end date)

### How to Use It

#### Create a Feeding Schedule
1. Go to **Inventory** → **Schedules** tab
2. Click **"New schedule"**
3. Fill in:
   - **Flock** — Which flock should eat this feed
   - **Feed type** — What feed to use
   - **Daily quantity** — Show many kg per day (e.g., 5 kg/day)
   - **Active from** — When schedule starts (date picker)
   - **Active to** — When schedule ends, optional (leave blank if ongoing)
4. Click **Create** — Schedule is ready

#### View & Manage Schedules
- The **Schedules** tab shows all active schedules
- Each schedule displays:
  - **Flock name** and **Feed type**
  - **5 kg / day** (the daily target)
  - **Jan 01 2026 to Ongoing** (active period, or end date if closed)
  - Status badge: **Active** or **Inactive**

#### Close a Schedule
1. In the **Schedules** tab, find an active schedule
2. Click **"Close"** button
3. The schedule's **Active to** date is set to today
4. Future feeding will use only active schedules

#### Log Today's Feeding (Quick Action)
1. Go to a specific **Flock** detail page
2. In the top section, click **"Log today's feeding"**
3. The system automatically:
   - Finds all active feeding schedules for that flock
   - Uses FIFO (First-In-First-Out) to select which lots to draw from
   - Records the consumption with today's date
   - Deducts from lot stock
4. A success message shows what was logged

**Example:** If you have two active schedules (5 kg hay, 2 kg grain), clicking once logs both in one action.

---

## 💰 Phase 3: Reporting — Financial Integration & Cost Analysis

### What This Phase Added
- **Auto-created expenses** — Feed purchases automatically link to your expense ledger
- **Cost-by-flock report** — See how much each flock costs to feed (broken down by feed type)
- **Cost-by-lot report** — Deep dive into a specific purchase: who ate it, how much, total cost
- **FIFO costing** — All costs use the actual prices from when feed was purchased

### How to Use It

#### View Cost by Flock Report
1. Go to **Inventory** → **Reports** tab
2. In **Report filters**, optionally set:
   - **From / To** dates to narrow the time period
   - **Flock** dropdown to focus on one flock (or "All")
3. The **Cost by flock** card shows:
   - Each flock's total feed cost (e.g., **$150.50**)
   - Total quantity consumed (e.g., **500 kg**)
   - Breakdown by feed type:
     - **Hay: 300 kg** (cost calculation)
     - **Grain: 200 kg** (cost calculation)

**What this tells you:**
- Which flocks are most expensive to feed
- How your costs change over time
- Cost drivers (is grain more expensive than hay?)

#### View Cost by Lot Report
1. Go to **Inventory** → **Reports** tab
2. Select a **Lot** from the dropdown (shows all your purchases)
3. The **Cost by lot** card shows:
   - **Purchased:** 100 kg (how much you bought)
   - **Drawn:** 85 kg (how much was consumed)
   - **Remaining:** 15 kg (still in stock)
   - **Total Cost:** $425.00 (what you paid for what was used)
   - **Unit Cost:** $5.00/kg (your actual cost per kg)

4. Below that, a **"Consumption by flock"** table shows:
   - **Flock A:** 50 kg ($250.00)
   - **Flock B:** 35 kg ($175.00)
   - **Waste/Transfers:** (if any)

**What this tells you:**
- How a specific feed batch was used across flocks
- Cost per flock for that specific lot
- Remaining stock and when you'll need to reorder

#### Track Feed Purchases in Your Expense Ledger
1. Go to **Financial** (Expenses)
2. The ledger now shows auto-created feed purchase rows:
   - **Description:** "Feed purchase: Hay" or "Feed purchase: Grain"
   - **Amount:** Exact cost based on qty × unit price (e.g., $250.00)
   - **Date:** Purchase date
   - **Species:** Marked as **"Farm-wide"** (feed benefits all flocks)

---

## 🔄 How the Phases Work Together

### The Complete Workflow

1. **Phase 1: You buy feed**
   - Create a Feed Lot (quantity, price, date)
   - System records the purchase and tracks stock
   
2. **Phase 2: You plan and execute feeding**
   - Create Feeding Schedules (daily targets per flock)
   - Click "Log today's feeding" to record consumption
   - System deducts from lots and tracks which flocks ate what
   
3. **Phase 3: You analyze costs**
   - View **Cost by Flock** to see which flocks are expensive
   - View **Cost by Lot** to see how a batch was used
   - Review **Expense Ledger** to see feed purchases alongside other farm costs

### Real Example: A Month of Feeding

**Day 1 (Phase 1):**
- You buy 100 kg of hay @ $5/kg = $500
- System creates Lot #1 and expense record

**Day 2–10 (Phase 2):**
- You create schedule: Flock A gets 5 kg hay/day
- Each day, you click "Log today's feeding"
- Each click: logs 5 kg, deducts from Lot #1, records cost

**Day 31 (Phase 3):**
- You run the **Cost by Flock** report for the month
- Shows: Flock A consumed 150 kg of hay for $750 total
- You run **Cost by Lot** for Lot #1
- Shows: 100 kg purchased, 100 kg drawn, $0 remaining stock

---

## 🎓 Key Concepts Explained

### FIFO (First-In, First-Out)
When logging feeding, the system automatically uses the oldest feed first. 
- If you have Lot #1 (100 kg, $5/kg) and Lot #2 (100 kg, $8/kg)
- Logging 150 kg uses: 100 kg from Lot #1 ($500) + 50 kg from Lot #2 ($400)
- This matches real-world usage and ensures freshest feed is used last

### Snapshot Costing
Feed costs are locked at purchase time and don't change later.
- Buy hay @ $5/kg, use it next month
- Even if hay price drops to $3/kg, your consumption still costs $5/kg
- This gives accurate historical cost reporting

### Active Period
Schedules have a start date (required) and end date (optional).
- **Active from Jan 1, Active to Jan 31** = runs only in January
- **Active from Jan 1, Active to (blank)** = runs from Jan 1 onwards indefinitely
- Closing a schedule sets today as the end date automatically

---

## 📊 Questions You Can Answer Now

1. **How much did it cost to feed each flock this month?**
   → Cost by Flock report

2. **Which feed type is most expensive?**
   → Cost by Flock report, by feed type breakdown

3. **What happened to that $500 batch of hay I bought?**
   → Cost by Lot report for that specific lot

4. **Is Flock A more expensive to feed than Flock B?**
   → Compare Cost by Flock rows

5. **How much feed stock do I have left?**
   → Feed Lots tab shows remaining per lot

6. **When should I reorder?**
   → Check remaining stock in Feed Lots + consumption rate from Cost by Flock

---

## 💡 Pro Tips

✅ **Create feeding schedules for consistency** — Don't manually log each day; set schedules and use one-click logging

✅ **Use date ranges to track seasonal changes** — Close summer schedules, create winter ones

✅ **Check Cost by Flock monthly** — Spot trends and identify which flocks are becoming expensive

✅ **Review Cost by Lot after consumption** — Verify everything was tracked correctly

✅ **Use "Waste" reason for spoilage** — So reports accurately show feed cost vs. consumption

---

## ❓ Troubleshooting

**Q: "Log today's feeding" doesn't work**
A: Check that:
- You have at least one active feeding schedule for that flock (it won't appear unless active)
- You have feed stock available (can't feed if out of stock)

**Q: Cost by Flock report shows nothing**
A: 
- Check that you've actually logged consumption (it won't show without logs)
- Verify the date range includes your feeding dates

**Q: A schedule shows "Inactive" even though I just created it**
A: 
- Verify today's date is within the Active from → Active to range
- Schedules only show as "Active" if today falls in that window

---

## 🚀 Next Steps

1. **Start simple:** Create one feed lot and one flock's schedule
2. **Log regularly:** Use "Log today's feeding" consistently
3. **Review weekly:** Check Cost by Flock to track spending
4. **Refine:** Adjust schedules as you learn your actual consumption rates
