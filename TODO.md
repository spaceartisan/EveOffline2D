# EVE Offline 2D - TODO List

## High Priority Issues

_(None currently)_

## Medium Priority Issues

### 2. Cargo Overflow During Ship Switching
**File:** `main.js` lines 2160-2166  
**Issue:** When switching to a smaller ship, cargo that doesn't fit is silently dropped with no warning to player.  
**Fix Options:**
- Prevent ship switching when cargo exceeds new ship capacity (with error message)
- Transfer excess cargo to station inventory automatically
- Show warning dialog before allowing switch

## Low Priority Issues

### 4. Update Warp Cooldown Documentation
**File:** `CUSTOMIZATION_GUIDE.md`  
**Issue:** Code correctly sets cooldown to 600 frames (10 seconds), but documentation may say 5 seconds  
**Fix:** Update documentation to reflect 10 second cooldown as intended

## Informational (No Action Needed)

### 6. Multiple Cargo Tracking Methods
**Status:** Working as intended  
**Note:** cargo.cargoUsed is updated via += and -= in 7 places, but updateCargoDisplay() recalculates from scratch to prevent drift. This prevents floating-point errors.

### 7. Server Binds to 0.0.0.0
**File:** `server.js` line 4  
**Status:** Intentional for testing  
**Note:** Allows external network access. Consider changing to 'localhost' for production.

---

## Completed/Fixed Issues
- ✅ Documentation discrepancies fixed (README, index.html, CUSTOMIZATION_GUIDE)
- ✅ Starting credits documented as testing value (500M ISK)
- ✅ Removed unused miningYield property from ships.js createShipFromTemplate function
- ✅ Confirmed mining balance is correct (Miner I: 12 ore/min, Miner II: 36 ore/min)
- ✅ Added BGM error handler to gracefully handle missing audio file
- ✅ Implemented customizable station inventories (forSale and shipsForSale arrays)
- ✅ Added Ibis corvette class (free, available at all stations)
- ✅ Implemented asteroid respawn system (5 minute timer)
- ✅ Changed NPC respawn timer from 30 seconds to 1 minute
- ✅ Added ship repair service at stations (100 ISK per damage point)